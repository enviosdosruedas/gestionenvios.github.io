
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Edit, Trash2, CalendarIcon, Loader2, ChevronsUpDown, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/shared/page-header';
import type { Delivery, Driver, Zone, ClienteNuestro, ClientReparto, DetalleReparto } from '@/lib/types';
import { ALL_DELIVERY_STATUSES } from '@/lib/types';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea'; // No longer using the main paradas textarea
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';

const detalleRepartoSchema = z.object({
  id: z.string().optional(), // for existing items during edit
  cliente_reparto_id: z.number().min(1, 'Seleccione un cliente de reparto.'),
  valor_entrega: z.coerce.number().positive('El valor debe ser positivo.').optional().nullable(),
  detalle_entrega: z.string().optional().nullable(),
  orden_visita: z.number().int(),
}).refine(data => data.valor_entrega != null || (data.detalle_entrega != null && data.detalle_entrega.trim() !== ''), {
  message: "Debe ingresar un valor o un detalle para la entrega.",
  path: ["detalle_entrega"], // Apply error to one field, or make it a form-level error
});


const deliverySchema = z.object({
  fecha: z.date({ required_error: 'La fecha es requerida.' }),
  repartidor_id: z.string().uuid('Seleccione un repartidor.'),
  cliente_nuestro_id: z.string().uuid("Seleccione un cliente principal."),
  zona_id: z.string().uuid('Seleccione una zona para el reparto general.'),
  tanda: z.coerce.number().int().min(1, 'La tanda debe ser un número positivo.'),
  estado_entrega: z.enum(ALL_DELIVERY_STATUSES),
  detalles_reparto: z.array(detalleRepartoSchema).min(1, "Debe agregar al menos un ítem de entrega."),
});

