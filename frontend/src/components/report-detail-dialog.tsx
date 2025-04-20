"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThumbsUp, MessageSquare, Share, X, CheckCircle, AlertTriangle, Clock } from "lucide-react"
import { ReportComments } from "@/components/report-comments"
import { Report, getReportById, voteForReport } from "@/lib/api"

interface ReportDetailDialogProps {
  reportId: number;
  onClose: () => void;
  onVote?: () => void;
}

export function ReportDetailDialog({ reportId, onClose, onVote }: ReportDetailDialogProps) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);

  useEffect(() => {
    fetchReportDetails();
  }, [reportId]);

  const fetchReportDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReportById(reportId);
      setReport(data);
      setUpvoteCount(data.vote_count || 0);
      // Fix the type error by ensuring we always set a boolean value
      setIsUpvoted(Boolean(data.votes && data.votes.length > 0));
    } catch (err) {
      console.error("Failed to fetch report details:", err);
      setError("Failed to load report details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    try {
      await voteForReport(reportId);
      if (isUpvoted) {
        setUpvoteCount(upvoteCount - 1);
      } else {
        setUpvoteCount(upvoteCount + 1);
      }
      setIsUpvoted(!isUpvoted);
      
      if (onVote) {
        onVote();
      }
    } catch (err) {
      console.error("Failed to upvote report:", err);
    }
  };

  const handleCommentChange = () => {
    fetchReportDetails();
    if (onVote) {
      onVote(); // Update parent component after comment changes
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-500";
      case "in_progress":
        return "border-blue-500/20 bg-blue-500/10 text-blue-500";
      case "resolved":
        return "border-green-500/20 bg-green-500/10 text-green-500";
      default:
        return "";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in_progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      default:
        return status;
    }
  };

  if (loading || !report) {
    return (
      <Card className="border-gray-800 bg-black/40 backdrop-blur-sm h-[calc(100vh-240px)] flex flex-col">
        <CardHeader className="pb-2 flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-lg">Loading report details...</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full">
            <div className="h-40 bg-gray-800/50 rounded-md w-full"></div>
            <div className="h-4 bg-gray-800/50 rounded w-3/4"></div>
            <div className="h-4 bg-gray-800/50 rounded w-1/2"></div>
            <div className="h-4 bg-gray-800/50 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-gray-800 bg-black/40 backdrop-blur-sm h-[calc(100vh-240px)] flex flex-col">
        <CardHeader className="pb-2 flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-lg">Error Loading Report</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-800 bg-black/40 backdrop-blur-sm h-[calc(100vh-240px)] flex flex-col">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg">{report.title}</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{report.type}</Badge>
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 ${getStatusColor(report.status || 'pending')}`}
            >
              {getStatusIcon(report.status || 'pending')} {getStatusLabel(report.status || 'pending')}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-4">
          {report.image_url && (
            <div className="relative h-40 overflow-hidden rounded-md">
              <img 
                src={report.image_url || "/placeholder.svg"} 
                alt={report.title} 
                className="w-full h-full object-cover" 
              />
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium mb-1">Description</h4>
            <p className="text-sm text-gray-300">{report.description}</p>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-400">
            <div>
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3 w-3" /> {upvoteCount} upvotes
              </span>
            </div>
            <div>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> {report.comments} comments
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Location</h4>
            <p className="text-sm text-gray-300">{report.location}</p>
          </div>

          {report.created_at && (
            <div>
              <h4 className="text-sm font-medium mb-1">Reported</h4>
              <p className="text-sm text-gray-300">
                {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
              </p>
            </div>
          )}

          <div className="border-t border-gray-800 pt-4">
            {report.id && <ReportComments reportId={report.id} onCommentChange={handleCommentChange} />}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between w-full">
          <Button 
            variant={isUpvoted ? "secondary" : "outline"} 
            size="sm" 
            className="gap-1" 
            onClick={handleUpvote}
          >
            <ThumbsUp className="h-4 w-4" /> {isUpvoted ? "Upvoted" : "Upvote"}
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Share className="h-4 w-4" /> Share
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}