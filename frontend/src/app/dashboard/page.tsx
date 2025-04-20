"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MapPin, Filter, Plus, ArrowLeft, Loader2 } from "lucide-react"
import { IssueCard } from "@/components/issue-card"
import { ReportIssueForm } from "@/components/report-issue-form"

import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { motion } from "framer-motion"
import { getAllReports, getUserReports, Report } from "@/lib/api"
import { EmptyState } from "@/components/empty-state"
import ProtectedRoute from "@/components/protected-route"

function DashboardContent() {
  const [view, setView] = useState<"list" | "map">("list")
  const [showReportForm, setShowReportForm] = useState(false)
  const [filter, setFilter] = useState<"all" | "mine" | "nearby">("all")
  const [reports, setReports] = useState<Report[]>([])
  const [userReports, setUserReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAllReports = async () => {
      setLoading(true)
      setError(null)
      try {
        const allReportsData = await getAllReports(0, 20)
        setReports(allReportsData)

        // Also fetch user reports for the "mine" filter
        const userReportsData = await getUserReports(0, 20)
        setUserReports(userReportsData)
      } catch (err) {
        console.error("Failed to fetch reports:", err)
        setError("Failed to load reports. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchAllReports()
  }, [])

  // Handle voting to refresh reports
  const handleVote = async () => {
    try {
      const allReportsData = await getAllReports(0, 20)
      setReports(allReportsData)
      const userReportsData = await getUserReports(0, 20)
      setUserReports(userReportsData)
    } catch (err) {
      console.error("Failed to refresh reports after voting:", err)
    }
  }

  // Handle form submission to refresh reports
  const handleFormSubmit = async () => {
    setShowReportForm(false)
    // Refresh reports after submitting a new one
    try {
      const allReportsData = await getAllReports(0, 20)
      setReports(allReportsData)
      const userReportsData = await getUserReports(0, 20)
      setUserReports(userReportsData)
    } catch (err) {
      console.error("Failed to refresh reports after submission:", err)
    }
  }

  // Filter reports based on selected filter
  const getFilteredReports = () => {
    let result;
    if (filter === "mine") {
      result = userReports || [];
    } else if (filter === "nearby") {
      result = reports?.slice(0, 5) || [];
    } else {
      result = reports || [];
    }
    // Ensure we always return an array
    return Array.isArray(result) ? result : [];
  }

  const filteredReports = getFilteredReports();

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
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90 pb-16 md:pb-0">
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
                    <ReportIssueForm onSubmit={handleFormSubmit} />
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

                {loading ? (
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
                ) : view === "list" ? (
                  filteredReports.length > 0 ? (
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
                      description={filter === "mine" 
                        ? "You haven't reported any issues yet." 
                        : "No reports available at the moment."}
                      icon="file-text"
                    />
                  )
                ) : (
                  <Card className="border-gray-800 bg-black/40 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-0">
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

export default function Dashboard() {
  return (
    <ProtectedRoute fallbackPath="/login">
      <DashboardContent />
    </ProtectedRoute>
  )
}
