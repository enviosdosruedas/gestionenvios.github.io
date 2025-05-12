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
import { Zone } from '@/lib/types';
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
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

const zoneSchema = z.object({
  nombre: z.string().min(1, 'El nombre de la zona es requerido'),
});

type ZoneFormData = z.infer<typeof zoneSchema>;

// Mock data
const initialZones: Zone[] = [
  { id: 'zona1', nombre: 'Centro' },
  { id: 'zona2', nombre: 'Sur' },
  { id: 'zona3', nombre: 'Norte - La Perla' },
  { id: 'zona4', nombre: 'Puerto' },
  { id: 'zona5', nombre: 'Chauvin - Los Troncos' },
];

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>(initialZones);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const { toast } = useToast();

  const form = useForm<ZoneFormData>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      nombre: '',
    },
  });

  useEffect(() => {
    if (editingZone) {
      form.reset(editingZone);
    } else {
      form.reset({ nombre: '' });
    }
  }, [editingZone, form, isDialogOpen]);

  const onSubmit = (data: ZoneFormData) => {
    if (editingZone) {
      setZones(
        zones.map((z) => (z.id === editingZone.id ? { ...z, ...data } : z))
      );
      toast({ title: "Zona Actualizada", description: "La zona ha sido actualizada con éxito." });
    } else {
      setZones([...zones, { id: Date.now().toString(), ...data }]);
      toast({ title: "Zona Creada", description: "La nueva zona ha sido creada con éxito." });
    }
    setEditingZone(null);
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setZones(zones.filter((z) => z.id !== id));
     toast({ title: "Zona Eliminada", description: "La zona ha sido eliminada.", variant: "destructive" });
  };

  const openEditDialog = (zone: Zone) => {
    setEditingZone(zone);
    setIsDialogOpen(true);
  };
  
  const openNewDialog = () => {
    setEditingZone(null);
    form.reset({ nombre: '' });
    setIsDialogOpen(true);
  };


  return (
    <>
      <PageHeader
        title="Gestión de Zonas de Reparto"
        description="Define y administra las zonas de entrega."
        actions={
          <Button onClick={openNewDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Zona
          </Button>
        }
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre de la Zona</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.nombre}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(zone)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(zone.id)}>
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingZone ? 'Editar' : 'Nueva'} Zona</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Zona</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Macrocentro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit">Guardar Zona</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
