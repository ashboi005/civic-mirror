"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { motion } from "framer-motion"
import { EmptyState } from "@/components/empty-state"
import { NotificationItem } from "@/components/notification-item"

// Define the Notification type to match the NotificationItem component requirements
type Notification = {
  id: number
  title: string
  description: string
  date: string
  read: boolean
  type: "status" | "comment" | "upvote" | "nearby"
  relatedId: number
}

// Mock data for notifications
const mockNotifications: Notification[] = [
  {
    id: 1,
    title: "Issue Status Updated",
    description: "Your report 'Pothole on Main Street' has been updated to 'In Progress'",
    date: "2024-04-18T10:30:00",
    read: false,
    type: "status",
    relatedId: 1,
  },
  {
    id: 2,
    title: "New Comment",
    description: "John Doe commented on your report 'Broken Street Light'",
    date: "2024-04-17T14:45:00",
    read: false,
    type: "comment",
    relatedId: 2,
  },
  {
    id: 3,
    title: "Issue Resolved",
    description: "Your report 'Garbage Overflow' has been marked as resolved",
    date: "2024-04-16T09:15:00",
    read: true,
    type: "status",
    relatedId: 3,
  },
  {
    id: 4,
    title: "Upvote Received",
    description: "Your report 'Pothole on Main Street' received 5 new upvotes",
    date: "2024-04-15T16:20:00",
    read: true,
    type: "upvote",
    relatedId: 1,
  },
  {
    id: 5,
    title: "New Nearby Issue",
    description: "A new issue 'Fallen Tree' was reported near your location",
    date: "2024-04-14T11:05:00",
    read: true,
    type: "nearby",
    relatedId: 5,
  },
]

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [notifications, setNotifications] = useState(mockNotifications)

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true
    if (filter === "unread") return !notification.read
    if (filter === "read") return notification.read
    return true
  })

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    )
  }

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <DashboardHeader />

      <div className="container px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-6 md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr]">
          <DashboardNav />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
                <p className="text-muted-foreground">Stay updated on your reports and community activity</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <CheckCircle className="h-4 w-4" /> Mark All Read
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <div className="flex items-center justify-between">
                <TabsList className="bg-gray-800/50">
                  <TabsTrigger value="all" onClick={() => setFilter("all")}>
                    All
                  </TabsTrigger>
                  <TabsTrigger value="unread" onClick={() => setFilter("unread")}>
                    Unread
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-purple-500/20 text-purple-400">
                        {unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="read" onClick={() => setFilter("read")}>
                    Read
                  </TabsTrigger>
                </TabsList>
              </div>

              <Card className="border-gray-800 bg-black/40 backdrop-blur-sm mt-6">
                {filteredNotifications.length > 0 ? (
                  <motion.div className="divide-y divide-gray-800" variants={container} initial="hidden" animate="show">
                    {filteredNotifications.map((notification) => (
                      <motion.div key={notification.id} variants={item}>
                        <NotificationItem
                          notification={notification}
                          onMarkAsRead={() => markAsRead(notification.id)}
                          onDelete={() => deleteNotification(notification.id)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <CardContent className="p-6">
                    <EmptyState
                      title="No notifications"
                      description={
                        filter === "unread"
                          ? "You have no unread notifications."
                          : "You have no notifications at the moment."
                      }
                      icon="bell"
                    />
                  </CardContent>
                )}
              </Card>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
