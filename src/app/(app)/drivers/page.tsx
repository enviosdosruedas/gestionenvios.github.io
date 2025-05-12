'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
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

const driverSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  identificacion: z.string().optional(),
  contacto: z.string().optional(),
  tipo_vehiculo: z.string().optional(),
  patente: z.string().optional(),
  status: z.enum(ALL_DRIVER_STATUSES),
});

type DriverFormData = z.infer<typeof driverSchema>;

// Mock data - replace with API calls
const initialDrivers: Driver[] = [
  { id: '1', nombre: 'Juan Perez', contacto: '123456789', tipo_vehiculo: 'Moto', patente: 'ABC 123', status: 'activo' },
  { id: '2', nombre: 'Maria Lopez', contacto: '987654321', tipo_vehiculo: 'Auto', patente: 'DEF 456', status: 'inactivo' },
];

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
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
  
  useEffect(() => {
    if (editingDriver) {
      form.reset(editingDriver);
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


  const onSubmit = (data: DriverFormData) => {
    if (editingDriver) {
      setDrivers(
        drivers.map((d) => (d.id === editingDriver.id ? { ...editingDriver, ...data } : d))
      );
      toast({ title: "Repartidor Actualizado", description: "El repartidor ha sido actualizado con éxito." });
    } else {
      setDrivers([...drivers, { id: Date.now().toString(), ...data }]);
      toast({ title: "Repartidor Creado", description: "El nuevo repartidor ha sido creado con éxito." });
    }
    setEditingDriver(null);
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setDrivers(drivers.filter((d) => d.id !== id));
    toast({ title: "Repartidor Eliminado", description: "El repartidor ha sido eliminado.", variant: "destructive" });
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
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(driver)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(driver.id)}>
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
                      <Input placeholder="Ej: Carlos Rodriguez" {...field} />
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
                        <Input placeholder="Ej: 20-12345678-9" {...field} value={field.value || ''} />
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
                        <Input placeholder="Ej: 2235123456" {...field} value={field.value || ''} />
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
                        <Input placeholder="Ej: Moto Honda Wave" {...field} value={field.value || ''} />
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
                        <Input placeholder="Ej: AE123FZ" {...field} value={field.value || ''} />
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
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit">Guardar Repartidor</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
