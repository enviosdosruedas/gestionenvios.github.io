
'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import type { ClientReparto, ClienteNuestro } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import ClientRepartoForm from './client-reparto-form'; 

export default function ClientesRepartoPage() {
  const [clientsReparto, setClientsReparto] = useState<ClientReparto[]>([]);
  const [clientesNuestros, setClientesNuestros] = useState<Pick<ClienteNuestro, 'id' | 'nombre'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClientReparto, setEditingClientReparto] = useState<ClientReparto | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [clientsRepartoRes, clientesNuestrosRes] = await Promise.all([
        supabase.from('clientesreparto') // Corrected table name
          .select(`
            id,
            nombre,
            direccion,
            horario_inicio,
            horario_fin,
            restricciones,
            tipo_reparto,
            dias_especificos,
            cliente_nuestro_id,
            created_at,
            updated_at,
            clientesnuestros (nombre)
          `)
          .order('nombre', { ascending: true }),
        supabase.from('clientesnuestros').select('id, nombre').order('nombre', { ascending: true })
      ]);

      if (clientsRepartoRes.error) {
        console.error("Supabase error (ClientesReparto):", clientsRepartoRes.error);
        throw new Error(`Error al cargar clientes de reparto: ${clientsRepartoRes.error.message} (Código: ${clientsRepartoRes.error.code})`);
      }
      setClientsReparto(clientsRepartoRes.data || []);

      if (clientesNuestrosRes.error) {
        console.error("Supabase error (ClientesNuestros):", clientesNuestrosRes.error);
        throw new Error(`Error al cargar clientes principales: ${clientesNuestrosRes.error.message} (Código: ${clientesNuestrosRes.error.code})`);
      }
      setClientesNuestros(clientesNuestrosRes.data || []);

    } catch (error: any) {
      toast({ title: "Error al cargar datos", description: error.message || "No se pudieron cargar los datos necesarios.", variant: "destructive" });
      console.error("Error in fetchData (ClientesRepartoPage):", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormSubmit = async (data: Omit<ClientReparto, 'id' | 'created_at' | 'updated_at' | 'clientesnuestros'>) => {
    setIsSubmitting(true);
    const submissionData = {
      ...data,
      horario_inicio: data.horario_inicio || null,
      horario_fin: data.horario_fin || null,
      restricciones: data.restricciones || null,
      tipo_reparto: data.tipo_reparto || null,
      dias_especificos: data.dias_especificos?.length ? data.dias_especificos : null,
    };
    
    try {
      if (editingClientReparto) {
        const { error } = await supabase.from('clientesreparto').update(submissionData).eq('id', editingClientReparto.id);
        if (error) throw error;
        toast({ title: "Cliente de Reparto Actualizado", description: "El cliente ha sido actualizado con éxito." });
      } else {
        const { error } = await supabase.from('clientesreparto').insert([submissionData]);
        if (error) throw error;
        toast({ title: "Cliente de Reparto Creado", description: "El nuevo cliente ha sido creado con éxito." });
      }
      fetchData();
      setEditingClientReparto(null);
      setIsDialogOpen(false);
    } catch (error: any) {
       toast({ title: "Error al guardar", description: error.message || "Ocurrió un error al guardar el cliente.", variant: "destructive" });
       console.error("Error submitting client reparto:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from('clientesreparto').delete().eq('id', id);
      if (error) throw error;
      fetchData();
      toast({ title: "Cliente de Reparto Eliminado", description: "El cliente ha sido eliminado.", variant: "destructive" });
    } catch (error: any) {
      toast({ title: "Error al eliminar", description: error.message || "Ocurrió un error al eliminar el cliente.", variant: "destructive" });
      console.error("Error deleting client reparto:", error);
    }
  };
  
  const openEditDialog = (clientReparto: ClientReparto) => {
    setEditingClientReparto(clientReparto);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingClientReparto(null);
    setIsDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Gestión de Clientes de Reparto"
        description="Administra los clientes terciarios (clientes de tus clientes)."
        actions={
          <Button onClick={openNewDialog} disabled={isLoading || isSubmitting}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Cliente de Reparto
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
                <TableHead>Nombre</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Cliente Principal</TableHead>
                <TableHead>Tipo Reparto</TableHead>
                <TableHead>Días Específicos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientsReparto.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.nombre}</TableCell>
                  <TableCell>{client.direccion}</TableCell>
                  <TableCell>{client.clientesnuestros?.nombre || 'N/A'}</TableCell>
                  <TableCell>{client.tipo_reparto ? client.tipo_reparto.charAt(0).toUpperCase() + client.tipo_reparto.slice(1) : '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {client.dias_especificos?.map(d => <Badge key={d} variant="outline">{d.charAt(0).toUpperCase() + d.slice(1)}</Badge>) || '-'}
                    </div>
                  </TableCell>
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

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!isSubmitting) setIsDialogOpen(open); }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingClientReparto ? 'Editar' : 'Nuevo'} Cliente de Reparto</DialogTitle>
          </DialogHeader>
          <ClientRepartoForm
            onSubmit={handleFormSubmit}
            initialData={editingClientReparto}
            clientesNuestros={clientesNuestros}
            isSubmitting={isSubmitting}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
