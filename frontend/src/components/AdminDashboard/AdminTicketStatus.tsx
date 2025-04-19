"use client"
import { Badge } from "@/components/ui/badge"
import { TicketStatusBadgeProps } from "@/types"  

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  switch (status) {
    case "pending":
      return <Badge variant="secondary">Pending</Badge>
    case "in-progress":
      return (
        <Badge variant="default" className="bg-blue-600">
          In Progress
        </Badge>
      )
    case "completed":
      return (
        <Badge variant="default" className="bg-green-600">
          Completed
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