type DeliveryFormData = z.infer<typeof deliverySchema>;
type DetalleRepartoFormData = z.infer<typeof detalleRepartoSchema>;

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<Pick<Driver, 'id' | 'nombre' | 'status'>[]>([]);
  const [zones, setZones] = useState<Pick<Zone, 'id' | 'nombre'>[]>([]);
  const [clientesNuestros, setClientesNuestros] = useState<Pick<ClienteNuestro, 'id' | 'nombre'>[]>([]);
  const [availableClientesReparto, setAvailableClientesReparto] = useState<ClientReparto[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const { toast } = useToast();

  const form = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      fecha: new Date(),
      repartidor_id: '',
      cliente_nuestro_id: '',
      zona_id: '',
      tanda: 1,
      estado_entrega: 'pendiente',
      detalles_reparto: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "detalles_reparto",
    keyName: "fieldId" // Use a custom key name to avoid conflicts with 'id' from data
  });

  const selectedClienteNuestroId = form.watch("cliente_nuestro_id");

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [driversRes, zonesRes, clientesNuestrosRes] = await Promise.all([
        supabase.from('repartidores').select('id, nombre, status').order('nombre'),
        supabase.from('zonas').select('id, nombre').order('nombre'),
        supabase.from('clientesnuestros').select('id, nombre').order('nombre'),
      ]);

      if (driversRes.error) throw driversRes.error;
      setDrivers(driversRes.data || []);

      if (zonesRes.error) throw zonesRes.error;
      setZones(zonesRes.data || []);

      if (clientesNuestrosRes.error) throw clientesNuestrosRes.error;
      setClientesNuestros(clientesNuestrosRes.data || []);
      
      await fetchDeliveries(); // Fetch deliveries after other dependent data
      
    } catch (error: any) {
      toast({ title: "Error al cargar datos iniciales", description: error.message || "No se pudieron cargar los datos necesarios.", variant: "destructive" });
      console.error("Error fetching initial data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchDeliveries = async () => {
     // Assuming setIsLoading is handled by the caller (fetchInitialData)
    try {
        const { data, error } = await supabase.from('repartos')
          .select(`
            id,
            fecha,
            repartidor_id,
            zona_id,
            tanda,
            estado_entrega,
            created_at,
            updated_at,
            repartidores (nombre),
            zonas (nombre),
            clientesnuestros (id, nombre),
            detallesreparto (
              id,
              cliente_reparto_id,
              valor_entrega,
              detalle_entrega,
              orden_visita,
              clientesreparto (nombre, direccion)
            )
          `)
          .order('fecha', { ascending: false })
          .order('orden_visita', { referencedTable: 'detallesreparto', ascending: true });


      if (error) throw error;
       setDeliveries(data.map(d => ({...d, detalles_reparto: d.detallesreparto})) || []);
    } catch (error: any) {
      toast({ title: "Error al cargar repartos", description: error.message || "No se pudieron cargar los repartos.", variant: "destructive" });
      console.error("Error fetching deliveries:", error);
    }
  };


  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchClientesRepartoForClienteNuestro = useCallback(async (clienteNuestroId: string | undefined) => {
    if (!clienteNuestroId) {
      setAvailableClientesReparto([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('clientesreparto')
        .select('id, nombre, direccion, cliente_nuestro_id')
        .eq('cliente_nuestro_id', clienteNuestroId)
        .order('nombre');
      if (error) throw error;
      setAvailableClientesReparto(data || []);
    } catch (error: any) {
      toast({ title: "Error al cargar clientes de reparto", description: error.message, variant: "destructive" });
      console.error("Error fetching sub-clients:", error);
      setAvailableClientesReparto([]);
    }
  }, [toast]);

  useEffect(() => {
    fetchClientesRepartoForClienteNuestro(selectedClienteNuestroId);
  }, [selectedClienteNuestroId, fetchClientesRepartoForClienteNuestro]);

  useEffect(() => {
    if (editingDelivery) {
      form.reset({
        ...editingDelivery,
        fecha: typeof editingDelivery.fecha === 'string' ? parseISO(editingDelivery.fecha) : editingDelivery.fecha,
        cliente_nuestro_id: editingDelivery.clientesnuestros?.id || '',
        detalles_reparto: editingDelivery.detalles_reparto?.map(d => ({
          id: d.id, // Keep original ID for updates
          cliente_reparto_id: d.cliente_reparto_id,
          valor_entrega: d.valor_entrega,
          detalle_entrega: d.detalle_entrega,
          orden_visita: d.orden_visita,
        })) || [],
      });
      // Trigger fetching sub-clients for the editing delivery's main client
      if (editingDelivery.clientesnuestros?.id) {
        fetchClientesRepartoForClienteNuestro(editingDelivery.clientesnuestros.id);
      }
    } else {
      form.reset({
        fecha: new Date(),
        repartidor_id: '',
        cliente_nuestro_id: '',
        zona_id: '',
        tanda: 1,
        estado_entrega: 'pendiente',
        detalles_reparto: [],
      });
      setAvailableClientesReparto([]); // Clear available sub-clients
    }
  }, [editingDelivery, form, isDialogOpen, fetchClientesRepartoForClienteNuestro]);

  const onSubmit = async (data: DeliveryFormData) => {
    setIsSubmitting(true);
    
    const repartoData = {
      fecha: format(data.fecha, 'yyyy-MM-dd'),
      repartidor_id: data.repartidor_id,
      cliente_nuestro_id: data.cliente_nuestro_id,
      zona_id: data.zona_id,
      tanda: data.tanda,
      estado_entrega: data.estado_entrega,
    };

    try {
      let repartoId = editingDelivery?.id;

      if (editingDelivery) { // Update
        const { data: updatedReparto, error: updateError } = await supabase
          .from('repartos')
          .update(repartoData)
          .eq('id', editingDelivery.id)
          .select('id')
          .single();
        if (updateError) throw updateError;
        if (!updatedReparto) throw new Error("No se pudo actualizar el reparto.");
        repartoId = updatedReparto.id;

        // Handle DetallesReparto: diffing or delete-all-and-reinsert
        // Simple approach: delete all existing and re-insert
        const { error: deleteDetailsError } = await supabase
          .from('detallesreparto')
          .delete()
          .eq('reparto_id', repartoId);
        if (deleteDetailsError) throw deleteDetailsError;

      } else { // Create
        const { data: newReparto, error: insertError } = await supabase
          .from('repartos')
          .insert([repartoData])
          .select('id')
          .single();
        if (insertError) throw insertError;
        if (!newReparto) throw new Error("No se pudo crear el reparto.");
        repartoId = newReparto.id;
      }

      // Insert new DetallesReparto
      if (repartoId && data.detalles_reparto.length > 0) {
        const detallesToInsert = data.detalles_reparto.map((detalle, index) => ({
          reparto_id: repartoId,
          cliente_reparto_id: detalle.cliente_reparto_id,
          valor_entrega: detalle.valor_entrega || null,
          detalle_entrega: detalle.detalle_entrega || null,
          orden_visita: index, // Use array index as order
        }));
        const { error: insertDetailsError } = await supabase
          .from('detallesreparto')
          .insert(detallesToInsert);
        if (insertDetailsError) throw insertDetailsError;
      }

      toast({ title: editingDelivery ? "Reparto Actualizado" : "Reparto Creado", description: "La operación fue exitosa." });
      fetchDeliveries();
      setEditingDelivery(null);
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Error al guardar", description: error.message || "Ocurrió un error al guardar el reparto.", variant: "destructive" });
      console.error("Error submitting delivery:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Deleting DetallesReparto is handled by ON DELETE CASCADE from the database.
    try {
      const { error } = await supabase.from('repartos').delete().eq('id', id);
      if (error) throw error;
      fetchDeliveries();
      toast({ title: "Reparto Eliminado", description: "El reparto ha sido eliminado.", variant: "destructive" });
    } catch (error: any) {
      toast({ title: "Error al eliminar", description: error.message || "Ocurrió un error al eliminar el reparto.", variant: "destructive" });
      console.error("Error deleting delivery:", error);
    }
  };
  
  const openEditDialog = (delivery: Delivery) => {
    setEditingDelivery(delivery);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingDelivery(null);
    form.reset({
      fecha: new Date(),
      repartidor_id: '',
      cliente_nuestro_id: '',
      zona_id: '',
      tanda: 1,
      estado_entrega: 'pendiente',
      detalles_reparto: [],
    });
    setAvailableClientesReparto([]);
    setIsDialogOpen(true);
  };

  const handleAddDetalleReparto = () => {
    if (!selectedClienteNuestroId) {
      toast({ title: "Seleccione Cliente Principal", description: "Debe seleccionar un cliente principal antes de agregar ítems.", variant: "destructive"});
      return;
    }
    if (availableClientesReparto.length === 0) {
       toast({ title: "Sin Clientes de Reparto", description: "El cliente principal seleccionado no tiene clientes de reparto asociados o aún no se cargaron.", variant: "destructive"});
       return;
    }
    // Add a new empty item, user will select the cliente_reparto_id
    append({ cliente_reparto_id: 0, valor_entrega: null, detalle_entrega: '', orden_visita: fields.length });
  };


  return (
    <>
      <PageHeader
        title="Gestión de Repartos"
        description="Planifica y sigue el estado de tus repartos diarios."
        actions={
          <Button onClick={openNewDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Reparto
          </Button>
        }
      />
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
             <div className="p-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Repartidor</TableHead>
                <TableHead>Cliente Principal</TableHead>
                <TableHead>Zona</TableHead>
                <TableHead>Tanda</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell>{format(typeof delivery.fecha === 'string' ? parseISO(delivery.fecha) : delivery.fecha, 'PPP', { locale: es })}</TableCell>
                  <TableCell>{delivery.repartidores?.nombre || 'N/A'}</TableCell>
                  <TableCell>{delivery.clientesnuestros?.nombre || 'N/A'}</TableCell>
                  <TableCell>{delivery.zonas?.nombre || 'N/A'}</TableCell>
                  <TableCell>{delivery.tanda}</TableCell>
                  <TableCell>{delivery.detalles_reparto?.length || 0}</TableCell>
                  <TableCell>
                    <Badge 
                        variant={delivery.estado_entrega === 'entregado' ? 'default' : (delivery.estado_entrega === 'en curso' ? 'secondary' : 'outline')}
                        className={cn(
                            {'bg-green-500 text-primary-foreground': delivery.estado_entrega === 'entregado'},
                            {'bg-polynesian-blue-500 text-primary-foreground': delivery.estado_entrega === 'en curso'},
                            {'bg-mikado-yellow-500 text-secondary-foreground': delivery.estado_entrega === 'pendiente'},
                            {'bg-red-500 text-destructive-foreground': delivery.estado_entrega === 'cancelado'},
                            {'bg-purple-500 text-primary-foreground': delivery.estado_entrega === 'reprogramado'}
                        )}
                    >
                      {delivery.estado_entrega.charAt(0).toUpperCase() + delivery.estado_entrega.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(delivery)} disabled={isSubmitting}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(delivery.id)} disabled={isSubmitting}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!isSubmitting) setIsDialogOpen(open)}}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"> {/* Increased width for more complex form */}
          <DialogHeader>
            <DialogTitle>{editingDelivery ? 'Editar' : 'Nuevo'} Reparto</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 pr-1">
              {/* Basic Reparto Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fecha"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha del Reparto</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              disabled={isSubmitting}
                            >
                              {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) || isSubmitting } initialFocus locale={es} />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="repartidor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repartidor Asignado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={isSubmitting}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar repartidor" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {drivers.filter(d => d.status === 'activo').map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>{driver.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                    control={form.control}
                    name="cliente_nuestro_id"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Cliente Principal</FormLabel>
                        <Select 
                            onValueChange={(value) => {
                                field.onChange(value);
                                form.setValue('detalles_reparto', []); // Clear details when main client changes
                            }} 
                            value={field.value} 
                            defaultValue={field.value} 
                            disabled={isSubmitting}
                        >
                        <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar cliente principal" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {clientesNuestros.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id}>{cliente.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="zona_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zona (General del Reparto)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={isSubmitting}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar zona" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {zones.map((zone) => (<SelectItem key={zone.id} value={zone.id}>{zone.nombre}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="tanda"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tanda de Entrega</FormLabel>
                        <FormControl><Input type="number" min="1" placeholder="Ej: 1" {...field} disabled={isSubmitting}/></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>

              <FormField
                    control={form.control}
                    name="estado_entrega"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Estado de Entrega</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={isSubmitting}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {ALL_DELIVERY_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}> {status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              
              {/* Detalles de Reparto (Items) */}
              <Card className="mt-6">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Ítems de Entrega</h3>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddDetalleReparto} disabled={!selectedClienteNuestroId || isSubmitting}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Añadir Ítem
                    </Button>
                  </div>
                  {!selectedClienteNuestroId && <FormDescription className="text-destructive">Seleccione un Cliente Principal para agregar ítems.</FormDescription>}
                </CardHeader>
                <CardContent className="space-y-3">
                  {fields.map((item, index) => (
                    <div key={item.fieldId} className="p-3 border rounded-md space-y-3 bg-muted/50">
                       <div className="flex justify-between items-center">
                         <span className="text-sm font-medium">Ítem {index + 1}</span>
                         <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={isSubmitting}>
                            <Trash className="h-4 w-4 text-destructive" />
                         </Button>
                       </div>
                      <FormField
                        control={form.control}
                        name={`detalles_reparto.${index}.cliente_reparto_id`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cliente de Reparto</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value,10))} // Ensure value is number
                              value={field.value?.toString()} // Ensure value is string for Select
                              disabled={isSubmitting || availableClientesReparto.length === 0}
                            >
                              <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar cliente de reparto" /></SelectTrigger></FormControl>
                              <SelectContent>
                                {availableClientesReparto.map(cr => (
                                  <SelectItem key={cr.id} value={cr.id.toString()}>{cr.nombre} - {cr.direccion}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`detalles_reparto.${index}.valor_entrega`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Valor Entrega (ARS)</FormLabel>
                              <FormControl><Input type="number" step="0.01" placeholder="Ej: 1500.50" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))} disabled={isSubmitting} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`detalles_reparto.${index}.detalle_entrega`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Detalle Adicional</FormLabel>
                              <FormControl><Input placeholder="Ej: Dejar en portería" {...field} value={field.value ?? ""} disabled={isSubmitting} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                       <FormField
                        control={form.control}
                        name={`detalles_reparto.${index}.orden_visita`}
                        render={({ field }) => <Input type="hidden" {...field} />} // Hidden, managed by array order
                      />
                    </div>
                  ))}
                  {fields.length === 0 && selectedClienteNuestroId && (
                    <p className="text-sm text-muted-foreground">No hay ítems de entrega. Haga clic en "Añadir Ítem".</p>
                  )}
                  <FormMessage>{form.formState.errors.detalles_reparto?.message || form.formState.errors.detalles_reparto?.root?.message}</FormMessage>
                </CardContent>
              </Card>

              <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isSubmitting}>Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Guardar Reparto
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
    