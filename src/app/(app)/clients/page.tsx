'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Client, Zone, ClientService, DayOfWeek, ALL_SERVICES, ALL_DAYS, ALL_FREQUENCIES } from '@/lib/types';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
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

const clientSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  servicios: z.array(z.string()).min(1, 'Seleccione al menos un servicio'),
  dias_de_reparto: z.array(z.string()).min(1, 'Seleccione al menos un día de reparto'),
  zona_id: z.string().min(1, 'La zona es requerida'),
  otros_detalles: z.string().optional(),
  direccion: z.string().optional(),
  horario_inicio: z.string().optional(),
  horario_fin: z.string().optional(),
  frecuencia: z.enum(ALL_FREQUENCIES).optional(),
  notas_adicionales_parada: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

// Mock data - replace with API calls
const initialClients: Client[] = [
  { id: '1', nombre: 'Empresa Alfa', servicios: ['reparto viandas', 'delivery'], dias_de_reparto: ['lunes', 'miércoles', 'viernes'], zona_id: 'zona1', otros_detalles: 'Entregar en recepción', direccion: 'Av. Colón 1234', horario_inicio: '09:00', horario_fin: '12:00', frecuencia: 'lunes, miércoles y viernes' },
  { id: '2', nombre: 'Particular Beta', servicios: ['mensajería'], dias_de_reparto: ['martes', 'jueves'], zona_id: 'zona2', direccion: 'San Martín 5678', horario_inicio: '14:00', horario_fin: '18:00', frecuencia: 'diario' },
];

const mockZones: Zone[] = [
  { id: 'zona1', nombre: 'Centro' },
  { id: 'zona2', nombre: 'Sur' },
  { id: 'zona3', nombre: 'Norte' },
];


export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [zones, setZones] = useState<Zone[]>(mockZones);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { toast } = useToast();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nombre: '',
      servicios: [],
      dias_de_reparto: [],
      zona_id: '',
      otros_detalles: '',
      direccion: '',
      horario_inicio: '',
      horario_fin: '',
      frecuencia: undefined,
      notas_adicionales_parada: '',
    },
  });

  useEffect(() => {
    if (editingClient) {
      form.reset({
        ...editingClient,
        servicios: editingClient.servicios as string[],
        dias_de_reparto: editingClient.dias_de_reparto as string[],
      });
    } else {
      form.reset({
        nombre: '',
        servicios: [],
        dias_de_reparto: [],
        zona_id: '',
        otros_detalles: '',
        direccion: '',
        horario_inicio: '',
        horario_fin: '',
        frecuencia: undefined,
        notas_adicionales_parada: '',
      });
    }
  }, [editingClient, form, isDialogOpen]);

  const onSubmit = (data: ClientFormData) => {
    const clientData = {
      ...data,
      servicios: data.servicios as ClientService[],
      dias_de_reparto: data.dias_de_reparto as DayOfWeek[],
    };

    if (editingClient) {
      setClients(
        clients.map((c) => (c.id === editingClient.id ? { ...c, ...clientData } : c))
      );
      toast({ title: "Cliente Actualizado", description: "El cliente ha sido actualizado con éxito." });
    } else {
      setClients([...clients, { id: Date.now().toString(), ...clientData }]);
      toast({ title: "Cliente Creado", description: "El nuevo cliente ha sido creado con éxito." });
    }
    setEditingClient(null);
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setClients(clients.filter((c) => c.id !== id));
    toast({ title: "Cliente Eliminado", description: "El cliente ha sido eliminado.", variant: "destructive" });
  };
  
  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingClient(null);
     form.reset({ // Reset form for new client
        nombre: '',
        servicios: [],
        dias_de_reparto: [],
        zona_id: '',
        otros_detalles: '',
        direccion: '',
        horario_inicio: '',
        horario_fin: '',
        frecuencia: undefined,
        notas_adicionales_parada: '',
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Servicios</TableHead>
                <TableHead>Días de Reparto</TableHead>
                <TableHead>Zona</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.nombre}</TableCell>
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
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(client)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
                      <Input placeholder="Ej: Panadería La Espiga" {...field} />
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
                                    return checked
                                      ? field.onChange([...(field.value || []), service])
                                      : field.onChange(
                                          (field.value || []).filter(
                                            (value) => value !== service
                                          )
                                        );
                                  }}
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
                                    return checked
                                      ? field.onChange([...(field.value || []), day])
                                      : field.onChange(
                                          (field.value || []).filter(
                                            (value) => value !== day
                                          )
                                        );
                                  }}
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              
              <h3 className="text-lg font-semibold border-t pt-4 mt-6">Detalles de Parada Principal</h3>
               <FormField
                control={form.control}
                name="direccion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección de Entrega</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Av. Siempre Viva 742" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="horario_inicio"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Horario de Inicio Preferido</FormLabel>
                        <FormControl>
                        <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="horario_fin"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Horario de Fin Preferido</FormLabel>
                        <FormControl>
                        <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
               <FormField
                control={form.control}
                name="frecuencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frecuencia de Entrega</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar frecuencia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ALL_FREQUENCIES.map((freq) => (
                          <SelectItem key={freq} value={freq}>
                            {freq.charAt(0).toUpperCase() + freq.slice(1)}
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
                name="notas_adicionales_parada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Adicionales (Parada)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ej: Tocar timbre depto B, dejar en portería si no hay nadie." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <h3 className="text-lg font-semibold border-t pt-4 mt-6">Otros Detalles del Cliente</h3>
              <FormField
                control={form.control}
                name="otros_detalles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Otros Detalles / Notas Generales</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ej: Cliente VIP, requiere factura A." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                 <DialogClose asChild>
                    <Button type="button" variant="outline">Cancelar</Button>
                 </DialogClose>
                <Button type="submit">Guardar Cliente</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
