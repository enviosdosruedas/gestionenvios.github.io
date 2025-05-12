
'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, CalendarIcon, Loader2 } from 'lucide-react';
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
import type { Delivery, Driver, Zone } from '@/lib/types';
import { ALL_DELIVERY_STATUSES } from '@/lib/types';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';

const deliverySchema = z.object({
  fecha: z.date({ required_error: 'La fecha es requerida.' }),
  repartidor_id: z.string().uuid('Seleccione un repartidor.'),
  zona_id: z.string().uuid('Seleccione una zona.'),
  paradas: z.string().min(1, 'Ingrese los IDs de las paradas (separados por coma).'), 
  tanda: z.coerce.number().int().min(1, 'La tanda debe ser un número positivo.'),
  estado_entrega: z.enum(ALL_DELIVERY_STATUSES),
});

type DeliveryFormData = z.infer<typeof deliverySchema>;

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<Pick<Driver, 'id' | 'nombre' | 'status'>[]>([]);
  const [zones, setZones] = useState<Pick<Zone, 'id' | 'nombre'>[]>([]);
  
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
      zona_id: '',
      paradas: '',
      tanda: 1,
      estado_entrega: 'pendiente',
    },
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [deliveriesRes, driversRes, zonesRes] = await Promise.all([
        supabase.from('repartos')
          .select(`
            id,
            fecha,
            repartidor_id,
            paradas,
            zona_id,
            tanda,
            estado_entrega,
            created_at,
            updated_at,
            repartidores (nombre),
            zonas (nombre)
          `)
          .order('fecha', { ascending: false }),
        supabase.from('repartidores').select('id, nombre, status').order('nombre'),
        supabase.from('zonas').select('id, nombre').order('nombre'),
      ]);

      if (deliveriesRes.error) throw deliveriesRes.error;
      setDeliveries(deliveriesRes.data || []);

      if (driversRes.error) throw driversRes.error;
      setDrivers(driversRes.data || []);

      if (zonesRes.error) throw zonesRes.error;
      setZones(zonesRes.data || []);
      
    } catch (error: any) {
      toast({ title: "Error al cargar datos", description: error.message || "No se pudieron cargar los datos necesarios.", variant: "destructive" });
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (editingDelivery) {
      form.reset({
        ...editingDelivery,
        fecha: typeof editingDelivery.fecha === 'string' ? parseISO(editingDelivery.fecha) : editingDelivery.fecha,
        paradas: editingDelivery.paradas.join(', '), // Convert array to comma-separated string for form
      });
    } else {
      form.reset({
        fecha: new Date(),
        repartidor_id: '',
        zona_id: '',
        paradas: '',
        tanda: 1,
        estado_entrega: 'pendiente',
      });
    }
  }, [editingDelivery, form, isDialogOpen]);

  const onSubmit = async (data: DeliveryFormData) => {
    setIsSubmitting(true);
    const submissionData = {
      ...data,
      fecha: format(data.fecha, 'yyyy-MM-dd'),
      paradas: data.paradas.split(',').map(s => s.trim()).filter(s => s), // Convert string to array of UUIDs
    };

    try {
      if (editingDelivery) {
        const { error } = await supabase.from('repartos').update(submissionData).eq('id', editingDelivery.id);
        if (error) throw error;
        toast({ title: "Reparto Actualizado", description: "El reparto ha sido actualizado con éxito." });
      } else {
        const { error } = await supabase.from('repartos').insert([submissionData]);
        if (error) throw error;
        toast({ title: "Reparto Creado", description: "El nuevo reparto ha sido creado con éxito." });
      }
      fetchData();
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
    try {
      const { error } = await supabase.from('repartos').delete().eq('id', id);
      if (error) throw error;
      fetchData();
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
        zona_id: '',
        paradas: '',
        tanda: 1,
        estado_entrega: 'pendiente',
      });
    setIsDialogOpen(true);
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
                <TableHead>Zona</TableHead>
                <TableHead>Tanda</TableHead>
                <TableHead>Paradas (Cant.)</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell>{format(typeof delivery.fecha === 'string' ? parseISO(delivery.fecha) : delivery.fecha, 'PPP', { locale: es })}</TableCell>
                  <TableCell>{delivery.repartidores?.nombre || 'N/A'}</TableCell>
                  <TableCell>{delivery.zonas?.nombre || 'N/A'}</TableCell>
                  <TableCell>{delivery.tanda}</TableCell>
                  <TableCell>{delivery.paradas.length}</TableCell>
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
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDelivery ? 'Editar' : 'Nuevo'} Reparto</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 pr-1">
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
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isSubmitting}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) || isSubmitting }
                          initialFocus
                          locale={es}
                        />
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
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Seleccionar repartidor" /></SelectTrigger>
                      </FormControl>
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
              <FormField
                control={form.control}
                name="zona_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zona de Reparto</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Seleccionar zona" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {zones.map((zone) => (
                          <SelectItem key={zone.id} value={zone.id}>{zone.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paradas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paradas (IDs de Parada, ordenados y separados por coma)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ej: uuid-stop1, uuid-stop3, uuid-stop2" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="tanda"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tanda de Entrega</FormLabel>
                        <FormControl>
                        <Input type="number" min="1" placeholder="Ej: 1" {...field} disabled={isSubmitting}/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="estado_entrega"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Estado de Entrega</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={isSubmitting}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {ALL_DELIVERY_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
               </div>
              <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isSubmitting}>Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
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
