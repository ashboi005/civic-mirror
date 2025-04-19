"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MapPin, Filter, Plus, ArrowLeft } from "lucide-react"
import { IssueCard } from "@/components/issue-card"
import { ReportIssueForm } from "@/components/report-issue-form"
import { MapView } from "@/components/map-view"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { motion } from "framer-motion"

// Mock data for issues
const mockIssues = [
  {
    id: 1,
    title: "Pothole on Main Street",
    description: "Large pothole causing traffic issues",
    category: "Road",
    status: "Open",
    location: "123 Main St",
    date: "2024-04-15",
    votes: 24,
    comments: 5,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    title: "Broken Street Light",
    description: "Street light not working for past week",
    category: "Lighting",
    status: "In Progress",
    location: "456 Oak Ave",
    date: "2024-04-14",
    votes: 18,
    comments: 3,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    title: "Garbage Overflow",
    description: "Garbage bins overflowing in park",
    category: "Sanitation",
    status: "Resolved",
    location: "Central Park",
    date: "2024-04-10",
    votes: 32,
    comments: 7,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    title: "Water Leakage",
    description: "Water pipe leaking on sidewalk",
    category: "Water",
    status: "Open",
    location: "789 Pine St",
    date: "2024-04-13",
    votes: 15,
    comments: 2,
    image: "/placeholder.svg?height=200&width=300",
  },
]

export default function Dashboard() {
  const [view, setView] = useState<"list" | "map">("list")
  const [showReportForm, setShowReportForm] = useState(false)
  const [filter, setFilter] = useState<"all" | "mine" | "nearby">("all")

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <DashboardHeader />

      <div className="container px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-6 md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr]">
          <DashboardNav />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Citizen Dashboard</h2>
                <p className="text-muted-foreground">Report and track civic issues in your community</p>
              </div>
              <Button
                onClick={() => setShowReportForm(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <Plus className="mr-2 h-4 w-4" /> Report Issue
              </Button>
            </div>

            {showReportForm ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="border-gray-800 bg-black/40 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Report a New Issue</CardTitle>
                      <CardDescription>Fill out the form below to report a civic issue</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setShowReportForm(false)}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ReportIssueForm onSubmit={() => setShowReportForm(false)} />
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="bg-gray-800/50">
                      <TabsTrigger value="all" onClick={() => setFilter("all")}>
                        All Issues
                      </TabsTrigger>
                      <TabsTrigger value="mine" onClick={() => setFilter("mine")}>
                        My Reports
                      </TabsTrigger>
                      <TabsTrigger value="nearby" onClick={() => setFilter("nearby")}>
                        Nearby
                      </TabsTrigger>
                    </TabsList>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                          <MapPin className="h-3 w-3" /> Current Location
                        </Badge>
                        <Button variant="outline" size="sm" className="h-8">
                          <Filter className="mr-2 h-3 w-3" /> Filter
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={view === "list" ? "secondary" : "outline"}
                          size="sm"
                          className="h-8"
                          onClick={() => setView("list")}
                        >
                          List
                        </Button>
                        <Button
                          variant={view === "map" ? "secondary" : "outline"}
                          size="sm"
                          className="h-8"
                          onClick={() => setView("map")}
                        >
                          Map
                        </Button>
                      </div>
                    </div>
                  </Tabs>
                </div>

                {view === "list" ? (
                  <motion.div
                    className="grid gap-4 md:grid-cols-2"
                    variants={container}
                    initial="hidden"
                    animate="show"
                  >
                    {mockIssues.map((issue) => (
                      <motion.div key={issue.id} variants={item}>
                        <IssueCard issue={issue} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <Card className="border-gray-800 bg-black/40 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-0">
                      <MapView issues={mockIssues} />
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
