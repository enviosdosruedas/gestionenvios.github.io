
import { z } from 'zod';

export const NewDeliveryStopSchema = z.object({
  address: z.string().min(1, 'La dirección es requerida.'),
  priority: z.coerce.number().int().min(1, 'La prioridad debe ser un número positivo.'),
});

export const OptimizeRouteFormSchema = z.object({
  selectedContextRepartoId: z.string().uuid("Debe seleccionar un reparto en curso de referencia."),
  averageVehicleSpeed: z.coerce.number().positive('La velocidad promedio debe ser un número positivo.'),
  newDeliveries: z.array(NewDeliveryStopSchema).min(1, 'Debe ingresar al menos una parada nueva para optimizar.'),
  vehicleCapacity: z.coerce.number().min(1, 'La capacidad del vehículo es requerida.'),
  overallTimeWindowStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM).'),
  overallTimeWindowEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM).'),
}).refine(data => {
    if (!data.overallTimeWindowStart || !data.overallTimeWindowEnd) return true; // Allow validation if fields are not yet filled
    try {
        const [startHour, startMinute] = data.overallTimeWindowStart.split(':').map(Number);
        const [endHour, endMinute] = data.overallTimeWindowEnd.split(':').map(Number);

        if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
            return false; // Invalid time format already handled by regex, but good for safety
        }
        
        const startTimeInMinutes = startHour * 60 + startMinute;
        const endTimeInMinutes = endHour * 60 + endMinute;
        
        return endTimeInMinutes > startTimeInMinutes;
    } catch (e) {
        // If parsing fails, let regex handle it or mark as invalid
        return false; 
    }
}, {
    message: "La hora de fin debe ser posterior a la hora de inicio.",
    path: ["overallTimeWindowEnd"],
});

export type OptimizeRouteFormValues = z.infer<typeof OptimizeRouteFormSchema>;

