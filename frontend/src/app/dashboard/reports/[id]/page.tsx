"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { formatDistanceToNow } from "date-fns"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { ThumbsUp, MessageSquare, Share, ArrowLeft, CheckCircle, AlertTriangle, Clock, Send, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { getReportById, Report, voteForReport } from "@/lib/api"

export default function ReportDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [comment, setComment] = useState("")
  const [isUpvoted, setIsUpvoted] = useState(false)
  const [voteCount, setVoteCount] = useState(0)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [isVoting, setIsVoting] = useState(false)

  useEffect(() => {
    const fetchReportDetails = async () => {
      setLoading(true)
      try {
        const reportId = parseInt(params.id)
        if (isNaN(reportId)) {
          setError("Invalid report ID")
          return
        }
        
        const data = await getReportById(reportId)
        setReport(data)
        setVoteCount(data.vote_count || 0)
      } catch (err) {
        console.error("Failed to fetch report details:", err)
        setError("Failed to load report details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchReportDetails()
  }, [params.id])

  const handleVote = async () => {
    if (!report?.id || isVoting) return
    
    setIsVoting(true)
    try {
      await voteForReport(report.id)
      setVoteCount(prevCount => prevCount + 1)
      setIsUpvoted(true)
    } catch (error) {
      console.error("Failed to vote for report:", error)
    } finally {
      setIsVoting(false)
    }
  }

  const handleCommentSubmit = async () => {
    if (!comment.trim() || submittingComment) return
    
    setSubmittingComment(true)
    try {
      // This would call an API endpoint to submit a comment in a real app
      // For now we'll just simulate submission
      console.log("Submitting comment:", comment)
      
      // Reset comment field
      setComment("")
      // In a real app, you would refresh comments or add the new one to the list
    } catch (error) {
      console.error("Failed to submit comment:", error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "pending":
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-500"
      case "in_progress":
        return "border-blue-500/20 bg-blue-500/10 text-blue-500"
      case "resolved":
        return "border-green-500/20 bg-green-500/10 text-green-500"
      default:
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <DashboardHeader />

      <div className="container px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-6 md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr]">
          <DashboardNav />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => router.back()}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <h2 className="text-2xl font-bold tracking-tight">Report Details</h2>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <Card className="border-gray-800 bg-black/40 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">{error}</h3>
                  <p className="text-gray-400 mt-2">Please try again or go back to see all reports.</p>
                  <Button 
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.push('/dashboard/reports')}
                  >
                    View All Reports
                  </Button>
                </CardContent>
              </Card>
            ) : report ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-gray-800 bg-black/40 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">{report.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{report.type}</Badge>
                          <Badge 
                            variant="outline" 
                            className={`flex items-center gap-1 ${getStatusColor(report.status)}`}
                          >
                            {getStatusIcon(report.status)} {report.status || 'Pending'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:items-end">
                        <p className="text-sm text-gray-400">
                          {report.location || 'Unknown location'}
                        </p>
                        <p className="text-sm text-gray-400">
                          Reported {report.created_at ? formatDistanceToNow(new Date(report.created_at), { addSuffix: true }) : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {report.image_url && (
                      <div className="relative h-60 sm:h-80 overflow-hidden rounded-md">
                        <img 
                          src={report.image_url} 
                          alt={report.title} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium mb-2">Description</h4>
                      <p className="text-gray-300">{report.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-gray-800">
                      <div>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" /> {voteCount} upvotes
                        </span>
                      </div>
                      {report.updated_at && report.updated_at !== report.created_at && (
                        <div>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" /> Last updated {formatDistanceToNow(new Date(report.updated_at), { addSuffix: true })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-800">
                      <h4 className="text-sm font-medium mb-3">Comments</h4>
                      <div className="space-y-4">
                        <div className="text-center text-sm text-gray-400 py-4">
                          No comments yet. Be the first to comment!
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4 pt-4 border-t border-gray-800">
                    <div className="flex items-center justify-between w-full">
                      <Button 
                        variant={isUpvoted ? "secondary" : "outline"} 
                        size="sm" 
                        className="gap-1" 
                        onClick={handleVote}
                        disabled={isVoting}
                      >
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
                      <Button 
                        size="icon" 
                        className="h-[60px]"
                        onClick={handleCommentSubmit}
                        disabled={!comment.trim() || submittingComment}
                      >
                        {submittingComment ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}