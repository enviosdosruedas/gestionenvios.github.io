"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Truck, MapPin, ShoppingBag, Route, Settings, Building } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/drivers", label: "Repartidores", icon: Truck },
  { href: "/clients", label: "Clientes", icon: Users },
  { href: "/zones", label: "Zonas", icon: MapPin },
  { href: "/deliveries", label: "Repartos", icon: Building }, // Using Building for "Rounds/Deliveries"
  { href: "/products", label: "Productos", icon: ShoppingBag },
  { href: "/optimize-route", label: "Optimizar Rutas", icon: Route },
  // { href: "/settings", label: "Configuración", icon: Settings }, // Example, if needed later
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.label}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild
              variant="default"
              size="default"
              isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
              tooltip={item.label}
              className="justify-start"
            >
              <a>
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
