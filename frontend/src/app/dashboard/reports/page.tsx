"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Filter } from "lucide-react"
import { IssueCard } from "@/components/issue-card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { motion } from "framer-motion"
import { EmptyState } from "@/components/empty-state"

// Mock data for issues
const myIssues = [
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
]

export default function ReportsPage() {
  const [filter, setFilter] = useState<"all" | "open" | "inProgress" | "resolved">("all")

  const filteredIssues = myIssues.filter((issue) => {
    if (filter === "all") return true
    if (filter === "open") return issue.status === "Open"
    if (filter === "inProgress") return issue.status === "In Progress"
    if (filter === "resolved") return issue.status === "Resolved"
    return true
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
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Filter className="h-4 w-4" /> Filter
              </Button>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-gray-800/50 mb-6">
                <TabsTrigger value="all" onClick={() => setFilter("all")}>
                  All
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

              <TabsContent value="all" className="mt-0">
                {filteredIssues.length > 0 ? (
                  <motion.div
                    className="grid gap-4 md:grid-cols-2"
                    variants={container}
                    initial="hidden"
                    animate="show"
                  >
                    {filteredIssues.map((issue) => (
                      <motion.div key={issue.id} variants={item}>
                        <IssueCard issue={issue} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <EmptyState
                    title="No reports found"
                    description="You haven't reported any issues matching this filter yet."
                    icon="file-text"
                  />
                )}
              </TabsContent>

              <TabsContent value="open" className="mt-0">
                {filteredIssues.length > 0 ? (
                  <motion.div
                    className="grid gap-4 md:grid-cols-2"
                    variants={container}
                    initial="hidden"
                    animate="show"
                  >
                    {filteredIssues.map((issue) => (
                      <motion.div key={issue.id} variants={item}>
                        <IssueCard issue={issue} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <EmptyState
                    title="No open reports"
                    description="You don't have any open reports at the moment."
                    icon="file-text"
                  />
                )}
              </TabsContent>

              <TabsContent value="inProgress" className="mt-0">
                {filteredIssues.length > 0 ? (
                  <motion.div
                    className="grid gap-4 md:grid-cols-2"
                    variants={container}
                    initial="hidden"
                    animate="show"
                  >
                    {filteredIssues.map((issue) => (
                      <motion.div key={issue.id} variants={item}>
                        <IssueCard issue={issue} />
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
                {filteredIssues.length > 0 ? (
                  <motion.div
                    className="grid gap-4 md:grid-cols-2"
                    variants={container}
                    initial="hidden"
                    animate="show"
                  >
                    {filteredIssues.map((issue) => (
                      <motion.div key={issue.id} variants={item}>
                        <IssueCard issue={issue} />
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
          </div>
        </div>
      </div>
    </div>
  )
}
