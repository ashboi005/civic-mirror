"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Home, FileText, Bell, Settings, LogOut, Users, ThumbsUp } from "lucide-react"
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
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
    },
  ]

  // Mobile nav items - smaller subset for bottom navigation
  const mobileNavItems = [
    {
      label: "Home",
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Reports",
      icon: FileText,
      href: "/dashboard/reports",
      active: pathname === "/dashboard/reports",
    },
    {
      label: "Notifications",
      icon: Bell,
      href: "/dashboard/notifications",
      active: pathname === "/dashboard/notifications",
    },
    {
      label: "More",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings" || 
              pathname === "/dashboard/community" || 
              pathname === "/dashboard/upvotes",
    },
  ]

  return (
    <>
      {/* Desktop sidebar navigation */}
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

      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/90 backdrop-blur-sm border-t border-gray-800">
        <div className="flex justify-around items-center h-16">
          {mobileNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full px-1 py-1",
                item.active
                  ? "text-white"
                  : "text-gray-400"
              )}
            >
              <item.icon className={cn("h-5 w-5 mb-1", item.active && "text-purple-500")} />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
