'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Users,
  ImageIcon,
  Settings,
  LogOut,
} from 'lucide-react'

interface AdminSidebarProps {
  children: React.ReactNode
}

interface LinkItem {
  label: string
  href: string
  icon: React.ReactNode
}

export default function AdminSidebar({ children }: AdminSidebarProps) {
  const [open, setOpen] = useState(false)

  const iconClass = 'text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0'

  const links: LinkItem[] = [
    {
      label: 'Dashboard',
      href: '/admin-dashboard',
      icon: <LayoutDashboard className={iconClass} />,
    },
    {
      label: 'Manage Users',
      href: '/users',
      icon: <Users className={iconClass} />,
    },
    {
      label: 'Tickets',
      href: '/tickets',
      icon: <ImageIcon className={iconClass} />,
    },
    {
      label: 'Analytics',
      href: '/analytics',
      icon: <Settings className={iconClass} />,
    },
    {
      label: 'Logout',
      href: '/logout',
      icon: <LogOut className={iconClass} />,
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-neutral-900">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          
        </SidebarBody>
      </Sidebar>

      <main className="flex-1 p-4 md:p-10">{children}</main>
    </div>
  )
}

const Logo = () => (
  <Link
    href="/dashboard"
    className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
  >
    <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-medium text-black dark:text-white whitespace-pre"
    >
      Civic Mirror
    </motion.span>
  </Link>
)

const LogoIcon = () => (
  <Link
    href="/dashboard"
    className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
  >
    <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
  </Link>
)
