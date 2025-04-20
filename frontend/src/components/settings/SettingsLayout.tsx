"use client"

import React from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Bell, Shield, UserCircle } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"

interface SettingsLayoutProps {
  children: React.ReactNode
  activeTab: string
  setActiveTab: (value: string) => void
}

export function SettingsLayout({ children, activeTab, setActiveTab }: SettingsLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90 pb-16 md:pb-0">
      <DashboardHeader />

      <div className="container px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-6 md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr]">
          <DashboardNav />

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
              <p className="text-muted-foreground">Manage your account preferences and settings</p>
            </div>

            <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
              <TabsList className="bg-gray-800/50 mb-6 flex flex-wrap gap-2 overflow-x-auto">
                <TabsTrigger value="profile" className="flex-1 min-w-[120px]">
                  <User className="h-4 w-4 mr-2" /> Profile
                </TabsTrigger>
                <TabsTrigger value="personal-details" className="flex-1 min-w-[120px]">
                  <UserCircle className="h-4 w-4 mr-2" /> Personal Details
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex-1 min-w-[120px]">
                  <Bell className="h-4 w-4 mr-2" /> Notifications
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex-1 min-w-[120px]">
                  <Shield className="h-4 w-4 mr-2" /> Privacy
                </TabsTrigger>
              </TabsList>

              {children}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}