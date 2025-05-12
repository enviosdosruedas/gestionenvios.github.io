
'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Users, MapPin, ShoppingBag, RouteIcon, PackageSearch, Hourglass, AlertTriangle, ClipboardList } from "lucide-react";
import Link from "next/link";
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

// Initial static data for daily KPI cards, values will be updated dynamically
const dailyKpiCardsData = [
  { title: "Repartos de Hoy", icon: PackageSearch, description: "Total programados" },
  { title: "Entregas Pendientes", icon: Hourglass, description: "Por completar hoy" },
  { title: "Repartidores Activos (Total)", icon: Truck, description: "Listos para operar" },
  { title: "Incidentes Hoy", icon: AlertTriangle, description: "Requiere atención", variant: "destructive" as const },
];

const generalKpiCards = [
  { title: "Clientes Totales", value: "87", icon: Users, href: "/clients", description: "Ver lista de clientes" },
  { title: "Zonas Cubiertas", value: "5", icon: MapPin, href: "/zones", description: "Administrar zonas" },
  { title: "Productos Activos", value: "30+", icon: ShoppingBag, href: "/products", description: "Catálogo de productos" },
];

interface OperationalStatus {
  repartosEnCurso: number;
  repartidoresActivos: number;
  totalRepartidores: number;
  alertasSistema: number;
  repartosProgramadosHoy: number;
  entregasPendientesHoy: number;
}

