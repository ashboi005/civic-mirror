"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Home, Map, FileText, Bell, Settings, LogOut, BarChart3, Users, ThumbsUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function DashboardNav() {
  const pathname = usePathname()

  const routes = [
    {
      label: "Overview",
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "My Reports",
      icon: FileText,
      href: "/dashboard/reports",
      active: pathname === "/dashboard/reports",
    },
    {
      label: "Explore Map",
      icon: Map,
      href: "/dashboard/map",
      active: pathname === "/dashboard/map",
    },
    {
      label: "Notifications",
      icon: Bell,
      href: "/dashboard/notifications",
      active: pathname === "/dashboard/notifications",
    },
    {
      label: "My Upvotes",
      icon: ThumbsUp,
      href: "/dashboard/upvotes",
      active: pathname === "/dashboard/upvotes",
    },
    {
      label: "Community",
      icon: Users,
      href: "/dashboard/community",
      active: pathname === "/dashboard/community",
    },
    {
      label: "Statistics",
      icon: BarChart3,
      href: "/dashboard/statistics",
      active: pathname === "/dashboard/statistics",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
    },
  ]

  return (
    <motion.div
      className="hidden md:flex md:flex-col"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ScrollArea className="h-[calc(100vh-64px)] py-2">
        <div className="flex flex-col gap-1 px-2">
          {routes.map((route, i) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                route.active
                  ? "bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800",
              )}
            >
              <route.icon className={cn("h-4 w-4", route.active && "text-purple-500")} />
              {route.label}
            </Link>
          ))}
        </div>
        <div className="mt-auto px-2 py-2">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </Link>
        </div>
      </ScrollArea>
    </motion.div>
  )
}
