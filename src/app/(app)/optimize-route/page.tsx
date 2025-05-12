
'use client';

import React, { useState, useEffect }from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { optimizeRouteAction } from './actions';
import { OptimizeRouteFormSchema, type OptimizeRouteFormValues } from './optimize-route.schema'; 
import type { OptimizeDeliveryRouteOutput } from '@/ai/flows/optimize-delivery-route'; 
import { Loader2, PlusCircle, Trash2, RouteIcon, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from '@/lib/supabaseClient';
import type { Delivery, ClienteNuestro, ClientReparto } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type RepartoWithDetails = Delivery & {
  clientesnuestros: Pick<ClienteNuestro, 'id' | 'nombre' | 'direccion_retiro'> | null;
  repartidores: { nombre: string } | null;
};

export default function OptimizeRoutePage() {
  const [optimizationResult, setOptimizationResult] = useState<OptimizeDeliveryRouteOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [ongoingDeliveries, setOngoingDeliveries] = useState<RepartoWithDetails[]>([]);
  const [selectedClienteNuestro, setSelectedClienteNuestro] = useState<Pick<ClienteNuestro, 'id' | 'nombre' | 'direccion_retiro'> | null>(null);
  const [availableClientesReparto, setAvailableClientesReparto] = useState<ClientReparto[]>([]);

  const { toast } = useToast();

  const form = useForm<OptimizeRouteFormValues>({
    resolver: zodResolver(OptimizeRouteFormSchema), 
    defaultValues: {
      selectedContextRepartoId: undefined,
      averageVehicleSpeed: 50, 
      newDeliveries: [{ address: '', priority: 1 }],
      vehicleCapacity: 100, 
      overallTimeWindowStart: '09:00',
      overallTimeWindowEnd: '17:00',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "newDeliveries",
  });

  const selectedContextRepartoId = form.watch('selectedContextRepartoId');

  useEffect(() => {
    const fetchOngoingDeliveries = async () => {
      setIsLoadingContext(true);
      try {
        const { data, error } = await supabase
          .from('repartos')
          .select(`
            id,
            fecha,
            tanda,
            clientesnuestros (id, nombre, direccion_retiro),
            repartidores (nombre)
          `)
          .eq('estado_entrega', 'en curso')
          .order('fecha', { ascending: false });

        if (error) throw error;
        setOngoingDeliveries(data as RepartoWithDetails[] || []);
      } catch (error: any) {
        toast({ title: "Error", description: "No se pudieron cargar los repartos en curso.", variant: "destructive" });
        console.error("Error fetching ongoing deliveries:", error);
      } finally {
        setIsLoadingContext(false);
      }
    };
    fetchOngoingDeliveries();
  }, [toast]);

  useEffect(() => {
    const updateContext = async () => {
      if (selectedContextRepartoId) {
        setIsLoadingContext(true);
        const selectedReparto = ongoingDeliveries.find(d => d.id === selectedContextRepartoId);
        if (selectedReparto && selectedReparto.clientesnuestros) {
          setSelectedClienteNuestro(selectedReparto.clientesnuestros);
          try {
            const { data: clientesRepartoData, error: clientesRepartoError } = await supabase
              .from('clientesreparto')
              .select('*')
              .eq('cliente_nuestro_id', selectedReparto.clientesnuestros.id);
            if (clientesRepartoError) throw clientesRepartoError;
            setAvailableClientesReparto(clientesRepartoData || []);
          } catch (error: any) {
            toast({ title: "Error", description: "No se pudieron cargar los clientes de reparto asociados.", variant: "destructive" });
            setAvailableClientesReparto([]);
          }
        } else {
          setSelectedClienteNuestro(null);
          setAvailableClientesReparto([]);
        }
        setIsLoadingContext(false);
      } else {
        setSelectedClienteNuestro(null);
        setAvailableClientesReparto([]);
      }
    };
    updateContext();
  }, [selectedContextRepartoId, ongoingDeliveries, toast]);

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
        description="Seleccione un reparto en curso como referencia y añada nuevas paradas para generar una ruta optimizada."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Información de la Ruta</CardTitle>
              <CardDescription>Complete los campos para la optimización.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="selectedContextRepartoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reparto en Curso de Referencia</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingContext}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar reparto en curso..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingContext && <SelectItem value="loading" disabled>Cargando...</SelectItem>}
                          {ongoingDeliveries.map(reparto => (
                            <SelectItem key={reparto.id} value={reparto.id}>
                              ID: {reparto.id.substring(0,6)}.. - Cliente: {reparto.clientesnuestros?.nombre || 'N/A'} - Repartidor: {reparto.repartidores?.nombre || 'N/A'} ({format(new Date(reparto.fecha), 'dd/MM/yy', {locale: es})})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Establece el cliente principal y el punto de partida contextual.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="averageVehicleSpeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Velocidad Promedio del Vehículo (km/h)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ej: 50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {selectedClienteNuestro && (
                <Alert variant="default" className="bg-primary/5 border-primary/30">
                  <Info className="h-4 w-4 text-primary" />
                  <AlertTitle className="text-primary font-semibold">Contexto del Reparto Seleccionado</AlertTitle>
                  <AlertDescription className="text-sm">
                    <p><strong>Cliente Principal:</strong> {selectedClienteNuestro.nombre}</p>
                    <p><strong>Punto de Partida (Dirección de Retiro):</strong> {selectedClienteNuestro.direccion_retiro || "No especificada"}</p>
                    {selectedClienteNuestro.direccion_retiro ? null : <p className="text-destructive text-xs">Advertencia: El cliente principal no tiene una dirección de retiro configurada. La optimización usará una ubicación genérica o podría fallar.</p>}
                  </AlertDescription>
                </Alert>
              )}


              <div>
                <FormLabel>Nuevas Entregas a Planificar para: <span className="font-semibold">{selectedClienteNuestro?.nombre || "Cliente (seleccione reparto de referencia)"}</span></FormLabel>
                <FormDescription className="mb-2">Añada las direcciones y prioridades. Todas las direcciones deben ser dentro de Mar del Plata.</FormDescription>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex flex-col sm:flex-row sm:items-end gap-2 mb-3 p-3 border rounded-md bg-muted/30">
                    <FormField
                      control={form.control}
                      name={`newDeliveries.${index}.address`}
                      render={({ field: formField }) => ( 
                        <FormItem className="flex-grow w-full sm:w-auto">
                           {index === 0 && <FormLabel className="text-xs text-muted-foreground">Dirección</FormLabel>}
                          <FormControl>
                            <Input placeholder="Ej: Av. Colón 1234, Mar del Plata" {...formField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`newDeliveries.${index}.priority`}
                      render={({ field: formField }) => ( 
                        <FormItem className="w-full sm:w-24">
                           {index === 0 && <FormLabel className="text-xs text-muted-foreground">Prioridad</FormLabel>}
                          <FormControl>
                            <Input type="number" min="1" placeholder="1" {...formField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="self-start sm:self-end pt-1 sm:pt-0">
                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label={`Eliminar parada ${index + 1}`} className="text-destructive hover:bg-destructive/10">
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
                  disabled={!selectedContextRepartoId}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Añadir Parada
                </Button>
                 <FormMessage>{form.formState.errors.newDeliveries?.message || form.formState.errors.newDeliveries?.root?.message}</FormMessage>
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
                  name="overallTimeWindowStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inicio Ventana Horaria General</FormLabel>
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
                  name="overallTimeWindowEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fin Ventana Horaria General</FormLabel>
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
              <Button type="submit" disabled={isLoading || !selectedContextRepartoId} className="w-full md:w-auto">
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
            {optimizationResult.warnings && optimizationResult.warnings.length > 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Advertencias</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5">
                    {optimizationResult.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            <div>
              <h3 className="font-semibold text-lg">Ruta Optimizada:</h3>
              <div className="relative w-full overflow-auto mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>ID Entrega</TableHead>
                      <TableHead>Dirección</TableHead>
                      <TableHead>Llegada Estimada</TableHead>
                      <TableHead>Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {optimizationResult.deliveryOrder.map((stop, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-mono text-xs">{stop.deliveryId}</TableCell>
                        <TableCell className="font-medium">{stop.address}</TableCell>
                        <TableCell>{stop.estimatedArrivalTime}</TableCell>
                        <TableCell>{stop.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <p className="text-sm"><strong className="font-medium">Tiempo Total Estimado:</strong> {optimizationResult.totalTime}</p>
                <p className="text-sm"><strong className="font-medium">Distancia Total Estimada:</strong> {optimizationResult.totalDistance}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

