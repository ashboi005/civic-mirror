"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Layers, ZoomIn, ZoomOut, MapPin, Loader2, Navigation } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { motion } from "framer-motion"
import { FullMapView, MapReport } from "@/components/full-map-view"
import { IssueDetailPanel } from "@/components/issue-detail-panel"
import { Report } from "@/lib/api"

// Interface for the IssueDetailPanel component
interface Issue {
  id: number
  title: string
  description: string
  category: string
  status: string
  location: string
  date: string
  votes: number
  comments: number
  image: string
}

// Define Vote interface
interface Vote {
  report_id: number;
  id?: number;
  user_id?: number;
  created_at?: string;
}

// Define coordinates interface
interface Coordinates {
  lat: number;
  lng: number;
}

// Mock data for issues
const allIssues: MapReport[] = [
  {
    id: 1,
    title: "Pothole on Main Street",
    description: "Large pothole causing traffic issues",
    category: "Road",
    type: "infrastructure",
    status: "pending",
    location: "123 Main St",
    date: "2024-04-15",
    vote_count: 24,
    votes: [{ report_id: 1, id: 1, user_id: 1 }],
    comments: 5,
    image: "/placeholder.svg?height=200&width=300",
    coordinates: { lat: 40.7128, lng: -74.006 },
  },
  {
    id: 2,
    title: "Broken Street Light",
    description: "Street light not working for past week",
    category: "Lighting",
    type: "lighting",
    status: "in_progress",
    location: "456 Oak Ave",
    date: "2024-04-14",
    vote_count: 18,
    votes: [{ report_id: 2, id: 2, user_id: 1 }],
    comments: 3,
    image: "/placeholder.svg?height=200&width=300",
    coordinates: { lat: 40.7148, lng: -74.008 },
  },
  {
    id: 3,
    title: "Garbage Overflow",
    description: "Garbage bins overflowing in park",
    category: "Sanitation",
    type: "sanitation",
    status: "resolved",
    location: "Central Park",
    date: "2024-04-10",
    vote_count: 32,
    votes: [{ report_id: 3, id: 3, user_id: 1 }],
    comments: 7,
    image: "/placeholder.svg?height=200&width=300",
    coordinates: { lat: 40.7168, lng: -74.003 },
  },
  {
    id: 4,
    title: "Water Leakage",
    description: "Water pipe leaking on sidewalk",
    category: "Water",
    type: "water",
    status: "pending",
    location: "789 Pine St",
    date: "2024-04-13",
    vote_count: 15,
    votes: [{ report_id: 4, id: 4, user_id: 1 }],
    comments: 2,
    image: "/placeholder.svg?height=200&width=300",
    coordinates: { lat: 40.7138, lng: -74.002 },
  },
  {
    id: 5,
    title: "Fallen Tree",
    description: "Tree blocking sidewalk after storm",
    category: "Environment",
    type: "environment",
    status: "in_progress",
    location: "321 Elm St",
    date: "2024-04-12",
    vote_count: 27,
    votes: [{ report_id: 5, id: 5, user_id: 1 }],
    comments: 8,
    image: "/placeholder.svg?height=200&width=300",
    coordinates: { lat: 40.7158, lng: -74.005 },
  },
]

export default function MapPage() {
  const [filter, setFilter] = useState<"all" | "open" | "inProgress" | "resolved" | "nearby">("all")
  const [selectedIssue, setSelectedIssue] = useState<MapReport | null>(null)
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [isLocating, setIsLocating] = useState<boolean>(false)
  const [proximityRadius, setProximityRadius] = useState<number>(5) // in kilometers
  
  // Get user's current location on component mount
  useEffect(() => {
    const getUserLocation = () => {
      setIsLocating(true);
      
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by your browser");
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
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
        },
        { enableHighAccuracy: true }
      );
    };
    
    getUserLocation();
  }, []);
  
  // Calculate distance between two coordinates in kilometers (using Haversine formula)
  const calculateDistance = (coords1: Coordinates, coords2: Coordinates): number => {
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

  // Fix the onSelectIssue prop type issue by creating a wrapper function
  const handleSelectIssue = (issue: MapReport) => {
    setSelectedIssue(issue);
  };

  // Create a function to convert MapReport to Issue for IssueDetailPanel
  const mapReportToIssue = (report: MapReport): Issue => {
    return {
      id: report.id ?? 0, 
      title: report.title ?? "",
      description: report.description ?? "",
      category: report.category ?? "Other", // Add fallback
      status: report.status === "pending" ? "Open" : 
              report.status === "in_progress" ? "In Progress" : 
              report.status === "resolved" ? "Resolved" : 
              report.status ?? "Open",
      location: report.location ?? "",
      date: report.date ?? new Date().toISOString().split('T')[0], // Add fallback for date
      votes: report.vote_count ?? 0,
      comments: report.comments ?? 0, // Add fallback for comments
      image: report.image ?? "/placeholder.svg?height=200&width=300" // Add fallback for image
    };
  };

  // Filter issues based on selected filter and proximity
  const filteredIssues = allIssues.filter((issue) => {
    // First apply status filter
    if (filter === "all") return true;
    if (filter === "open") return issue.status === "pending";
    if (filter === "inProgress") return issue.status === "in_progress";
    if (filter === "resolved") return issue.status === "resolved";
    
    // If "nearby" filter is selected, only show issues near user location
    if (filter === "nearby") {
      if (!userLocation) return false;
      const distance = calculateDistance(userLocation, issue.coordinates);
      return distance <= proximityRadius; // Show issues within proximity radius
    }
    
    return true;
  });

  // Refresh user location
  const refreshLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLocating(false);
        // If nearby filter is active, automatically switch to it
        setFilter("nearby");
      },
      (error) => {
        console.error("Error refreshing location:", error);
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

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
              
              {/* Add location refresh button */}
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={refreshLocation}
                disabled={isLocating}
              >
                {isLocating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                {isLocating ? "Locating..." : "Find Nearby Issues"}
              </Button>
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
                  <TabsTrigger 
                    value="nearby" 
                    onClick={() => setFilter("nearby")}
                    disabled={!userLocation}
                    className={!userLocation ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    Nearby
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
                      onSelectIssue={handleSelectIssue}
                      selectedIssueId={selectedIssue?.id}
                      userLocation={userLocation}
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
                    {userLocation && (
                      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm p-2 rounded-md shadow-lg text-xs flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span>Your Location</span>
                        {filter === "nearby" && (
                          <span className="ml-1 text-gray-400">({proximityRadius}km radius)</span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {selectedIssue ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <IssueDetailPanel issue={mapReportToIssue(selectedIssue)} onClose={() => setSelectedIssue(null)} />
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
                  
                  {userLocation && filter === "nearby" && (
                    <Card className="border-gray-800 bg-black/40 backdrop-blur-sm">
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
                            Showing {filteredIssues.length} issues within {proximityRadius}km
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
