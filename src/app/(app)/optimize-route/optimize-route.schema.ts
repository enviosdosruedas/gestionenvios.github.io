import { z } from 'zod';

export const StopSchema = z.object({
  address: z.string().min(1, 'La dirección es requerida.'),
  priority: z.coerce.number().int().min(1, 'La prioridad debe ser un número positivo.'),
});

export const OptimizeRouteFormSchema = z.object({
  stops: z.array(StopSchema).min(1, 'Debe ingresar al menos una parada.'),
  vehicleCapacity: z.coerce.number().min(1, 'La capacidad del vehículo es requerida.'),
  timeWindowStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM).'),
  timeWindowEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM).'),
}).refine(data => {
    // Ensure timeWindowStart and timeWindowEnd are valid before parsing
    if (!data.timeWindowStart || !data.timeWindowEnd) return true; // Allow other validations to catch this
    try {
        const startHour = parseInt(data.timeWindowStart.split(':')[0], 10);
        const startMinute = parseInt(data.timeWindowStart.split(':')[1], 10);
        const endHour = parseInt(data.timeWindowEnd.split(':')[0], 10);
        const endMinute = parseInt(data.timeWindowEnd.split(':')[1], 10);

        if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
            return true; // Let regex validation handle format issues
        }
        
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;
        
        return endTime > startTime;
    } catch (e) {
        return true; // If parsing fails, let other Zod rules handle it
    }
}, {
    message: "La hora de fin debe ser posterior a la hora de inicio.",
    path: ["timeWindowEnd"], // Apply error to timeWindowEnd field
});

export type OptimizeRouteFormValues = z.infer<typeof OptimizeRouteFormSchema>;
