"use client"

import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle, MapPin, Calendar } from "lucide-react"

interface CommunityMemberProps {
  member: {
    id: number
    name: string
    username: string
    avatar: string
    role: string
    issuesReported: number
    issuesResolved: number
    location: string
    joinDate: string
    badges?: string[]
  }
}

export function CommunityMember({ member }: CommunityMemberProps) {
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-gray-800 bg-black/40 backdrop-blur-sm overflow-hidden h-full">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
              <AvatarFallback>
                {member.name.charAt(0)}
                {member.name.split(" ")[1]?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{member.name}</h3>
              <p className="text-sm text-gray-400">@{member.username}</p>
              <Badge variant="outline" className="mt-2 bg-purple-500/20 text-purple-400">
                {member.role}
              </Badge>
            </div>
          </div>

          {member.badges && member.badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {member.badges.map((badge) => (
                <Badge key={badge} className="bg-indigo-500/20 text-indigo-400 border-indigo-500/20">
                  {badge}
                </Badge>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{member.issuesReported} Reported</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{member.issuesResolved} Resolved</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{member.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm">
                Joined {formatDistanceToNow(new Date(member.joinDate), { addSuffix: true })}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Button variant="outline" className="w-full">
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
