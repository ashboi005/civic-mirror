"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, LineChart, PieChart, Calendar, Download } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { motion } from "framer-motion"
import { StatisticsChart } from "@/components/statistics-chart"
import { CategoryDistribution } from "@/components/category-distribution"
import { ResolutionTimeChart } from "@/components/resolution-time-chart"
import { IssueStatusCard } from "@/components/issue-status-card"

export default function StatisticsPage() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <DashboardHeader />

      <div className="container px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-6 md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr]">
          <DashboardNav />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Statistics</h2>
                <p className="text-muted-foreground">Analyze civic issue data and trends</p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={timeRange} onValueChange={(value: "week" | "month" | "year") => setTimeRange(value)}>
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="year">Last 12 Months</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Download className="h-4 w-4" /> Export
                </Button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <IssueStatusCard
                  title="Total Issues"
                  value={1248}
                  change={+12.5}
                  timeRange={timeRange}
                  icon={<BarChart className="h-4 w-4" />}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <IssueStatusCard
                  title="Resolved Issues"
                  value={876}
                  change={+18.2}
                  timeRange={timeRange}
                  icon={<LineChart className="h-4 w-4" />}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <IssueStatusCard
                  title="Avg. Resolution Time"
                  value="3.2 days"
                  change={-8.4}
                  timeRange={timeRange}
                  icon={<Calendar className="h-4 w-4" />}
                  changeDirection="down-good"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <IssueStatusCard
                  title="Citizen Participation"
                  value={432}
                  change={+24.6}
                  timeRange={timeRange}
                  icon={<PieChart className="h-4 w-4" />}
                />
              </motion.div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <Card className="border-gray-800 bg-black/40 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Issues Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StatisticsChart timeRange={timeRange} />
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <Card className="border-gray-800 bg-black/40 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Category Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoryDistribution />
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <Card className="border-gray-800 bg-black/40 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Resolution Time by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResolutionTimeChart />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
