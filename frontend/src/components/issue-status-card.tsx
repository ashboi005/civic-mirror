"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowDown, ArrowUp } from "lucide-react"
import { motion } from "framer-motion"

interface IssueStatusCardProps {
  title: string
  value: number | string
  change: number
  timeRange: "week" | "month" | "year"
  icon: React.ReactNode
  changeDirection?: "up-good" | "down-good"
}

export function IssueStatusCard({
  title,
  value,
  change,
  timeRange,
  icon,
  changeDirection = "up-good",
}: IssueStatusCardProps) {
  const isPositiveChange = change > 0
  const isGood =
    (changeDirection === "up-good" && isPositiveChange) || (changeDirection === "down-good" && !isPositiveChange)

  const timeRangeText = timeRange === "week" ? "last 7 days" : timeRange === "month" ? "last 30 days" : "last 12 months"

  return (
    <Card className="border-gray-800 bg-black/40 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">{title}</p>
          <div className="rounded-full bg-gray-800 p-1.5">{icon}</div>
        </div>
        <div className="mt-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-2xl font-bold">{value}</p>
          </motion.div>
          <div className="flex items-center mt-1">
            <div className={`flex items-center text-xs ${isGood ? "text-green-500" : "text-red-500"}`}>
              {isPositiveChange ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
              <span>{Math.abs(change)}%</span>
            </div>
            <span className="text-xs text-gray-400 ml-2">vs {timeRangeText}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
