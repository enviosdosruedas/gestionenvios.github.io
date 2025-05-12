'use client';

import React, { useState }from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OptimizeRouteFormSchema, OptimizeRouteFormValues, optimizeRouteAction } from './actions';
import { OptimizeRouteFormSchema as OptimizeRouteFormSchemaFromSchema } from './optimize-route.schema'; // Correct import
import type { OptimizeDeliveryRouteOutput, OptimizeDeliveryRouteInput } from '@/ai/flows/optimize-delivery-route'; // Add OptimizeDeliveryRouteInput if needed
import { Loader2, PlusCircle, Trash2, RouteIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OptimizeRoutePage() {
  const [optimizationResult, setOptimizationResult] = useState<OptimizeDeliveryRouteOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<OptimizeRouteFormValues>({
    resolver: zodResolver(OptimizeRouteFormSchemaFromSchema), // Use the correctly imported schema
    defaultValues: {
      stops: [{ address: '', priority: 1 }],
      vehicleCapacity: 100, // Default capacity
      timeWindowStart: '09:00',
      timeWindowEnd: '17:00',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stops",
  });

  async function onSubmit(values: OptimizeRouteFormValues) {
    setIsLoading(true);
    setOptimizationResult(null);
    
    const result = await optimizeRouteAction(values);

    if (result.success && result.data) {
      setOptimizationResult(result.data);
      toast({ title: "Ruta Optimizada", description: "La ruta ha sido calculada con éxito." });
    } else {
      let errorMessage = "Error al optimizar la ruta.";
      if (typeof result.error === 'string') {
        errorMessage = result.error;
      } else if (result.error && 'fieldErrors' in result.error) {
         // If ZodError, extract field errors for more specific messages
        const fieldErrors = Object.values(result.error.fieldErrors).flat().join(' ');
        if (fieldErrors) errorMessage = `Errores de validación: ${fieldErrors}`;
        const formErrors = result.error.formErrors.join(' ');
         if (formErrors) errorMessage += ` ${formErrors}`;
      }
      toast({ title: "Error de Optimización", description: errorMessage, variant: "destructive" });
    }
    setIsLoading(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Optimización de Rutas de Entrega"
        description="Ingrese los detalles para generar una ruta de entrega optimizada utilizando IA."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Información de la Ruta</CardTitle>
              <CardDescription>Complete los campos para la optimización.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <FormLabel>Paradas de Entrega</FormLabel>
                <FormDescription className="mb-2">Añada todas las direcciones a visitar y su prioridad (mayor número = mayor prioridad).</FormDescription>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-2 mb-3 p-3 border rounded-md bg-background">
                    <FormField
                      control={form.control}
                      name={`stops.${index}.address`}
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                           {index === 0 && <FormLabel className="text-xs">Dirección</FormLabel>}
                          <FormControl>
                            <Input placeholder="Ej: Av. Colón 1234, Mar del Plata" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`stops.${index}.priority`}
                      render={({ field }) => (
                        <FormItem className="w-24">
                           {index === 0 && <FormLabel className="text-xs">Prioridad</FormLabel>}
                          <FormControl>
                            <Input type="number" min="1" placeholder="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {fields.length > 1 && (
                      <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ address: '', priority: 1 })}
                  className="mt-2"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Añadir Parada
                </Button>
                 <FormMessage>{form.formState.errors.stops?.message || form.formState.errors.stops?.root?.message}</FormMessage>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="vehicleCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidad del Vehículo</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ej: 150 (unidades, kg, etc.)" {...field} />
                      </FormControl>
                      <FormDescription>Máxima capacidad del vehículo.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeWindowStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inicio Ventana Horaria</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormDescription>Hora de inicio de entregas.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeWindowEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fin Ventana Horaria</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormDescription>Hora de finalización de entregas.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Optimizando...
                  </>
                ) : (
                  <>
                  <RouteIcon className="mr-2 h-4 w-4" />
                  Optimizar Ruta
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      {optimizationResult && (
        <Card className="mt-8 shadow-xl animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Resultado de la Optimización</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Ruta Optimizada:</h3>
              <ul className="list-decimal list-inside mt-2 space-y-1 bg-muted p-4 rounded-md">
                {optimizationResult.optimizedRoute.map((stop, index) => (
                  <li key={index} className="text-sm">
                    <span className="font-medium">{stop.address}</span> (Prioridad: {stop.priority})
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p className="text-sm"><strong className="font-medium">Tiempo Estimado de Viaje:</strong> {optimizationResult.estimatedTravelTime}</p>
                <p className="text-sm"><strong className="font-medium">Distancia Estimada de Viaje:</strong> {optimizationResult.estimatedTravelDistance}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
