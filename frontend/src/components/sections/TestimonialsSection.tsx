"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star } from "lucide-react"

type TestimonialType = {
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

type TestimonialSetType = {
  [key: string]: TestimonialType[];
}

type StylesType = {
  borderColor: string;
  avatarBorder: string;
}

export function TestimonialsSection() {
  const testimonialSets: TestimonialSetType = {
    citizens: [
      {
        name: "Sarah Johnson",
        role: "Community Activist",
        avatar: "/placeholder.svg?height=100&width=100",
        content: "Civic Mirror transformed how our neighborhood addresses local issues. I reported a dangerous pothole that was fixed within days!",
        rating: 5
      },
      {
        name: "Michael Chen",
        role: "Neighborhood Watch",
        avatar: "/placeholder.svg?height=100&width=100",
        content: "The ability to track progress on community issues has increased transparency and trust between residents and local authorities.",
        rating: 5
      },
      {
        name: "Priya Patel",
        role: "Local Business Owner",
        avatar: "/placeholder.svg?height=100&width=100",
        content: "As a business owner, I've seen firsthand how improving local infrastructure through this platform has increased foot traffic.",
        rating: 4
      }
    ],
    government: [
      {
        name: "Mayor Robert Williams",
        role: "City Hall",
        avatar: "/placeholder.svg?height=100&width=100",
        content: "Civic Mirror has streamlined how our departments receive and respond to citizen concerns. A game-changer for municipal management.",
        rating: 5
      },
      {
        name: "Jane Rivera",
        role: "Public Works Department",
        avatar: "/placeholder.svg?height=100&width=100",
        content: "This platform helps us prioritize which infrastructure issues to address first based on community feedback and urgency.",
        rating: 4
      },
      {
        name: "Daniel Park",
        role: "Urban Planning Committee",
        avatar: "/placeholder.svg?height=100&width=100",
        content: "The data collected through Civic Mirror has been invaluable for our city's long-term development planning process.",
        rating: 5
      }
    ],
    organizations: [
      {
        name: "Lisa Thompson",
        role: "Neighborhood Association",
        avatar: "/placeholder.svg?height=100&width=100",
        content: "Our association uses Civic Mirror to coordinate beautification projects and track their impact across multiple neighborhoods.",
        rating: 5
      },
      {
        name: "Marcus Johnson",
        role: "Environmental NGO",
        avatar: "/placeholder.svg?height=100&width=100",
        content: "We've successfully used the platform to document and address environmental concerns in collaboration with local authorities.",
        rating: 4
      },
      {
        name: "Elena Rodriguez",
        role: "Community Foundation",
        avatar: "/placeholder.svg?height=100&width=100",
        content: "The data from Civic Mirror helps us direct our funding to the areas of greatest need in the community.",
        rating: 5
      }
    ]
  }

  const getGroupStyles = (group: string): StylesType => {
    switch (group) {
      case 'citizens':
        return {
          borderColor: 'border-purple-900/50',
          avatarBorder: 'border-purple-500/20'
        }
      case 'government':
        return {
          borderColor: 'border-indigo-900/50',
          avatarBorder: 'border-indigo-500/20'
        }
      case 'organizations':
        return {
          borderColor: 'border-blue-900/50',
          avatarBorder: 'border-blue-500/20'
        }
      default:
        return {
          borderColor: 'border-purple-900/50',
          avatarBorder: 'border-purple-500/20'
        }
    }
  }

  return (
    <section className="py-20 bg-black/20 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/4 h-1/4 bg-indigo-900/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-purple-900/10 rounded-full blur-3xl"></div>
      
      <div className="container px-4 md:px-6 relative">
        <motion.div 
          className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 backdrop-blur-sm">
            Testimonials
          </Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            What People Are Saying
          </h2>
          <p className="max-w-[700px] text-gray-400 md:text-xl/relaxed">
            Hear from citizens and civic leaders who are making a difference
          </p>
        </motion.div>

        <Tabs defaultValue="citizens" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-gray-800/50 backdrop-blur-sm">
              <TabsTrigger value="citizens">Citizens</TabsTrigger>
              <TabsTrigger value="government">Government</TabsTrigger>
              <TabsTrigger value="organizations">Organizations</TabsTrigger>
            </TabsList>
          </div>

          {Object.entries(testimonialSets).map(([group, testimonials]) => (
            <TabsContent key={group} value={group} className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((testimonial, index) => {
                  const styles = getGroupStyles(group);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="group"
                    >
                      <Card className={`border-gray-800 bg-black/40 backdrop-blur-sm overflow-hidden h-full group-hover:${styles.borderColor} transition-colors duration-300`}>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <Avatar className={`h-12 w-12 border-2 ${styles.avatarBorder}`}>
                              <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                              <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="text-lg font-semibold">{testimonial.name}</h4>
                              <p className="text-sm text-gray-400">{testimonial.role}</p>
                            </div>
                          </div>
                          <div className="flex mb-4">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-500' : 'text-gray-600'}`} 
                                fill={i < testimonial.rating ? 'currentColor' : 'none'} 
                              />
                            ))}
                          </div>
                          <p className="text-gray-300 italic">{testimonial.content}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}