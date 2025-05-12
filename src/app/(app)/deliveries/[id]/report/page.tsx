
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/shared/page-header';
import { supabase } from '@/lib/supabaseClient';
import type { Delivery, DetalleReparto } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

type ReportData = Delivery & {
  repartidores: { nombre: string } | null;
  zonas: { nombre: string } | null;
  clientesnuestros: { id: string, nombre: string } | null;
  detallesreparto: (DetalleReparto & {
    clientesreparto: { id: number, nombre: string, direccion: string, horario_inicio?: string | null, horario_fin?: string | null, restricciones?: string | null } | null;
  })[];
};


export default function DeliveryReportPage() {
  const params = useParams();
  const deliveryId = params.id as string;
  const { toast } = useToast();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (deliveryId) {
      const fetchReportData = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('repartos')
            .select(`
              id,
              fecha,
              tanda,
              estado_entrega,
              repartidores (nombre),
              zonas (nombre),
              clientesnuestros (id, nombre),
              detallesreparto (
                id,
                valor_entrega,
                detalle_entrega,
                orden_visita,
                clientesreparto (id, nombre, direccion, horario_inicio, horario_fin, restricciones)
              )
            `)
            .eq('id', deliveryId)
            .single();

          if (error) throw error;
          if (data) {
             // Ensure detallesreparto is sorted
            const sortedData = {
              ...data,
              detallesreparto: data.detallesreparto 
                ? [...data.detallesreparto].sort((a,b) => a.orden_visita - b.orden_visita) 
                : [],
            } as ReportData;
            setReportData(sortedData);
          }
        } catch (error: any) {
          toast({
            title: "Error al cargar el reporte",
            description: error.message || "No se pudo cargar la información del reparto.",
            variant: "destructive",
          });
          console.error("Error fetching report data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchReportData();
    }
  }, [deliveryId, toast]);

  const totalStops = reportData?.detallesreparto?.length || 0;
  const totalValueToCollect = reportData?.detallesreparto?.reduce((sum, item) => sum + (item.valor_entrega || 0), 0) || 0;

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Cargando Reporte..." />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Reporte no encontrado" description="No se pudo cargar la información para este reparto." />
         <Button variant="outline" asChild>
            <Link href="/deliveries">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Repartos
            </Link>
          </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1 md:p-2 lg:p-4 print:p-0">
      <PageHeader
        title={`Reporte del Reparto #${reportData.id.substring(0, 8)}...`}
        description={`Detalles del reparto del ${format(typeof reportData.fecha === 'string' ? parseISO(reportData.fecha) : reportData.fecha, 'PPP', { locale: es })}`}
        actions={
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" asChild>
              <Link href="/deliveries">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver
              </Link>
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Exportar a PDF
            </Button>
          </div>
        }
      />

      <Card className="print:shadow-none print:border-none">
        <CardHeader>
          <CardTitle>Resumen del Reparto</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div><strong>Fecha:</strong> {format(typeof reportData.fecha === 'string' ? parseISO(reportData.fecha) : reportData.fecha, 'PPP', { locale: es })}</div>
          <div><strong>Repartidor:</strong> {reportData.repartidores?.nombre || 'N/A'}</div>
          <div><strong>Cliente Principal:</strong> {reportData.clientesnuestros?.nombre || 'N/A'}</div>
          <div><strong>Zona General:</strong> {reportData.zonas?.nombre || 'N/A'}</div>
          <div><strong>Tanda:</strong> {reportData.tanda}</div>
          <div><strong>Estado:</strong> <span className="font-semibold">{reportData.estado_entrega.charAt(0).toUpperCase() + reportData.estado_entrega.slice(1)}</span></div>
          <div className="md:col-span-1 lg:col-span-1"><strong>Total Paradas:</strong> {totalStops}</div>
          <div className="md:col-span-2 lg:col-span-2"><strong>Valor Total a Cobrar:</strong> ${totalValueToCollect.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARS</div>
        </CardContent>
      </Card>

      <Card className="print:shadow-none print:border-none">
        <CardHeader>
          <CardTitle>Detalle de Paradas</CardTitle>
          <CardDescription>Listado de todos los ítems de entrega en el orden de visita.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Cliente Destino</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Restricciones</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Notas Entrega</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.detallesreparto.length > 0 ? (
                reportData.detallesreparto.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.orden_visita + 1}</TableCell>
                    <TableCell>{item.clientesreparto?.nombre || 'N/A'}</TableCell>
                    <TableCell>{item.clientesreparto?.direccion || 'N/A'}</TableCell>
                    <TableCell>
                      {item.clientesreparto?.horario_inicio && item.clientesreparto?.horario_fin 
                        ? `${item.clientesreparto.horario_inicio} - ${item.clientesreparto.horario_fin}`
                        : item.clientesreparto?.horario_inicio || item.clientesreparto?.horario_fin || '-' }
                    </TableCell>
                    <TableCell>{item.clientesreparto?.restricciones || '-'}</TableCell>
                    <TableCell className="text-right">
                      {item.valor_entrega != null ? `$${item.valor_entrega.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                    </TableCell>
                    <TableCell>{item.detalle_entrega || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">No hay ítems de entrega para este reparto.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
