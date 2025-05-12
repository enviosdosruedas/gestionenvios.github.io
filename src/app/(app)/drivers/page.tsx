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
import { Driver, ALL_DRIVER_STATUSES } from '@/lib/types';
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
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';

const driverSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  identificacion: z.string().optional().nullable(),
  contacto: z.string().optional().nullable(),
  tipo_vehiculo: z.string().optional().nullable(),
  patente: z.string().optional().nullable(),
  status: z.enum(ALL_DRIVER_STATUSES),
});

type DriverFormData = z.infer<typeof driverSchema>;

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const { toast } = useToast();

  const form = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      nombre: '',
      identificacion: '',
      contacto: '',
      tipo_vehiculo: '',
      patente: '',
      status: 'activo',
    },
  });
  
  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('Repartidores').select('*').order('nombre', { ascending: true });
      if (error) throw error;
      setDrivers(data || []);
    } catch (error: any) {
      const userMessage = error?.message || "No se pudieron cargar los repartidores. Intente más tarde.";
      toast({ title: "Error al cargar repartidores", description: userMessage, variant: "destructive" });

      // Improved console logging
      if (error?.message) {
        console.error("Error fetching drivers:", error.message, "Raw error object:", error);
      } else {
        console.error("Error fetching drivers: An error occurred without a specific message. Raw error object:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (editingDriver) {
      form.reset({
        nombre: editingDriver.nombre,
        identificacion: editingDriver.identificacion || '',
        contacto: editingDriver.contacto || '',
        tipo_vehiculo: editingDriver.tipo_vehiculo || '',
        patente: editingDriver.patente || '',
        status: editingDriver.status,
      });
    } else {
      form.reset({
        nombre: '',
        identificacion: '',
        contacto: '',
        tipo_vehiculo: '',
        patente: '',
        status: 'activo',
      });
    }
  }, [editingDriver, form, isDialogOpen]);


  const onSubmit = async (data: DriverFormData) => {
    setIsSubmitting(true);
    // Ensure optional fields are null if empty string, matching Supabase expectations for potentially nullable text fields
    const submissionData = {
        ...data,
        identificacion: data.identificacion || null,
        contacto: data.contacto || null,
        tipo_vehiculo: data.tipo_vehiculo || null,
        patente: data.patente || null,
    };

    try {
      if (editingDriver) {
        const { error } = await supabase.from('Repartidores').update(submissionData).eq('id', editingDriver.id);
        if (error) throw error;
        toast({ title: "Repartidor Actualizado", description: "El repartidor ha sido actualizado con éxito." });
      } else {
        const { error } = await supabase.from('Repartidores').insert([submissionData]);
        if (error) throw error;
        toast({ title: "Repartidor Creado", description: "El nuevo repartidor ha sido creado con éxito." });
      }
      fetchDrivers();
      setEditingDriver(null);
      setIsDialogOpen(false);
    } catch (error: any) {
      const userMessage = error?.message || "Ocurrió un error al guardar el repartidor.";
      toast({ title: "Error al guardar", description: userMessage, variant: "destructive" });
      if (error?.message) {
        console.error("Error submitting driver:", error.message, "Raw error object:", error);
      } else {
        console.error("Error submitting driver: An error occurred without a specific message. Raw error object:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('Repartidores').delete().eq('id', id);
      if (error) throw error;
      fetchDrivers();
      toast({ title: "Repartidor Eliminado", description: "El repartidor ha sido eliminado.", variant: "destructive" });
    } catch (error: any) {
      const userMessage = error?.message || "Ocurrió un error al eliminar el repartidor.";
      toast({ title: "Error al eliminar", description: userMessage, variant: "destructive" });
       if (error?.message) {
        console.error("Error deleting driver:", error.message, "Raw error object:", error);
      } else {
        console.error("Error deleting driver: An error occurred without a specific message. Raw error object:", error);
      }
    }
  };

  const openEditDialog = (driver: Driver) => {
    setEditingDriver(driver);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingDriver(null);
    form.reset({ 
        nombre: '',
        identificacion: '',
        contacto: '',
        tipo_vehiculo: '',
        patente: '',
        status: 'activo',
    });
    setIsDialogOpen(true);
  };


  return (
    <>
      <PageHeader
        title="Gestión de Repartidores"
        description="Administra la información de tus repartidores."
        actions={
          <Button onClick={openNewDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Repartidor
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Identificación</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Patente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">{driver.nombre}</TableCell>
                    <TableCell>{driver.identificacion || '-'}</TableCell>
                    <TableCell>{driver.contacto || '-'}</TableCell>
                    <TableCell>{driver.tipo_vehiculo || '-'}</TableCell>
                    <TableCell>{driver.patente || '-'}</TableCell>
                    <TableCell>
                      <Badge 
                          variant={driver.status === 'activo' ? 'default' : 'secondary'} 
                          className={cn(
                              {'bg-green-500 text-primary-foreground': driver.status === 'activo'},
                              {'bg-red-500 text-destructive-foreground': driver.status === 'inactivo'}
                          )}
                      >
                        {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(driver)} disabled={isSubmitting}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(driver.id)} disabled={isSubmitting}>
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
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingDriver ? 'Editar' : 'Nuevo'} Repartidor</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Carlos Rodriguez" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="identificacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identificación (DNI/CUIT)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 20-12345678-9" {...field} value={field.value || ''} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contacto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contacto (Teléfono)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 2235123456" {...field} value={field.value || ''} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipo_vehiculo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Vehículo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Moto Honda Wave" {...field} value={field.value || ''} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="patente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patente</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: AE123FZ" {...field} value={field.value || ''} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ALL_DRIVER_STATUSES.map((status) => (
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
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting}>Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Guardar Repartidor
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
