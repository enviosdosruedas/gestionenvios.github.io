
import { z } from 'zod';

export const NewDeliveryStopSchema = z.object({
  address: z.string().min(1, 'La dirección es requerida.'),
  priority: z.coerce.number().int().min(1, 'La prioridad debe ser un número positivo.'),
  // Time windows per stop are optional in the flow, and the form currently only has global time windows.
  // If individual time windows per stop are needed in the form, add them here.
});

export const OptimizeRouteFormSchema = z.object({
  startLocation: z.string().min(1, 'La ubicación de partida es requerida.'),
  averageVehicleSpeed: z.coerce.number().positive('La velocidad promedio debe ser un número positivo.'),
  newDeliveries: z.array(NewDeliveryStopSchema).min(1, 'Debe ingresar al menos una parada nueva.'),
  vehicleCapacity: z.coerce.number().min(1, 'La capacidad del vehículo es requerida.'),
  overallTimeWindowStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM).'),
  overallTimeWindowEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM).'),
  // ongoingDeliveries and trafficInfo are part of the Genkit flow but not collected in this form yet.
  // If they need to be collected, add them here.
}).refine(data => {
    if (!data.overallTimeWindowStart || !data.overallTimeWindowEnd) return true;
    try {
        const startHour = parseInt(data.overallTimeWindowStart.split(':')[0], 10);
        const startMinute = parseInt(data.overallTimeWindowStart.split(':')[1], 10);
        const endHour = parseInt(data.overallTimeWindowEnd.split(':')[0], 10);
        const endMinute = parseInt(data.overallTimeWindowEnd.split(':')[1], 10);

        if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
            return true; 
        }
        
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;
        
        return endTime > startTime;
    } catch (e) {
        return true; 
    }
}, {
    message: "La hora de fin debe ser posterior a la hora de inicio.",
    path: ["overallTimeWindowEnd"],
});

export type OptimizeRouteFormValues = z.infer<typeof OptimizeRouteFormSchema>;
