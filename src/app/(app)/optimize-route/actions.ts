'use server';

import { optimizeDeliveryRoute, OptimizeDeliveryRouteInput, OptimizeDeliveryRouteOutput } from '@/ai/flows/optimize-delivery-route';
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
  
  // The form values should be compatible with the Genkit flow input after validation
  const input: OptimizeDeliveryRouteInput = validationResult.data;

  try {
    const result = await optimizeDeliveryRoute(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error optimizing route:", error);
    // Check if error is an instance of Error to safely access message property
    const errorMessage = error instanceof Error ? error.message : "Error desconocido al optimizar la ruta.";
    return { success: false, error: errorMessage };
  }
}
