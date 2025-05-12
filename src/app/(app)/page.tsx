import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Users, MapPin, ShoppingBag, RouteIcon } from "lucide-react";
import Link from "next/link";

const kpiCards = [
  { title: "Repartidores", value: "12", icon: Truck, href: "/drivers", description: "Gestionar repartidores" },
  { title: "Clientes Activos", value: "87", icon: Users, href: "/clients", description: "Ver lista de clientes" },
  { title: "Zonas Cubiertas", value: "5", icon: MapPin, href: "/zones", description: "Administrar zonas" },
  { title: "Productos", value: "30+", icon: ShoppingBag, href: "/products", description: "Catálogo de productos" },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Dashboard Principal"
        description="Bienvenido a Viandas Express Admin. Aquí puedes ver un resumen de la operación."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <Card key={card.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">
                {card.title}
              </CardTitle>
              <card.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{card.value}</div>
              <Link href={card.href} legacyBehavior>
                <a className="text-xs text-accent hover:underline mt-1">
                  {card.description}
                </a>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Acciones Rápidas</CardTitle>
            <CardDescription>Accesos directos a las tareas más comunes.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/deliveries/new" legacyBehavior>
              <a className="flex items-center gap-3 rounded-md bg-secondary/20 p-3 hover:bg-secondary/30 transition-colors">
                <Truck className="h-5 w-5 text-secondary-foreground" />
                <span className="font-medium text-secondary-foreground">Crear Nuevo Reparto</span>
              </a>
            </Link>
            <Link href="/optimize-route" legacyBehavior>
              <a className="flex items-center gap-3 rounded-md bg-secondary/20 p-3 hover:bg-secondary/30 transition-colors">
                <RouteIcon className="h-5 w-5 text-secondary-foreground" />
                <span className="font-medium text-secondary-foreground">Optimizar Ruta de Entrega</span>
              </a>
            </Link>
             <Link href="/clients/new" legacyBehavior>
              <a className="flex items-center gap-3 rounded-md bg-secondary/20 p-3 hover:bg-secondary/30 transition-colors">
                <Users className="h-5 w-5 text-secondary-foreground" />
                <span className="font-medium text-secondary-foreground">Registrar Nuevo Cliente</span>
              </a>
            </Link>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Próximamente</CardTitle>
            <CardDescription>Funcionalidades en desarrollo.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Reportes avanzados de entregas</li>
              <li>Integración con notificaciones a clientes</li>
              <li>Módulo de facturación simplificado</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
