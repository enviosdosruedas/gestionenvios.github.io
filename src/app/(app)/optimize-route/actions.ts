'use server';

import { optimizeDeliveryRoute, type OptimizeDeliveryRouteInput, type OptimizeDeliveryRouteOutput } from '@/ai/flows/optimize-delivery-route';
import type { ZodError } from 'zod';
import { OptimizeRouteFormSchema, type OptimizeRouteFormValues } from './optimize-route.schema';


interface ActionResult {
  success: boolean;
  data?: OptimizeDeliveryRouteOutput;
  error?: string | ReturnType<ZodError<OptimizeRouteFormValues>['flatten']>;
}

export async function optimizeRouteAction(values: OptimizeRouteFormValues): Promise<ActionResult> {
  const validationResult = OptimizeRouteFormSchema.safeParse(values);

  if (!validationResult.success) {
    return { success: false, error: validationResult.error.flatten() };
  }
  
  const { 
    startLocation, 
    averageVehicleSpeed, 
    newDeliveries, 
    vehicleCapacity, 
    overallTimeWindowStart, 
    overallTimeWindowEnd 
  } = validationResult.data;

  // Map form data to the Genkit flow input
  const input: OptimizeDeliveryRouteInput = {
    startLocation,
    averageVehicleSpeed,
    newDeliveries: newDeliveries.map((stop, index) => ({ // Ensure mapping is correct
      id: `new-stop-${index + 1}`, // Assign a temporary ID or use a real one if available
      address: stop.address,
      priority: stop.priority,
      // timeWindowStart and timeWindowEnd per stop are not in the current form,
      // but the flow schema allows them to be optional.
    })),
    vehicleCapacity,
    overallTimeWindowStart,
    overallTimeWindowEnd,
    // ongoingDeliveries and trafficInfo are not collected by the form currently
    // So they will be undefined, which is handled by the flow's optional schema fields
  };

  try {
    const result = await optimizeDeliveryRoute(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error optimizing route:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido al optimizar la ruta.";
    return { success: false, error: errorMessage };
  }
}
