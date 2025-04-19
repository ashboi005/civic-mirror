"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filter } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { motion } from "framer-motion"
import { EmptyState } from "@/components/empty-state"
import { IssueCard } from "@/components/issue-card"

// Mock data for upvoted issues
const upvotedIssues = [
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
  },
  {
    id: 6,
    title: "Graffiti on Public Building",
    description: "Vandalism on community center wall",
    category: "Vandalism",
    status: "Open",
    location: "555 Community Ave",
    date: "2024-04-11",
    votes: 12,
    comments: 4,
    image: "/placeholder.svg?height=200&width=300",
  },
]

export default function UpvotesPage() {
  const [filter, setFilter] = useState<"all" | "open" | "inProgress" | "resolved">("all")

  const filteredIssues = upvotedIssues.filter((issue) => {
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

              {filteredIssues.length > 0 ? (
                <motion.div className="grid gap-4 md:grid-cols-2" variants={container} initial="hidden" animate="show">
                  {filteredIssues.map((issue) => (
                    <motion.div key={issue.id} variants={item}>
                      <IssueCard issue={issue} />
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
