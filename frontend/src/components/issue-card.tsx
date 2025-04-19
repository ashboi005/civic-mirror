"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MessageSquare, Clock, CheckCircle, AlertTriangle } from "lucide-react"

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

interface IssueCardProps {
  issue: Issue
}

export function IssueCard({ issue }: IssueCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open":
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />
      case "In Progress":
        return <Clock className="h-3 w-3 text-blue-500" />
      case "Resolved":
        return <CheckCircle className="h-3 w-3 text-green-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-500"
      case "In Progress":
        return "border-blue-500/20 bg-blue-500/10 text-blue-500"
      case "Resolved":
        return "border-green-500/20 bg-green-500/10 text-green-500"
      default:
        return ""
    }
  }

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-gray-800 bg-black/40 backdrop-blur-sm overflow-hidden h-full">
        <div className="relative h-40 overflow-hidden">
          <img
            src={issue.image || "/placeholder.svg"}
            alt={issue.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Badge variant="outline" className="bg-black/60 backdrop-blur-sm">
              {issue.category}
            </Badge>
            <Badge variant="outline" className={`${getStatusColor(issue.status)} flex items-center gap-1`}>
              {getStatusIcon(issue.status)} {issue.status}
            </Badge>
          </div>
        </div>
        <CardHeader className="p-4 pb-0">
          <h3 className="text-lg font-semibold">{issue.title}</h3>
          <p className="text-xs text-gray-400">
            {issue.location} • {new Date(issue.date).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-sm text-gray-300 line-clamp-2">{issue.description}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <ThumbsUp className="mr-1 h-4 w-4" /> {issue.votes}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <MessageSquare className="mr-1 h-4 w-4" /> {issue.comments}
            </Button>
          </div>
          <Button variant="outline" size="sm" className="h-8">
            View Details
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
