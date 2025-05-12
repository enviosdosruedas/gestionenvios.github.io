
'use server';

import { optimizeDeliveryRoute, type OptimizeDeliveryRouteInput, type OptimizeDeliveryRouteOutput, OngoingDeliverySchema } from '@/ai/flows/optimize-delivery-route'; // Added OngoingDeliverySchema
import type { ZodError } from 'zod';
import { OptimizeRouteFormSchema, type OptimizeRouteFormValues } from './optimize-route.schema';
import { supabase } from '@/lib/supabaseClient';
import { format, parseISO } from 'date-fns';


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
    selectedContextRepartoId,
    averageVehicleSpeed, 
    newDeliveries: formNewDeliveries, 
    vehicleCapacity, 
    overallTimeWindowStart, 
    overallTimeWindowEnd 
  } = validationResult.data;

  let startLocationForAI = "Mar del Plata, Buenos Aires, Argentina"; // Default fallback
  let ongoingDeliveriesForAI: z.infer<typeof OngoingDeliverySchema>[] = [];

  if (selectedContextRepartoId) {
    const { data: contextReparto, error: repartoError } = await supabase
      .from('repartos')
      .select(`
        id,
        fecha,
        tanda,
        clientesnuestros (id, nombre, direccion_retiro),
        repartidores (nombre),
        detallesreparto (
          id,
          clientesreparto (id, nombre, direccion, horario_inicio, horario_fin)
        )
      `)
      .eq('id', selectedContextRepartoId)
      .single();

    if (repartoError || !contextReparto) {
      console.error("Error fetching context reparto:", repartoError);
      return { success: false, error: "No se pudo cargar el reparto de referencia." };
    }

    if (contextReparto.clientesnuestros?.direccion_retiro) {
      startLocationForAI = contextReparto.clientesnuestros.direccion_retiro;
    } else if (contextReparto.clientesnuestros?.nombre){
      // Fallback if direccion_retiro is not set, use client's name + city as a rough estimate
      startLocationForAI = `${contextReparto.clientesnuestros.nombre}, Mar del Plata, Buenos Aires, Argentina`;
       // It would be better to have a default address for the company or ensure direccion_retiro is always set
    }


    // Populate ongoingDeliveriesForAI from the details of the selected context reparto
    if (contextReparto.detallesreparto && Array.isArray(contextReparto.detallesreparto)) {
      ongoingDeliveriesForAI = contextReparto.detallesreparto.map(detalle => {
        const repartoDate = typeof contextReparto.fecha === 'string' ? parseISO(contextReparto.fecha) : contextReparto.fecha;
        
        let startTime = "00:00";
        if (detalle.clientesreparto?.horario_inicio) {
            const [h, m] = detalle.clientesreparto.horario_inicio.split(':');
            startTime = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
        } else {
            // Fallback if no specific start time for this detail, use general delivery window start
            startTime = overallTimeWindowStart;
        }

        let estimatedDeliveryTime = "23:59";
         if (detalle.clientesreparto?.horario_fin) {
            const [h, m] = detalle.clientesreparto.horario_fin.split(':');
            estimatedDeliveryTime = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
        } else {
            // Fallback if no specific end time for this detail, use general delivery window end
            estimatedDeliveryTime = overallTimeWindowEnd;
        }

        return {
          id: detalle.clientesreparto?.id.toString() || detalle.id, // Use clientreparto.id if available
          address: detalle.clientesreparto?.direccion || "Dirección desconocida",
          startTime: startTime, // This is the start of the *window* for this stop
          estimatedDeliveryTime: estimatedDeliveryTime, // This is the end of the *window*
        };
      }).filter(od => od.address !== "Dirección desconocida");
    }
  } else {
     return { success: false, error: "ID de reparto de contexto no proporcionado." };
  }


  const input: OptimizeDeliveryRouteInput = {
    startLocation: startLocationForAI,
    averageVehicleSpeed,
    ongoingDeliveries: ongoingDeliveriesForAI,
    newDeliveries: formNewDeliveries.map((stop, index) => ({
      id: `nueva-parada-${index + 1}`, 
      address: stop.address,
      priority: stop.priority,
    })),
    vehicleCapacity,
    overallTimeWindowStart,
    overallTimeWindowEnd,
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
