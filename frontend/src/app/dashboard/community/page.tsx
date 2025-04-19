"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { motion } from "framer-motion"
import { CommunityMember } from "@/components/community-member"
import { CommunityPost } from "@/components/community-post"

// Mock data for community members
const communityMembers = [
  {
    id: 1,
    name: "John Doe",
    username: "johndoe",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Citizen",
    issuesReported: 12,
    issuesResolved: 8,
    location: "Downtown",
    joinDate: "2023-10-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    username: "janesmith",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Community Leader",
    issuesReported: 24,
    issuesResolved: 20,
    location: "Westside",
    joinDate: "2023-08-22",
    badges: ["Top Reporter", "Problem Solver"],
  },
  {
    id: 3,
    name: "Robert Johnson",
    username: "rjohnson",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Citizen",
    issuesReported: 8,
    issuesResolved: 5,
    location: "Northside",
    joinDate: "2023-11-05",
  },
  {
    id: 4,
    name: "Emily Davis",
    username: "emilyd",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Municipal Worker",
    issuesReported: 6,
    issuesResolved: 15,
    location: "Eastside",
    joinDate: "2023-09-18",
    badges: ["Quick Resolver"],
  },
]

// Mock data for community posts
const communityPosts = [
  {
    id: 1,
    author: {
      name: "Jane Smith",
      username: "janesmith",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Community Leader",
    },
    content:
      "Just organized a community cleanup at Central Park. Thanks to everyone who participated! We collected over 20 bags of trash and reported several issues that need attention.",
    date: "2024-04-17T14:30:00",
    likes: 24,
    comments: 8,
    images: ["/placeholder.svg?height=300&width=500"],
  },
  {
    id: 2,
    author: {
      name: "Robert Johnson",
      username: "rjohnson",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Citizen",
    },
    content:
      "Has anyone else noticed the increased response time for road repairs? My pothole report was fixed within 48 hours. Great job by the municipal team!",
    date: "2024-04-16T10:15:00",
    likes: 15,
    comments: 6,
  },
  {
    id: 3,
    author: {
      name: "Emily Davis",
      username: "emilyd",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Municipal Worker",
    },
    content:
      "Pro tip: When reporting water leakages, try to include a close-up photo of the leak and a wider shot showing the location. This helps our team locate and fix issues faster!",
    date: "2024-04-15T09:45:00",
    likes: 32,
    comments: 4,
  },
]

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<"feed" | "members">("feed")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMembers = communityMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <DashboardHeader />

      <div className="container px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-6 md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr]">
          <DashboardNav />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Community</h2>
                <p className="text-muted-foreground">Connect with other citizens and stay updated</p>
              </div>
            </div>

            <Tabs defaultValue="feed" className="w-full">
              <TabsList className="bg-gray-800/50 mb-6">
                <TabsTrigger value="feed" onClick={() => setActiveTab("feed")}>
                  Community Feed
                </TabsTrigger>
                <TabsTrigger value="members" onClick={() => setActiveTab("members")}>
                  Members
                </TabsTrigger>
              </TabsList>

              {activeTab === "members" && (
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search members..."
                      className="w-full bg-gray-900/50 border-gray-800 pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {activeTab === "feed" ? (
                <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
                  <Card className="border-gray-800 bg-black/40 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Avatar>
                          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Your Avatar" />
                          <AvatarFallback>YA</AvatarFallback>
                        </Avatar>
                        <Input
                          placeholder="Share something with the community..."
                          className="bg-gray-900/50 border-gray-800"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {communityPosts.map((post) => (
                    <motion.div key={post.id} variants={item}>
                      <CommunityPost post={post} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div className="grid gap-4 md:grid-cols-2" variants={container} initial="hidden" animate="show">
                  {filteredMembers.map((member) => (
                    <motion.div key={member.id} variants={item}>
                      <CommunityMember member={member} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