export default function DashboardPage() {
  const [operationalStatus, setOperationalStatus] = useState<OperationalStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  useEffect(() => {
    const fetchOperationalStatus = async () => {
      setIsLoadingStatus(true);
      try {
        const today = format(new Date(), 'yyyy-MM-dd');

        const [
          repartosEnCursoRes,
          repartidoresActivosRes,
          totalRepartidoresRes,
          alertasSistemaRes,
          repartosProgramadosHoyRes,
          entregasPendientesHoyRes
        ] = await Promise.all([
          supabase
            .from('repartos')
            .select('id', { count: 'exact' })
            .eq('estado_entrega', 'en curso')
            .eq('fecha', today),
          supabase
            .from('repartidores')
            .select('id', { count: 'exact' })
            .eq('status', 'activo'),
          supabase
            .from('repartidores')
            .select('id', { count: 'exact' }),
          supabase
            .from('repartos')
            .select('id', {count: 'exact'})
            .eq('fecha', today)
            .in('estado_entrega', ['cancelado', 'reprogramado']),
          supabase // repartosProgramadosHoy
            .from('repartos')
            .select('id', { count: 'exact' })
            .eq('fecha', today),
          supabase // entregasPendientesHoy
            .from('repartos')
            .select('id', { count: 'exact' })
            .eq('fecha', today)
            .eq('estado_entrega', 'pendiente')
        ]);
        
        if (repartosEnCursoRes.error) throw repartosEnCursoRes.error;
        if (repartidoresActivosRes.error) throw repartidoresActivosRes.error;
        if (totalRepartidoresRes.error) throw totalRepartidoresRes.error;
        if (alertasSistemaRes.error) throw alertasSistemaRes.error;
        if (repartosProgramadosHoyRes.error) throw repartosProgramadosHoyRes.error;
        if (entregasPendientesHoyRes.error) throw entregasPendientesHoyRes.error;

        setOperationalStatus({
          repartosEnCurso: repartosEnCursoRes.count || 0, // Use count from Supabase response
          repartidoresActivos: repartidoresActivosRes.count || 0,
          totalRepartidores: totalRepartidoresRes.count || 0,
          alertasSistema: alertasSistemaRes.count || 0,
          repartosProgramadosHoy: repartosProgramadosHoyRes.count || 0,
          entregasPendientesHoy: entregasPendientesHoyRes.count || 0,
        });

      } catch (error) {
        console.error("Error fetching operational status:", error);
        setOperationalStatus({
          repartosEnCurso: 0,
          repartidoresActivos: 0,
          totalRepartidores: 0,
          alertasSistema: 0,
          repartosProgramadosHoy: 0,
          entregasPendientesHoy: 0,
        });
      } finally {
        setIsLoadingStatus(false);
      }
    };

    fetchOperationalStatus();
  }, []);

  const dailyKpiCards = dailyKpiCardsData.map(card => {
    let value: string | number = "...";
    if (!isLoadingStatus && operationalStatus) {
      switch (card.title) {
        case "Repartos de Hoy":
          value = operationalStatus.repartosProgramadosHoy;
          break;
        case "Entregas Pendientes":
          value = operationalStatus.entregasPendientesHoy;
          break;
        case "Repartidores Activos (Total)":
          value = `${operationalStatus.repartidoresActivos} / ${operationalStatus.totalRepartidores}`;
          break;
        case "Incidentes Hoy":
          value = operationalStatus.alertasSistema;
          break;
        default:
          value = "..."; 
      }
    }
    return { ...card, value };
  });


  return (
    <div className="container mx-auto py-2 overflow-auto"> {/* Added overflow-auto */}
      <PageHeader
        title="Dashboard General del Día"
        description="Resumen de la operación y accesos directos para Viandas Express Admin."
      />

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Actividad de Hoy</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {dailyKpiCards.map((card) => (
            <Card key={card.title} className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${card.variant === 'destructive' ? 'border-destructive bg-destructive/10' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${card.variant === 'destructive' ? 'text-destructive' : 'text-primary'}`}>
                  {card.title}
                </CardTitle>
                <card.icon className={`h-5 w-5 ${card.variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'}`} aria-hidden="true" />
              </CardHeader>
              <CardContent>
                {isLoadingStatus ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className={`text-3xl font-bold ${card.variant === 'destructive' ? 'text-destructive' : 'text-foreground'}`}>{card.value}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      <div className="grid gap-8 md:grid-cols-3">
        <section className="md:col-span-1">
          <Card className="shadow-lg h-full">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Acciones Rápidas</CardTitle>
              <CardDescription>Tareas comunes a un clic.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3"> {/* Changed to flex flex-col for better stacking */}
              <Button asChild variant="outline" className="w-full justify-start hover:bg-secondary/20">
                <Link href="/deliveries">
                  <ClipboardList className="mr-2 h-4 w-4 text-accent" aria-hidden="true" />
                  Ver Repartos de Hoy
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start hover:bg-secondary/20">
                <Link href="/deliveries">
                  <Truck className="mr-2 h-4 w-4 text-accent" aria-hidden="true" />
                  Nuevo Reparto
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start hover:bg-secondary/20">
                <Link href="/optimize-route">
                  <RouteIcon className="mr-2 h-4 w-4 text-accent" aria-hidden="true" />
                  Optimizar Ruta
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start hover:bg-secondary/20">
                <Link href="/clients">
                  <Users className="mr-2 h-4 w-4 text-accent" aria-hidden="true" />
                  Registrar Cliente
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="md:col-span-2">
           <h2 className="text-xl font-semibold text-foreground mb-4">Información General</h2>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3 mb-6">
            {generalKpiCards.map((card) => (
            <Card key={card.title} className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">
                    {card.title}
                </CardTitle>
                <card.icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold text-foreground">{card.value}</div>
                 <Link href={card.href} legacyBehavior>
                    <a className="text-xs text-accent hover:underline mt-1">
                    {card.description}
                    </a>
                </Link>
                </CardContent>
            </Card>
            ))}
          </div>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Estado de la Operación</CardTitle>
              <CardDescription>Monitoreo en tiempo real.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-foreground">Repartos en Curso</p>
                  <p className="text-xs text-muted-foreground">Entregas activas ahora mismo</p>
                </div>
                {isLoadingStatus ? <Skeleton className="h-6 w-10"/> : <div className="text-lg font-semibold text-polynesian-blue-600">{operationalStatus?.repartosEnCurso ?? 0}</div>}
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-foreground">Repartidores Disponibles</p>
                  <p className="text-xs text-muted-foreground">Listos para asignar nuevas tareas</p>
                </div>
                {isLoadingStatus ? <Skeleton className="h-6 w-16"/> : <div className="text-lg font-semibold text-green-600">{operationalStatus?.repartidoresActivos ?? 0} / {operationalStatus?.totalRepartidores ?? 0}</div>}
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-foreground">Alertas del Sistema (Hoy)</p>
                  <p className="text-xs text-muted-foreground">Repartos cancelados o reprogramados hoy</p>
                </div>
                 {isLoadingStatus ? <Skeleton className="h-6 w-10"/> : <div className="text-lg font-semibold text-red-600">{operationalStatus?.alertasSistema ?? 0}</div>}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

       <section className="mt-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Próximas Funcionalidades</CardTitle>
            <CardDescription>Mejoras en desarrollo para optimizar tu gestión.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Integración de mapas para visualización de rutas en tiempo real.</li>
              <li>Reportes avanzados y personalizables sobre rendimiento de entregas.</li>
              <li>Sistema de notificaciones automáticas para clientes sobre el estado de sus pedidos.</li>
              <li>Módulo de facturación simplificado para servicios de mensajería.</li>
              <li>App móvil para repartidores con seguimiento GPS y confirmación de entrega.</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

