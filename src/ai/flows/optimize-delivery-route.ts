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

const OptimizeDeliveryRouteInputSchema = z.object({
  stops: z
    .array(
      z.object({
        address: z.string().describe('The delivery address.'),
        priority: z.number().describe('The priority of this stop (higher is more important).'),
      })
    )
    .describe('A list of delivery stops with their addresses and priorities.'),
  vehicleCapacity: z
    .number()
    .describe('The maximum capacity of the delivery vehicle in terms of weight or volume.'),
  timeWindowStart: z.string().describe('The start of the delivery time window (e.g., 9:00 AM).'),
  timeWindowEnd: z.string().describe('The end of the delivery time window (e.g., 5:00 PM).'),
});
export type OptimizeDeliveryRouteInput = z.infer<typeof OptimizeDeliveryRouteInputSchema>;

const OptimizeDeliveryRouteOutputSchema = z.object({
  optimizedRoute: z
    .array(
      z.object({
        address: z.string().describe('The delivery address.'),
        priority: z.number().describe('The priority of this stop.'),
      })
    )
    .describe('The optimized route, with stops in the suggested order.'),
  estimatedTravelTime: z.string().describe('The estimated total travel time for the optimized route.'),
  estimatedTravelDistance: z.string().describe('The estimated total travel distance for the optimized route.'),
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
  prompt: `You are an expert route optimization specialist. Given a list of delivery stops,
your task is to find the most efficient route, minimizing travel time and distance.
Consider the priority of each stop, the capacity of the delivery vehicle, and the specified time window.

Delivery Stops:
{{#each stops}}
- Address: {{this.address}}, Priority: {{this.priority}}
{{/each}}

Vehicle Capacity: {{vehicleCapacity}}
Time Window: {{timeWindowStart}} - {{timeWindowEnd}}

Provide the optimized route, estimated travel time, and estimated travel distance.

Prioritize stops with higher priority values.
Ensure that the route respects the vehicle's capacity and the specified time window.

Output should be formatted as a JSON object.
`,
});

const optimizeDeliveryRouteFlow = ai.defineFlow(
  {
    name: 'optimizeDeliveryRouteFlow',
    inputSchema: OptimizeDeliveryRouteInputSchema,
    outputSchema: OptimizeDeliveryRouteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
