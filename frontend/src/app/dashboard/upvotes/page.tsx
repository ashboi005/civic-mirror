"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filter, Loader2 } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { motion } from "framer-motion"
import { EmptyState } from "@/components/empty-state"
import { IssueCard } from "@/components/issue-card"
import { getAllReports, Report } from "@/lib/api"

export default function UpvotesPage() {
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "resolved">("all")
  const [upvotedReports, setUpvotedReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUpvotedReports = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch all reports and filter ones the user has upvoted
        const allReports = await getAllReports(0, 50)
        // Filter reports where the user has upvoted
        // This is a simplified approach - in a real app, you might want a dedicated API endpoint
        const upvoted = allReports.filter(report => 
          report.votes && report.votes.length > 0
        )
        setUpvotedReports(upvoted)
      } catch (err) {
        console.error("Failed to fetch upvoted reports:", err)
        setError("Failed to load your upvoted reports. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchUpvotedReports()
  }, [])

  // Handle voting to refresh reports
  const handleVote = async () => {
    try {
      const allReports = await getAllReports(0, 50)
      const upvoted = allReports.filter(report => 
        report.votes && report.votes.length > 0
      )
      setUpvotedReports(upvoted)
    } catch (err) {
      console.error("Failed to refresh reports after voting:", err)
    }
  }

  const filteredReports = upvotedReports.filter((report) => {
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
                <h2 className="text-2xl font-bold tracking-tight">My Upvotes</h2>
                <p className="text-muted-foreground">Issues you've supported in the community</p>
              </div>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Filter className="h-4 w-4" /> Filter
              </Button>
            </div>

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

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <Card className="border-gray-800 bg-black/40 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <EmptyState
                      title="Error loading upvoted reports"
                      description={error}
                      icon="alert-triangle"
                    />
                  </CardContent>
                </Card>
              ) : filteredReports.length > 0 ? (
                <motion.div className="grid gap-4 md:grid-cols-2" variants={container} initial="hidden" animate="show">
                  {filteredReports.map((report) => (
                    <motion.div key={report.id} variants={item}>
                      <IssueCard issue={report} onVote={handleVote} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <Card className="border-gray-800 bg-black/40 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <EmptyState
                      title="No upvoted issues"
                      description="You haven't upvoted any issues matching this filter yet."
                      icon="thumbs-up"
                    />
                  </CardContent>
                </Card>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
