"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Layers, ZoomIn, ZoomOut, MapPin } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { motion } from "framer-motion"
import { FullMapView } from "@/components/full-map-view"
import { IssueDetailPanel } from "@/components/issue-detail-panel"

// Mock data for issues
const allIssues = [
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
    coordinates: { lat: 40.7128, lng: -74.006 },
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
    coordinates: { lat: 40.7148, lng: -74.008 },
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
    coordinates: { lat: 40.7168, lng: -74.003 },
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
    coordinates: { lat: 40.7138, lng: -74.002 },
  },
  {
    id: 5,
    title: "Fallen Tree",
    description: "Tree blocking sidewalk after storm",
    category: "Environment",
    status: "In Progress",
    location: "321 Elm St",
    date: "2024-04-12",
    votes: 27,
    comments: 8,
    image: "/placeholder.svg?height=200&width=300",
    coordinates: { lat: 40.7158, lng: -74.005 },
  },
]

export default function MapPage() {
  const [filter, setFilter] = useState<"all" | "open" | "inProgress" | "resolved">("all")
  const [selectedIssue, setSelectedIssue] = useState<(typeof allIssues)[0] | null>(null)

  const filteredIssues = allIssues.filter((issue) => {
    if (filter === "all") return true
    if (filter === "open") return issue.status === "Open"
    if (filter === "inProgress") return issue.status === "In Progress"
    if (filter === "resolved") return issue.status === "Resolved"
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <DashboardHeader />

      <div className="container px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-6 md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr]">
          <DashboardNav />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Explore Map</h2>
                <p className="text-muted-foreground">View all reported issues on an interactive map</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="bg-gray-800/50">
                  <TabsTrigger value="all" onClick={() => setFilter("all")}>
                    All Issues
                  </TabsTrigger>
                  <TabsTrigger value="open" onClick={() => setFilter("open")}>
                    Open
                  </TabsTrigger>
                  <TabsTrigger value="inProgress" onClick={() => setFilter("inProgress")}>
                    In Progress
                  </TabsTrigger>
                  <TabsTrigger value="resolved" onClick={() => setFilter("resolved")}>
                    Resolved
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_300px]">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="border-gray-800 bg-black/40 backdrop-blur-sm overflow-hidden h-[calc(100vh-240px)]">
                  <CardContent className="p-0 relative">
                    <FullMapView
                      issues={filteredIssues}
                      onSelectIssue={setSelectedIssue}
                      selectedIssueId={selectedIssue?.id}
                    />
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-gray-800/80 backdrop-blur-sm"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-gray-800/80 backdrop-blur-sm"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-gray-800/80 backdrop-blur-sm"
                      >
                        <Layers className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm p-2 rounded-md shadow-lg text-xs flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span>Your Location</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {selectedIssue ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <IssueDetailPanel issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-4"
                >
                  <Card className="border-gray-800 bg-black/40 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="text-center py-8">
                        <MapPin className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium">Select an Issue</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Click on any marker on the map to view issue details
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-800 bg-black/40 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-medium mb-2">Map Legend</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20">
                            <MapPin className="h-3 w-3 mr-1" /> Open
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/20">
                            <MapPin className="h-3 w-3 mr-1" /> In Progress
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500/20 text-green-500 border-green-500/20">
                            <MapPin className="h-3 w-3 mr-1" /> Resolved
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
