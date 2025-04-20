"use client"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ThumbsUp } from "lucide-react"
import { TicketStatusBadge } from "./AdminTicketStatus"
import { TicketDetailModalProps } from "@/types"  // Import the prop types
import { updateReportStatus, completeReport } from "@/lib/api"  // Import the updateReportStatus and completeReport API functions

export function TicketDetailModal({
  ticket,
  isOpen,
  onClose,
  onStatusUpdate,
}: TicketDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  // Function to update the status of the ticket (for "in-progress" or "pending" status)
  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true)

    try {
      // Update the status on the backend
      await updateReportStatus(ticket.id, newStatus)
      // Notify the parent component about the status change
      onStatusUpdate(ticket.id, newStatus)
    } catch (error) {
      console.error("Error updating report status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  // Function to complete the report (called when the status is "completed")
  const handleCompleteReport = async () => {
    setIsUpdating(true)

    try {
      // Complete the report on the backend
      await completeReport(ticket.id)
      // Notify the parent component to mark the report as completed
      onStatusUpdate(ticket.id, "completed")
    } catch (error) {
      console.error("Error completing report:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{ticket.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {ticket.id} • Reported on {new Date(ticket.created_at).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Category and Location Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{ticket.type}</Badge>
            <Badge variant="outline">{ticket.location}</Badge>
            <TicketStatusBadge status={ticket.status} />
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{ticket.description}</p>
          </div>

          {/* Reported By */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Reported By</h4>
              <div className="flex items-center gap-2">
                {/* User Avatar */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src={ticket.image_url || "/placeholder.svg"} />
                  <AvatarFallback>{ticket.user_id}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">User {ticket.user_id}</p>
                </div>
              </div>
            </div>

            {/* Upvotes */}
            <div>
              <h4 className="text-sm font-medium mb-2">Upvotes</h4>
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm">{ticket.vote_count}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status Update */}
          <div>
            <h4 className="text-sm font-medium mb-4">Update Status</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={ticket.status === "pending" ? "default" : "outline"}
                onClick={() => handleStatusUpdate("pending")}
                disabled={isUpdating || ticket.status === "pending"}
              >
                Pending
              </Button>
              <Button
                variant={ticket.status === "in-progress" ? "default" : "outline"}
                className={ticket.status === "in-progress" ? "bg-blue-600" : ""}
                onClick={() => handleStatusUpdate("in-progress")}
                disabled={isUpdating || ticket.status === "in-progress"}
              >
                In Progress
              </Button>
              <Button
                variant={ticket.status === "completed" ? "default" : "outline"}
                className={ticket.status === "completed" ? "bg-green-600" : ""}
                onClick={handleCompleteReport}  // Complete the report
                disabled={isUpdating || ticket.status === "completed"}
              >
                Complete
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
