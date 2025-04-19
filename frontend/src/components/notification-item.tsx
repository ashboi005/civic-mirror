"use client"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, MessageSquare, CheckCircle, ThumbsUp, MapPin, MoreHorizontal, Check, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Notification {
  id: number
  title: string
  description: string
  date: string
  read: boolean
  type: "status" | "comment" | "upvote" | "nearby"
  relatedId: number
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: () => void
  onDelete: () => void
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "status":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "comment":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "upvote":
        return <ThumbsUp className="h-5 w-5 text-purple-500" />
      case "nearby":
        return <MapPin className="h-5 w-5 text-indigo-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div
      className={`flex items-start gap-4 p-4 hover:bg-gray-900/30 transition-colors ${
        !notification.read ? "bg-gray-900/20" : ""
      }`}
    >
      <div className="rounded-full bg-gray-900/50 p-2 mt-1">{getIcon(notification.type)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium">{notification.title}</h4>
          {!notification.read && (
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 text-xs">
              New
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-400 mt-1">{notification.description}</p>
        <p className="text-xs text-gray-500 mt-2">
          {formatDistanceToNow(new Date(notification.date), { addSuffix: true })}
        </p>
      </div>
      <div className="flex items-center">
        {!notification.read && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onMarkAsRead}>
            <Check className="h-4 w-4" />
            <span className="sr-only">Mark as read</span>
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onMarkAsRead} disabled={notification.read}>
              <Check className="mr-2 h-4 w-4" /> Mark as read
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
