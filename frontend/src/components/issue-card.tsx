"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MessageSquare, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { Report, voteForReport } from "@/lib/api"
import { useState } from "react"
import { ReportDetailDialog } from "@/components/report-detail-dialog"

interface IssueCardProps {
  issue: Report;
  onVote?: () => void;
}

export function IssueCard({ issue, onVote }: IssueCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [voteCount, setVoteCount] = useState(issue.vote_count || 0);
  const [showDetails, setShowDetails] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />
      case "in_progress":
        return <Clock className="h-3 w-3 text-blue-500" />
      case "resolved":
        return <CheckCircle className="h-3 w-3 text-green-500" />
      default:
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
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

  const handleVote = async () => {
    if (!issue.id || isVoting) return;
    
    setIsVoting(true);
    try {
      await voteForReport(issue.id);
      setVoteCount(prevCount => prevCount + 1);
      if (onVote) onVote();
    } catch (error) {
      console.error("Failed to vote for report:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleViewDetails = () => {
    if (issue.id) {
      setShowDetails(true);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-gray-800 bg-black/40 backdrop-blur-sm overflow-hidden h-full">
          <div className="relative h-40 overflow-hidden">
            <img
              src={issue.image_url || "/placeholder.svg"}
              alt={issue.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Badge variant="outline" className="bg-black/60 backdrop-blur-sm">
                {issue.type}
              </Badge>
              <Badge variant="outline" className={`${getStatusColor(issue.status || 'pending')} flex items-center gap-1`}>
                {getStatusIcon(issue.status || 'pending')} {issue.status || 'Pending'}
              </Badge>
            </div>
          </div>
          <CardHeader className="p-4 pb-0">
            <h3 className="text-lg font-semibold">{issue.title}</h3>
            <p className="text-xs text-gray-400">
              {issue.location || 'Unknown location'} • {issue.created_at ? new Date(issue.created_at).toLocaleDateString() : 'Unknown date'}
            </p>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-gray-300 line-clamp-2">{issue.description}</p>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2"
                onClick={handleVote}
                disabled={isVoting}
              >
                <ThumbsUp className="mr-1 h-4 w-4" /> {voteCount}
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <MessageSquare className="mr-1 h-4 w-4" /> {issue.comments || 0}
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={handleViewDetails}
            >
              View Details
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {showDetails && issue.id && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl">
            <ReportDetailDialog 
              reportId={issue.id} 
              onClose={() => setShowDetails(false)}
              onVote={onVote}
            />
          </div>
        </div>
      )}
    </>
  )
}
