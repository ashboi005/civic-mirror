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
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "resolved">("all")
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReportForm, setShowReportForm] = useState(false)

  // Fetch user reports on component mount
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getUserReports(0, 50)
        setReports(data)
      } catch (err) {
        console.error("Failed to fetch user reports:", err)
        setError("Failed to load your reports. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
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
                </TabsList>

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
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
