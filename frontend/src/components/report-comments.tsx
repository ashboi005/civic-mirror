"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Trash2, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Comment, createComment, getCommentsByReport, deleteComment } from "@/lib/api"

interface ReportCommentsProps {
  reportId: number;
  onCommentChange?: () => void;
}

export function ReportComments({ reportId, onCommentChange }: ReportCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchComments();
  }, [reportId]);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCommentsByReport(reportId);
      setComments(data);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      setError("Failed to load comments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    try {
      await createComment(newComment, reportId);
      setNewComment("");
      fetchComments();
      if (onCommentChange) {
        onCommentChange();
      }
    } catch (err) {
      console.error("Failed to submit comment:", err);
      setError("Failed to submit your comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    setDeleting(commentId);
    try {
      await deleteComment(commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
      if (onCommentChange) {
        onCommentChange();
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
      setError("Failed to delete your comment. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-gray-800 bg-black/40 backdrop-blur-sm my-4">
        <CardContent className="p-4 flex items-center gap-2 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Comments ({comments.length})</h4>
      
      {comments.length === 0 ? (
        <p className="text-sm text-gray-400">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt={comment.username || "User"} />
                <AvatarFallback>{comment.username?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-gray-900/50 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium">{comment.username || "Anonymous"}</h5>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                    {deleting === comment.id ? (
                      <Loader2 className="h-3 w-3 animate-spin text-red-400" />
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 text-gray-500 hover:text-red-400"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-300 mt-1">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex gap-2 mt-4">
        <Textarea
          placeholder="Add your comment..."
          className="min-h-[60px] bg-gray-900/50 border-gray-800"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={submitting}
        />
        <Button 
          size="icon" 
          className="h-[60px]" 
          onClick={handleSubmitComment}
          disabled={submitting || !newComment.trim()}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}