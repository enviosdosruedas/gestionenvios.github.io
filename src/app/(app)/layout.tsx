"use client"

import React from "react"
import { Package2 } from "lucide-react"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { UserNav } from "@/components/layout/user-nav"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="p-2 border-b border-sidebar-border">
          <div className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:size-8">
            <Package2 className="h-6 w-6 text-sidebar-primary" />
            <span className="font-semibold text-lg text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              ViandasXpress
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-0">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-sidebar-border">
          <UserNav />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
            <SidebarTrigger className="sm:hidden" />
            {/* Add breadcrumbs or page title here if needed */}
          </header>
          <main className="flex-1 overflow-auto p-4 sm:px-6 sm:py-0">
            {children}
          </main>
          <Toaster />
      </SidebarInset>
       <SidebarRail />
    </SidebarProvider>
  )
}
