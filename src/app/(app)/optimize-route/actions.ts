'use server';

import { optimizeDeliveryRoute, OptimizeDeliveryRouteInput, OptimizeDeliveryRouteOutput } from '@/ai/flows/optimize-delivery-route';
import { z } from 'zod';

const StopSchema = z.object({
  address: z.string().min(1, 'La dirección es requerida.'),
  priority: z.coerce.number().int().min(1, 'La prioridad debe ser un número positivo.'),
});

export const OptimizeRouteFormSchema = z.object({
  stops: z.array(StopSchema).min(1, 'Debe ingresar al menos una parada.'),
  vehicleCapacity: z.coerce.number().min(1, 'La capacidad del vehículo es requerida.'),
  timeWindowStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM).'),
  timeWindowEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM).'),
}).refine(data => {
    const start = parseInt(data.timeWindowStart.replace(':', ''), 10);
    const end = parseInt(data.timeWindowEnd.replace(':', ''), 10);
    return end > start;
}, {
    message: "La hora de fin debe ser posterior a la hora de inicio.",
    path: ["timeWindowEnd"],
});


export type OptimizeRouteFormValues = z.infer<typeof OptimizeRouteFormSchema>;

interface ActionResult {
  success: boolean;
  data?: OptimizeDeliveryRouteOutput;
  error?: string | Zod.ZodError<OptimizeDeliveryRouteInput>;
}

export async function optimizeRouteAction(values: OptimizeRouteFormValues): Promise<ActionResult> {
  const validationResult = OptimizeRouteFormSchema.safeParse(values);

  if (!validationResult.success) {
    return { success: false, error: validationResult.error.flatten() };
  }
  
  const input: OptimizeDeliveryRouteInput = validationResult.data;

  try {
    const result = await optimizeDeliveryRoute(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error optimizing route:", error);
    return { success: false, error: error instanceof Error ? error.message : "Error desconocido al optimizar la ruta." };
  }
}
