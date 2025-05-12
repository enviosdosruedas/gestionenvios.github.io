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
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';

const zoneSchema = z.object({
  nombre: z.string().min(1, 'El nombre de la zona es requerido'),
});

type ZoneFormData = z.infer<typeof zoneSchema>;

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const { toast } = useToast();

  const form = useForm<ZoneFormData>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      nombre: '',
    },
  });

  const fetchZones = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('zonas').select('*').order('nombre', { ascending: true });
      if (error) throw error;
      setZones(data || []);
    } catch (error: any) {
      toast({ title: "Error al cargar zonas", description: error.message || "No se pudieron cargar las zonas.", variant: "destructive" });
      console.error("Error fetching zones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  useEffect(() => {
    if (editingZone) {
      form.reset({ nombre: editingZone.nombre });
    } else {
      form.reset({ nombre: '' });
    }
  }, [editingZone, form, isDialogOpen]);

  const onSubmit = async (data: ZoneFormData) => {
    setIsSubmitting(true);
    try {
      if (editingZone) {
        const { error } = await supabase.from('zonas').update(data).eq('id', editingZone.id);
        if (error) throw error;
        toast({ title: "Zona Actualizada", description: "La zona ha sido actualizada con éxito." });
      } else {
        const { error } = await supabase.from('zonas').insert([data]);
        if (error) throw error;
        toast({ title: "Zona Creada", description: "La nueva zona ha sido creada con éxito." });
      }
      fetchZones();
      setEditingZone(null);
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Error al guardar", description: error.message || "Ocurrió un error al guardar la zona.", variant: "destructive" });
      console.error("Error submitting zone:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('zonas').delete().eq('id', id);
      if (error) throw error;
      fetchZones();
      toast({ title: "Zona Eliminada", description: "La zona ha sido eliminada.", variant: "destructive" });
    } catch (error: any) {
      toast({ title: "Error al eliminar", description: error.message || "Ocurrió un error al eliminar la zona.", variant: "destructive" });
      console.error("Error deleting zone:", error);
    }
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
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre de la Zona</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zones.map((zone) => (
                  <TableRow key={zone.id}>
                    <TableCell className="font-mono text-xs">{zone.id}</TableCell>
                    <TableCell className="font-medium">{zone.nombre}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(zone)} disabled={isSubmitting}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(zone.id)} disabled={isSubmitting}>
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
                      <Input placeholder="Ej: Macrocentro" {...field} disabled={isSubmitting} />
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
                  Guardar Zona
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
