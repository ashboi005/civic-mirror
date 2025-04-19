"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MessageSquare, Share } from "lucide-react"

interface CommunityPostProps {
  post: {
    id: number
    author: {
      name: string
      username: string
      avatar: string
      role: string
    }
    content: string
    date: string
    likes: number
    comments: number
    images?: string[]
  }
}

export function CommunityPost({ post }: CommunityPostProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1)
    } else {
      setLikeCount(likeCount + 1)
    }
    setIsLiked(!isLiked)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="border-gray-800 bg-black/40 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{post.author.name}</h3>
                <Badge variant="outline" className="bg-purple-500/20 text-purple-400 text-xs">
                  {post.author.role}
                </Badge>
              </div>
              <p className="text-xs text-gray-400">
                @{post.author.username} • {formatDistanceToNow(new Date(post.date), { addSuffix: true })}
              </p>
              <p className="mt-3 text-sm text-gray-300">{post.content}</p>

              {post.images && post.images.length > 0 && (
                <div className="mt-4 rounded-md overflow-hidden">
                  <img src={post.images[0] || "/placeholder.svg"} alt="Post image" className="w-full h-auto" />
                </div>
              )}

              <div className="flex items-center gap-4 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-1 ${isLiked ? "text-purple-400" : ""}`}
                  onClick={handleLike}
                >
                  <ThumbsUp className="h-4 w-4" /> {likeCount}
                </Button>
                <Button variant="ghost" size="sm" className="gap-1">
                  <MessageSquare className="h-4 w-4" /> {post.comments}
                </Button>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Share className="h-4 w-4" /> Share
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
