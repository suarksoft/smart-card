"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Droplets,
  LayoutDashboard,
  Wallet,
  Gift,
  UserPlus,
  SproutIcon as Seedling,
  PawPrint,
  TrendingUp,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const mainMenuItems = [
  { href: "/", label: "Ana Panel", icon: LayoutDashboard },
  { href: "/wallet", label: "Cüzdan", icon: Wallet },
]

const specialModules = [
  { href: "/tohum", label: "Tohum ID", icon: Seedling },
  { href: "/bagis", label: "Bağış Yap ", icon: Gift },
  { href: "/proje-basvuru", label: "Fon Topla ", icon: TrendingUp },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <Droplets className="h-8 w-8 text-aqua-500" />
          <div>
            <h1 className="text-2xl font-bold text-aqua-800">AquaSave</h1>
            <p className="text-xs text-muted-foreground">Su Tasarrufu Platformu</p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel>Ana Menü</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      className={cn(
                        "w-full justify-start hover:bg-aqua-100/50 hover:text-aqua-700 transition-colors",
                        pathname === item.href && "bg-aqua-100 text-aqua-700 font-semibold",
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Özel Modüller</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {specialModules.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      className={cn(
                        "w-full justify-start hover:bg-teal-100/50 hover:text-teal-700 transition-colors",
                        pathname === item.href && "bg-teal-100 text-teal-700 font-semibold",
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Link href="/kayit">
          <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white">
            <UserPlus className="mr-2 h-4 w-4" />
            Su Kartı Kaydet
          </Button>
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}
