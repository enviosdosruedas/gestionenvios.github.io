
'use client';

import React, { useState }from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Removed Textarea import as it's not used directly
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { optimizeRouteAction } from './actions';
import { OptimizeRouteFormSchema, type OptimizeRouteFormValues } from './optimize-route.schema'; 
import type { OptimizeDeliveryRouteOutput } from '@/ai/flows/optimize-delivery-route'; 
import { Loader2, PlusCircle, Trash2, RouteIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Added Table imports

export default function OptimizeRoutePage() {
  const [optimizationResult, setOptimizationResult] = useState<OptimizeDeliveryRouteOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<OptimizeRouteFormValues>({
    resolver: zodResolver(OptimizeRouteFormSchema), 
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
        // Ensure fieldErrors is an object before trying to access its values
        const fieldErrorsString = typeof result.error.fieldErrors === 'object' 
          ? Object.values(result.error.fieldErrors).flat().join(' ') 
          : '';
        if (fieldErrorsString) errorMessage = `Errores de validación: ${fieldErrorsString}`;
        
        const formErrorsString = Array.isArray(result.error.formErrors) ? result.error.formErrors.join(' ') : '';
        if (formErrorsString) errorMessage += ` ${formErrorsString}`;
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
                  <div key={field.id} className="flex flex-col sm:flex-row sm:items-end gap-2 mb-3 p-3 border rounded-md bg-background">
                    <FormField
                      control={form.control}
                      name={`stops.${index}.address`}
                      render={({ field: formField }) => ( 
                        <FormItem className="flex-grow w-full sm:w-auto">
                           {index === 0 && <FormLabel className="text-xs">Dirección</FormLabel>}
                          <FormControl>
                            <Input placeholder="Ej: Av. Colón 1234, Mar del Plata" {...formField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`stops.${index}.priority`}
                      render={({ field: formField }) => ( 
                        <FormItem className="w-full sm:w-24">
                           {index === 0 && <FormLabel className="text-xs">Prioridad</FormLabel>}
                          <FormControl>
                            <Input type="number" min="1" placeholder="1" {...formField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="self-start sm:self-end pt-1 sm:pt-0"> {/* Adjusted padding for alignment */}
                      {fields.length > 1 && (
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} aria-label={`Eliminar parada ${index + 1}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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
              <div className="relative w-full overflow-auto mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Dirección</TableHead>
                      <TableHead className="text-right">Prioridad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {optimizationResult.optimizedRoute.map((stop, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{stop.address}</TableCell>
                        <TableCell className="text-right">{stop.priority}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <p className="text-sm"><strong className="font-medium">Tiempo Estimado de Viaje:</strong> {optimizationResult.estimatedTravelTime}</p>
                <p className="text-sm"><strong className="font-medium">Distancia Estimada de Viaje:</strong> {optimizationResult.estimatedTravelDistance}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

