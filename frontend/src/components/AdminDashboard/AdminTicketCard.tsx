"use client"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu"
import { Progress } from "@radix-ui/react-progress"
import { Badge } from "../ui/badge"
import { MoreHorizontal,  ThumbsUp } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card"
import { TicketStatusBadge } from "./AdminTicketStatus"
import { TicketCardProps } from "@/types"  // Import the type for props

export function TicketCard({ ticket, onUpvote, onViewDetails }: TicketCardProps) {
  // Function to check if a user has already voted
  const hasVoted = (userId: number) => ticket.votes.includes(userId.toString())

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{ticket.title}</CardTitle>
            <CardDescription className="mt-1">
              {ticket.id} • {new Date(ticket.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onViewDetails}>View Details</DropdownMenuItem>
              <DropdownMenuItem>Assign Ticket</DropdownMenuItem>
              <DropdownMenuItem>Mark as Priority</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        {/* Image */}
        {ticket.image_url && (
          <img
            src={ticket.image_url}
            alt="Ticket image"
            className="w-full h-40 object-cover rounded-md mb-4"
          />
        )}

        {/* Description */}
        {ticket.description && (
          <p className="text-sm line-clamp-2 text-muted-foreground mb-3">{ticket.description}</p>
        )}

        {/* Type and Location Badges */}
        {(ticket.type || ticket.location || ticket.status) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {ticket.type && <Badge variant="outline">{ticket.type}</Badge>}
            {ticket.location && <Badge variant="outline">{ticket.location}</Badge>}
            <TicketStatusBadge status={ticket.status} />
          </div>
        )}

        {/* Vote Count */}
        <div className="flex items-center gap-2 mt-4">
          <div className="text-sm font-medium">Vote Count:</div>
          <Progress value={ticket.vote_count} max={100} className="h-2" />
          <span className="text-sm">{ticket.vote_count}</span>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-2">
        <div className="flex items-center gap-2">
          {/* Upvote Button */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => onUpvote(ticket.id)}
            disabled={hasVoted(1)} // Replace 1 with actual user ID when implemented
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{ticket.vote_count}</span>
          </Button>
        </div>
        <Button size="sm" onClick={onViewDetails}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
