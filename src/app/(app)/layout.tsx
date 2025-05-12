
"use client"

import React from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
  SidebarTitle, // Ensure SidebarTitle is imported if used
} from "@/components/ui/sidebar"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { UserNav } from "@/components/layout/user-nav"
import { Toaster } from "@/components/ui/toaster"
import { SheetTitle } from "@/components/ui/sheet" // Explicitly import SheetTitle

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="p-2 border-b border-sidebar-border">
          {/* The Sheet for mobile view will contain a SheetTitle. This is for desktop. */}
          <div className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:size-8">
            <img src="/favicon.svg" alt="ViandasXpress Logo" className="h-6 w-6" />
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
      <SidebarInset className="flex flex-col min-h-screen"> {/* Ensure SidebarInset can grow */}
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
            <SidebarTrigger className="sm:hidden" />
            {/* Add breadcrumbs or page title here if needed */}
          </header>
          <main className="flex-1 overflow-y-auto p-4 sm:px-6 sm:py-0"> {/* Changed overflow-auto to overflow-y-auto for better control */}
            {children}
          </main>
          <Toaster />
      </SidebarInset>
       <SidebarRail />
    </SidebarProvider>
  )
}

