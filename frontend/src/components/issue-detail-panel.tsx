"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, MessageSquare, Share, X, CheckCircle, AlertTriangle, Clock, Send } from "lucide-react"

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

interface IssueDetailPanelProps {
  issue: Issue
  onClose: () => void
}

export function IssueDetailPanel({ issue, onClose }: IssueDetailPanelProps) {
  const [comment, setComment] = useState("")
  const [isUpvoted, setIsUpvoted] = useState(false)
  const [upvoteCount, setUpvoteCount] = useState(issue.votes)

  const handleUpvote = () => {
    if (isUpvoted) {
      setUpvoteCount(upvoteCount - 1)
    } else {
      setUpvoteCount(upvoteCount + 1)
    }
    setIsUpvoted(!isUpvoted)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "In Progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "Resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
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
    <Card className="border-gray-800 bg-black/40 backdrop-blur-sm h-[calc(100vh-240px)] flex flex-col">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg">{issue.title}</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{issue.category}</Badge>
            <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor(issue.status)}`}>
              {getStatusIcon(issue.status)} {issue.status}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-4">
          <div className="relative h-40 overflow-hidden rounded-md">
            <img src={issue.image || "/placeholder.svg"} alt={issue.title} className="w-full h-full object-cover" />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Description</h4>
            <p className="text-sm text-gray-300">{issue.description}</p>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-400">
            <div>
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3 w-3" /> {upvoteCount} upvotes
              </span>
            </div>
            <div>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> {issue.comments} comments
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Location</h4>
            <p className="text-sm text-gray-300">{issue.location}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Reported</h4>
            <p className="text-sm text-gray-300">{formatDistanceToNow(new Date(issue.date), { addSuffix: true })}</p>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <h4 className="text-sm font-medium mb-3">Comments</h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-gray-900/50 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">Jane Smith</h5>
                    <span className="text-xs text-gray-500">2 days ago</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">
                    I've noticed this issue too. It's been causing problems for pedestrians.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback>RJ</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-gray-900/50 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">Robert Johnson</h5>
                    <span className="text-xs text-gray-500">1 day ago</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">
                    I spoke with a municipal worker yesterday and they said they're aware of this issue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between w-full">
          <Button variant={isUpvoted ? "secondary" : "outline"} size="sm" className="gap-1" onClick={handleUpvote}>
            <ThumbsUp className="h-4 w-4" /> {isUpvoted ? "Upvoted" : "Upvote"}
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Share className="h-4 w-4" /> Share
          </Button>
        </div>
        <div className="flex w-full gap-2">
          <Textarea
            placeholder="Add a comment..."
            className="min-h-[60px] bg-gray-900/50 border-gray-800"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button size="icon" className="h-[60px]">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
