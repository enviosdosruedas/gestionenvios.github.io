
'use server';

/**
 * @fileOverview A delivery route optimization AI agent.
 *
 * - optimizeDeliveryRoute - A function that handles the delivery route optimization process.
 * - OptimizeDeliveryRouteInput - The input type for the optimizeDeliveryRoute function.
 * - OptimizeDeliveryRouteOutput - The return type for the optimizeDeliveryRoute function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OngoingDeliverySchema = z.object({
  id: z.string().describe('Identifier of the ongoing delivery.'),
  address: z.string().describe('Address of the ongoing delivery.'),
  startTime: z.string().describe('Start time of the ongoing delivery (HH:MM).'),
  estimatedDeliveryTime: z.string().describe('Estimated delivery time for the ongoing delivery (HH:MM).'),
});

const NewDeliverySchema = z.object({
  id: z.string().optional().describe('Identifier of the new delivery (e.g., order ID).'),
  address: z.string().describe('The delivery address.'),
  priority: z.number().describe('The priority of this stop (higher is more important).'),
  // Optional time window per stop, if not provided, global time window applies
  timeWindowStart: z.string().optional().describe('Specific start of the delivery time window for this stop (HH:MM).'),
  timeWindowEnd: z.string().optional().describe('Specific end of the delivery time window for this stop (HH:MM).'),
});

const OptimizeDeliveryRouteInputSchema = z.object({
  startLocation: z.string().describe('The starting address for the delivery route.'),
  averageVehicleSpeed: z.number().positive().describe('The average speed of the delivery vehicle in km/h.'),
  ongoingDeliveries: z.array(OngoingDeliverySchema).optional().describe('A list of deliveries already in progress.'),
  newDeliveries: z.array(NewDeliverySchema).min(1).describe('A list of new deliveries to plan.'),
  vehicleCapacity: z.number().describe('The maximum capacity of the delivery vehicle (e.g., number of items, weight).'),
  overallTimeWindowStart: z.string().describe('The general start of the delivery time window for new deliveries (HH:MM).'),
  overallTimeWindowEnd: z.string().describe('The general end of the delivery time window for new deliveries (HH:MM).'),
  trafficInfo: z.string().optional().describe('Current traffic information (e.g., "heavy traffic on main street").'),
});
export type OptimizeDeliveryRouteInput = z.infer<typeof OptimizeDeliveryRouteInputSchema>;

const OptimizedStopSchema = z.object({
  deliveryId: z.string().describe('Identifier of the delivery (original ID if provided, or generated).'),
  address: z.string().describe('The delivery address.'),
  estimatedArrivalTime: z.string().describe('Estimated arrival time at this stop (HH:MM).'),
  notes: z.string().optional().describe('Any notes related to this stop, e.g., if it was an ongoing delivery.')
});

const OptimizeDeliveryRouteOutputSchema = z.object({
  deliveryOrder: z.array(OptimizedStopSchema).describe('The optimized route, with stops in the suggested order, including estimated arrival times.'),
  totalDistance: z.string().describe('The estimated total travel distance for the optimized route (e.g., "50 km").'),
  totalTime: z.string().describe('The estimated total travel time for the optimized route (e.g., "2 hours 30 minutes").'),
  warnings: z.array(z.string()).describe('Any warnings or errors encountered during optimization (e.g., "Delivery X may be late due to traffic", "Could not meet time window for Delivery Y").'),
});
export type OptimizeDeliveryRouteOutput = z.infer<typeof OptimizeDeliveryRouteOutputSchema>;

export async function optimizeDeliveryRoute(
  input: OptimizeDeliveryRouteInput
): Promise<OptimizeDeliveryRouteOutput> {
  return optimizeDeliveryRouteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeDeliveryRoutePrompt',
  input: {schema: OptimizeDeliveryRouteInputSchema},
  output: {schema: OptimizeDeliveryRouteOutputSchema},
  prompt: `You are an expert route optimization specialist. Your goal is to create the most efficient delivery route.
Prioritize minimizing total delivery time, then minimizing total distance.
Strictly respect specified time windows for each delivery. If a time window cannot be met, note it as a warning.
Higher priority deliveries should be scheduled earlier if possible, without violating time windows.

Starting Location: {{startLocation}}
Average Vehicle Speed: {{averageVehicleSpeed}} km/h
Vehicle Capacity: {{vehicleCapacity}} (This is a general capacity, assume it's enough for all items unless specified otherwise per item, which is not the case here.)
Overall Delivery Time Window for New Deliveries: {{overallTimeWindowStart}} - {{overallTimeWindowEnd}}

{{#if trafficInfo}}
Current Traffic Information: {{trafficInfo}}
{{/if}}

{{#if ongoingDeliveries}}
Ongoing Deliveries (These must be integrated into the route and their order relative to each other, if implied by their ETAs, should be maintained. Their ETAs are estimates and may be adjusted slightly if it significantly optimizes the overall route for new deliveries, but they are already in progress.):
{{#each ongoingDeliveries}}
- ID: {{this.id}}, Address: {{this.address}}, Started: {{this.startTime}}, Original ETA: {{this.estimatedDeliveryTime}}
{{/each}}
{{/if}}

New Deliveries to Plan:
{{#each newDeliveries}}
- {{#if this.id}}ID: {{this.id}}, {{/if}}Address: {{this.address}}, Priority: {{this.priority}}{{#if this.timeWindowStart}} (Window: {{this.timeWindowStart}} - {{this.timeWindowEnd}}){{/if}}
{{/each}}

Based on the above information, provide the following:
1.  'deliveryOrder': An ordered list of all deliveries (ongoing and new). For each stop, include:
    *   'deliveryId': The original ID of the delivery if available, or a generated one like "NewDelivery-X" or "OngoingDelivery-Y".
    *   'address': The full address of the stop.
    *   'estimatedArrivalTime': The new estimated arrival time (HH:MM).
    *   'notes': (Optional) Specify if this was an "Ongoing delivery" or any issues related to its original ETA.
2.  'totalDistance': The estimated total distance for the entire route.
3.  'totalTime': The estimated total time to complete the entire route from start to finish.
4.  'warnings': A list of any warnings, such as:
    *   Inability to meet a specific delivery's time window (state which delivery and its window).
    *   Potential delays due to traffic (if traffic info was provided).
    *   Any other issues affecting the route or delivery times.

If an ID was not provided for a new delivery, you can assign a placeholder like "NewStop-1", "NewStop-2", etc., in the 'deliveryId' field of the output. For ongoing deliveries, use their provided ID and add a note that it was an ongoing delivery.

Output should be a valid JSON object.
`,
});

const optimizeDeliveryRouteFlow = ai.defineFlow(
  {
    name: 'optimizeDeliveryRouteFlow',
    inputSchema: OptimizeDeliveryRouteInputSchema,
    outputSchema: OptimizeDeliveryRouteOutputSchema,
  },
  async input => {
    // Ensure newDeliveries have some form of ID for the prompt if not provided
    const processedInput = {
      ...input,
      newDeliveries: input.newDeliveries.map((delivery, index) => ({
        ...delivery,
        id: delivery.id || `NewStop-${index + 1}`, // Assign a temporary ID if none exists
      })),
    };
    const {output} = await prompt(processedInput);
    return output!;
  }
);
