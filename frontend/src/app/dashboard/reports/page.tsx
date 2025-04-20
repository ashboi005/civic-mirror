"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Filter, Loader2, Plus } from "lucide-react"
import { IssueCard } from "@/components/issue-card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { motion } from "framer-motion"
import { EmptyState } from "@/components/empty-state"
import { getUserReports, Report } from "@/lib/api"
import { ReportIssueForm } from "@/components/report-issue-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function ReportsPage() {
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "resolved" | "nearby">("all")
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReportForm, setShowReportForm] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [proximityRadius, setProximityRadius] = useState(5) // 5 km default radius
  const [showProximitySettings, setShowProximitySettings] = useState(false)

  // Calculate distance between two coordinates in kilometers (using Haversine formula)
  const calculateDistance = (
    coords1: {lat: number, lng: number}, 
    coords2: {lat: number, lng: number}
  ): number => {
    if (!coords1 || !coords2) return Infinity;
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
    const dLon = (coords2.lng - coords1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coords1.lat * Math.PI / 180) * Math.cos(coords2.lat * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get user's location
  const getUserLocation = () => {
    setIsLocating(true);
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(userCoords);
        setIsLocating(false);
        
        // If user clicks the location button, automatically switch to nearby filter
        if (filter !== "nearby") {
          setFilter("nearby");
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLocating(false);
        setError("Could not get your location. Please allow location access and try again.");
      },
      { enableHighAccuracy: true }
    );
  };

  // Process reports to add coordinates from location strings if not already present
  const processReportsWithCoordinates = (reports: any): Report[] => {
    // Make sure reports is an array, if not return an empty array
    if (!Array.isArray(reports)) {
      console.warn('Expected reports to be an array but got:', typeof reports);
      return [];
    }
    
    return reports.map(report => {
      // If report already has coordinates, return as is
      if (report.coordinates) return report;
      
      // Simple pattern matching for coordinates in the location string
      // Format: "latitude, longitude" or contains coordinates
      const coordsMatch = report.location?.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
      
      if (coordsMatch) {
        const lat = parseFloat(coordsMatch[1]);
        const lng = parseFloat(coordsMatch[2]);
        // Only use if valid coordinates
        if (!isNaN(lat) && !isNaN(lng)) {
          return {
            ...report,
            coordinates: { lat, lng }
          };
        }
      }
      
      // If no valid coordinates, add mock ones for demo purposes
      // In a real app, you would geocode the address or skip non-geocoded reports
      return {
        ...report,
        coordinates: {
          lat: 40.7128 + (Math.random() - 0.5) * 0.02, // Random coords around NYC for demo
          lng: -74.006 + (Math.random() - 0.5) * 0.02
        }
      };
    });
  };

  // Fetch user reports on component mount
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getUserReports(0, 50)
        // Process reports to ensure they have coordinates
        const processedReports = processReportsWithCoordinates(data);
        setReports(processedReports)
      } catch (err) {
        console.error("Failed to fetch user reports:", err)
        setError("Failed to load your reports. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
    
    // Try to get user location on initial load
    getUserLocation()
  }, [])

  // Handle voting to refresh reports
  const handleVote = async () => {
    try {
      const data = await getUserReports(0, 50)
      setReports(data)
    } catch (err) {
      console.error("Failed to refresh reports after voting:", err)
    }
  }

  // Handle form submission to refresh reports
  const handleFormSubmit = async () => {
    setShowReportForm(false)
    // Refresh reports after submitting a new one
    try {
      const data = await getUserReports(0, 50)
      setReports(data)
    } catch (err) {
      console.error("Failed to refresh reports after submission:", err)
    }
  }

  const filteredReports = reports.filter((report) => {
    if (filter === "all") return true
    if (filter === "nearby" && userLocation && report.coordinates) {
      return calculateDistance(userLocation, report.coordinates) <= proximityRadius;
    }
    return report.status === filter
  })

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
                <h2 className="text-2xl font-bold tracking-tight">My Reports</h2>
                <p className="text-muted-foreground">View and manage all your reported issues</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Filter className="h-4 w-4" /> Filter
                </Button>
                <Button
                  onClick={() => setShowReportForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-8 gap-1"
                  size="sm"
                >
                  <Plus className="h-4 w-4" /> Report Issue
                </Button>
              </div>
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
                      <Loader2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ReportIssueForm onSubmit={handleFormSubmit} />
                  </CardContent>
                </Card>
              </motion.div>
            ) : loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="py-8">
                <EmptyState
                  title="Error loading reports"
                  description={error}
                  icon="alert-triangle"
                />
              </div>
            ) : (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="bg-gray-800/50 mb-6">
                  <TabsTrigger value="all" onClick={() => setFilter("all")}>
                    All
                  </TabsTrigger>
                  <TabsTrigger value="pending" onClick={() => setFilter("pending")}>
                    Pending
                  </TabsTrigger>
                  <TabsTrigger value="in_progress" onClick={() => setFilter("in_progress")}>
                    In Progress
                  </TabsTrigger>
                  <TabsTrigger value="resolved" onClick={() => setFilter("resolved")}>
                    Resolved
                  </TabsTrigger>
                  <TabsTrigger 
                    value="nearby" 
                    onClick={() => {
                      setFilter("nearby")
                      // If we don't have user location yet, try to get it
                      if (!userLocation) {
                        getUserLocation()
                      }
                      // Show proximity settings when this tab is selected
                      setShowProximitySettings(true)
                    }}
                  >
                    Nearby
                  </TabsTrigger>
                </TabsList>
                
                {/* Location refresh button */}
                {filter === "nearby" && (
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-muted-foreground">
                      {userLocation 
                        ? `Showing reports within ${proximityRadius}km of your location`
                        : "Please enable location to see nearby reports"}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={getUserLocation}
                      disabled={isLocating}
                    >
                      {isLocating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-navigation">
                          <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                        </svg>
                      )}
                      {isLocating ? "Locating..." : "Refresh Location"}
                    </Button>
                  </div>
                )}
                
                {/* Proximity radius settings */}
                {filter === "nearby" && showProximitySettings && userLocation && (
                  <Card className="mb-6 border-gray-800 bg-black/40 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-medium mb-2">Proximity Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-gray-400">Search Radius: {proximityRadius}km</label>
                          <input 
                            type="range" 
                            min="1" 
                            max="20" 
                            value={proximityRadius}
                            onChange={(e) => setProximityRadius(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div className="text-xs text-gray-400">
                          Showing {filteredReports.length} reports within {proximityRadius}km
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <TabsContent value="all" className="mt-0">
                  {filteredReports.length > 0 ? (
                    <motion.div
                      className="grid gap-4 md:grid-cols-2"
                      variants={container}
                      initial="hidden"
                      animate="show"
                    >
                      {filteredReports.map((report) => (
                        <motion.div key={report.id} variants={item}>
                          <IssueCard issue={report} onVote={handleVote} />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <EmptyState
                      title="No reports found"
                      description="You haven't reported any issues yet."
                      icon="file-text"
                    />
                  )}
                </TabsContent>

                <TabsContent value="pending" className="mt-0">
                  {filteredReports.length > 0 ? (
                    <motion.div
                      className="grid gap-4 md:grid-cols-2"
                      variants={container}
                      initial="hidden"
                      animate="show"
                    >
                      {filteredReports.map((report) => (
                        <motion.div key={report.id} variants={item}>
                          <IssueCard issue={report} onVote={handleVote} />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <EmptyState
                      title="No pending reports"
                      description="You don't have any pending reports at the moment."
                      icon="file-text"
                    />
                  )}
                </TabsContent>

                <TabsContent value="in_progress" className="mt-0">
                  {filteredReports.length > 0 ? (
                    <motion.div
                      className="grid gap-4 md:grid-cols-2"
                      variants={container}
                      initial="hidden"
                      animate="show"
                    >
                      {filteredReports.map((report) => (
                        <motion.div key={report.id} variants={item}>
                          <IssueCard issue={report} onVote={handleVote} />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <EmptyState
                      title="No in-progress reports"
                      description="You don't have any reports in progress at the moment."
                      icon="file-text"
                    />
                  )}
                </TabsContent>

                <TabsContent value="resolved" className="mt-0">
                  {filteredReports.length > 0 ? (
                    <motion.div
                      className="grid gap-4 md:grid-cols-2"
                      variants={container}
                      initial="hidden"
                      animate="show"
                    >
                      {filteredReports.map((report) => (
                        <motion.div key={report.id} variants={item}>
                          <IssueCard issue={report} onVote={handleVote} />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <EmptyState
                      title="No resolved reports"
                      description="You don't have any resolved reports yet."
                      icon="file-text"
                    />
                  )}
                </TabsContent>

                <TabsContent value="nearby" className="mt-0">
                  {filteredReports.length > 0 ? (
                    <motion.div
                      className="grid gap-4 md:grid-cols-2"
                      variants={container}
                      initial="hidden"
                      animate="show"
                    >
                      {filteredReports.map((report) => (
                        <motion.div key={report.id} variants={item}>
                          <IssueCard issue={report} onVote={handleVote} />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <EmptyState
                      title="No nearby reports"
                      description="No reports found within your proximity radius."
                      icon="file-text"
                    />
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
