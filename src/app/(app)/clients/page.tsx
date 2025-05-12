'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
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
import { Client, Zone, ClientService, DayOfWeek, ALL_SERVICES, ALL_DAYS } from '@/lib/types';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';

const clientSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  direccion_retiro: z.string().optional().nullable(),
  servicios: z.array(z.string()).min(1, 'Seleccione al menos un servicio'),
  dias_de_reparto: z.array(z.string()).min(1, 'Seleccione al menos un día de reparto'),
  zona_id: z.string().min(1, 'La zona es requerida'),
  otros_detalles: z.string().optional().nullable(),
});

type ClientFormData = z.infer<typeof clientSchema>;

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { toast } = useToast();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nombre: '',
      direccion_retiro: '',
      servicios: [],
      dias_de_reparto: [],
      zona_id: '',
      otros_detalles: '',
    },
  });

  const fetchClientsAndZones = async () => {
    setIsLoading(true);
    try {
      const [clientsRes, zonesRes] = await Promise.all([
        supabase.from('clientesnuestros').select('*').order('nombre', { ascending: true }),
        supabase.from('zonas').select('*').order('nombre', { ascending: true })
      ]);

      if (clientsRes.error) throw clientsRes.error;
      setClients(clientsRes.data || []);

      if (zonesRes.error) throw zonesRes.error;
      setZones(zonesRes.data || []);

    } catch (error: any) {
      toast({ title: "Error al cargar datos", description: error.message || "No se pudieron cargar clientes o zonas.", variant: "destructive" });
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientsAndZones();
  }, []);

  useEffect(() => {
    if (editingClient) {
      form.reset({
        nombre: editingClient.nombre,
        direccion_retiro: editingClient.direccion_retiro || '',
        servicios: editingClient.servicios as string[],
        dias_de_reparto: editingClient.dias_de_reparto as string[],
        zona_id: editingClient.zona_id,
        otros_detalles: editingClient.otros_detalles || '',
      });
    } else {
      form.reset({
        nombre: '',
        direccion_retiro: '',
        servicios: [],
        dias_de_reparto: [],
        zona_id: '',
        otros_detalles: '',
      });
    }
  }, [editingClient, form, isDialogOpen]);

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    const submissionData = {
      ...data,
      servicios: data.servicios as ClientService[],
      dias_de_reparto: data.dias_de_reparto as DayOfWeek[],
      direccion_retiro: data.direccion_retiro || null,
      otros_detalles: data.otros_detalles || null,
    };

    try {
      if (editingClient) {
        const { error } = await supabase.from('clientesnuestros').update(submissionData).eq('id', editingClient.id);
        if (error) throw error;
        toast({ title: "Cliente Actualizado", description: "El cliente ha sido actualizado con éxito." });
      } else {
        const { error } = await supabase.from('clientesnuestros').insert([submissionData]);
        if (error) throw error;
        toast({ title: "Cliente Creado", description: "El nuevo cliente ha sido creado con éxito." });
      }
      fetchClientsAndZones();
      setEditingClient(null);
      setIsDialogOpen(false);
    } catch (error: any) {
       toast({ title: "Error al guardar", description: error.message || "Ocurrió un error al guardar el cliente.", variant: "destructive" });
       console.error("Error submitting client:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('clientesnuestros').delete().eq('id', id);
      if (error) throw error;
      fetchClientsAndZones();
      toast({ title: "Cliente Eliminado", description: "El cliente ha sido eliminado.", variant: "destructive" });
    } catch (error: any) {
      toast({ title: "Error al eliminar", description: error.message || "Ocurrió un error al eliminar el cliente.", variant: "destructive" });
      console.error("Error deleting client:", error);
    }
  };
  
  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingClient(null);
     form.reset({ 
        nombre: '',
        direccion_retiro: '',
        servicios: [],
        dias_de_reparto: [],
        zona_id: '',
        otros_detalles: '',
      });
    setIsDialogOpen(true);
  };

  const getZoneName = (zoneId: string) => zones.find(z => z.id === zoneId)?.nombre || 'N/A';

  return (
    <>
      <PageHeader
        title="Gestión de Clientes"
        description="Administra la información de tus clientes (ClientesNuestros)."
        actions={
          <Button onClick={openNewDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        }
      />
      <Card>
        <CardContent className="p-0">
           {isLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(5)].map((_, i) => ( // Show more skeletons for a typically longer table
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Dirección Retiro</TableHead>
                <TableHead>Servicios</TableHead>
                <TableHead>Días de Reparto</TableHead>
                <TableHead>Zona</TableHead>
                <TableHead>Otros Detalles</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.nombre}</TableCell>
                  <TableCell>{client.direccion_retiro || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {client.servicios.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex flex-wrap gap-1">
                        {client.dias_de_reparto.map(d => <Badge key={d} variant="outline">{d.charAt(0).toUpperCase() + d.slice(1)}</Badge>)}
                     </div>
                  </TableCell>
                  <TableCell>{getZoneName(client.zona_id)}</TableCell>
                  <TableCell>{client.otros_detalles || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(client)} disabled={isSubmitting}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)} disabled={isSubmitting}>
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
            <DialogTitle>{editingClient ? 'Editar' : 'Nuevo'} Cliente</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 pr-2">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Panadería La Espiga" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="direccion_retiro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección de Retiro (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Av. Libertad 3000" {...field} value={field.value || ''} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="servicios"
                render={() => (
                  <FormItem>
                    <FormLabel>Servicios Contratados</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                    {ALL_SERVICES.map((service) => (
                      <FormField
                        key={service}
                        control={form.control}
                        name="servicios"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(service)}
                                  onCheckedChange={(checked) => {
                                    const newValue = checked
                                      ? [...(field.value || []), service]
                                      : (field.value || []).filter(
                                          (value) => value !== service
                                        );
                                    field.onChange(newValue);
                                  }}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {service.charAt(0).toUpperCase() + service.slice(1)}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dias_de_reparto"
                render={() => (
                  <FormItem>
                    <FormLabel>Días de Reparto Asignados</FormLabel>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {ALL_DAYS.map((day) => (
                      <FormField
                        key={day}
                        control={form.control}
                        name="dias_de_reparto"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(day)}
                                  onCheckedChange={(checked) => {
                                    const newValue = checked
                                      ? [...(field.value || []), day]
                                      : (field.value || []).filter(
                                          (value) => value !== day
                                        );
                                    field.onChange(newValue);
                                  }}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {day.charAt(0).toUpperCase() + day.slice(1)}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zona_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zona de Entrega</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar zona" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {zones.map((zone) => (
                          <SelectItem key={zone.id} value={zone.id}>
                            {zone.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="otros_detalles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Otros Detalles / Notas Generales</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ej: Cliente VIP, requiere factura A." {...field} value={field.value || ''} disabled={isSubmitting}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                 <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isSubmitting}>Cancelar</Button>
                 </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Guardar Cliente
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
