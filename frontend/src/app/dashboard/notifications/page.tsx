"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2 } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { motion } from "framer-motion"
import { EmptyState } from "@/components/empty-state"
import { NotificationItem } from "@/components/notification-item"
import { getAllReports, getUserReports, Report } from "@/lib/api"

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

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch reports and simulate notifications based on them
    const fetchReportsAndGenerateNotifications = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch both all reports and user reports
        const [allReports, userReports] = await Promise.all([
          getAllReports(0, 20),
          getUserReports(0, 20)
        ])
        
        // Generate simulated notifications based on reports
        const simulatedNotifications: Notification[] = []
        
        // Add status notifications for user reports
        userReports.forEach((report, index) => {
          if (report.status === "in_progress") {
            simulatedNotifications.push({
              id: simulatedNotifications.length + 1,
              title: "Issue Status Updated",
              description: `Your report '${report.title}' has been updated to 'In Progress'`,
              date: report.updated_at || new Date().toISOString(),
              read: index > 1, // First two are unread
              type: "status",
              relatedId: report.id || 0
            })
          } else if (report.status === "resolved") {
            simulatedNotifications.push({
              id: simulatedNotifications.length + 1,
              title: "Issue Resolved",
              description: `Your report '${report.title}' has been marked as resolved`,
              date: report.updated_at || new Date().toISOString(),
              read: index > 1, // First two are unread
              type: "status",
              relatedId: report.id || 0
            })
          }
        })
        
        // Add upvote notifications
        userReports.forEach((report, index) => {
          if ((report.vote_count || 0) > 0) {
            simulatedNotifications.push({
              id: simulatedNotifications.length + 1,
              title: "Upvote Received",
              description: `Your report '${report.title}' received ${report.vote_count} upvote${report.vote_count !== 1 ? 's' : ''}`,
              date: new Date(Date.now() - index * 86400000).toISOString(), // Random dates
              read: index > 2, // First three are unread
              type: "upvote",
              relatedId: report.id || 0
            })
          }
        })
        
        // Add nearby issue notifications
        allReports
          .filter(r => !userReports.some(ur => ur.id === r.id)) // Only non-user reports
          .slice(0, 3)
          .forEach((report, index) => {
            simulatedNotifications.push({
              id: simulatedNotifications.length + 1,
              title: "New Nearby Issue",
              description: `A new issue '${report.title}' was reported near your location`,
              date: report.created_at || new Date().toISOString(),
              read: index > 0, // First one is unread
              type: "nearby",
              relatedId: report.id || 0
            })
          })
        
        // Sort by date, newest first
        simulatedNotifications.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        
        setNotifications(simulatedNotifications)
      } catch (err) {
        console.error("Failed to fetch reports for notifications:", err)
        setError("Failed to load notifications. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchReportsAndGenerateNotifications()
  }, [])

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
                {loading ? (
                  <CardContent className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </CardContent>
                ) : error ? (
                  <CardContent className="p-6">
                    <EmptyState
                      title="Error loading notifications"
                      description={error}
                      icon="alert-triangle"
                    />
                  </CardContent>
                ) : filteredNotifications.length > 0 ? (
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
