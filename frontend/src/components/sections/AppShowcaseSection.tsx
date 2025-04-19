"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Smartphone, Clock, CheckCircle } from "lucide-react"

export function AppShowcaseSection() {
  const mobileFeatures = [
    {
      title: "Report Issues Instantly",
      description: "Take a photo and submit a report in seconds",
      icon: <Smartphone className="h-5 w-5 text-purple-500" />
    },
    {
      title: "Receive Live Updates",
      description: "Get notified as your reports progress toward resolution",
      icon: <Clock className="h-5 w-5 text-indigo-500" />
    },
    {
      title: "Offline Capabilities",
      description: "Create reports even without cellular service",
      icon: <CheckCircle className="h-5 w-5 text-blue-500" />
    }
  ]

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="container px-4 md:px-6 relative">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <motion.div 
            className="flex flex-col space-y-6"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Badge className="w-fit bg-indigo-500/10 text-indigo-500 border-indigo-500/20 backdrop-blur-sm">
              Mobile Access
            </Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Take Action On The Go
            </h2>
            <p className="text-gray-400 md:text-xl">
              Download our mobile app and start reporting issues from anywhere in your community.
            </p>
            
            <div className="space-y-4">
              {mobileFeatures.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 p-2 rounded-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="flex gap-4 pt-4">
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Button className="bg-black hover:bg-gray-900 text-white border border-gray-800 px-6 py-5 rounded-xl">
                  <img src="/placeholder.svg?height=20&width=20" alt="Apple" className="mr-2 h-5 w-5" />
                  App Store
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Button className="bg-black hover:bg-gray-900 text-white border border-gray-800 px-6 py-5 rounded-xl">
                  <img src="/placeholder.svg?height=20&width=20" alt="Google" className="mr-2 h-5 w-5" />
                  Google Play
                </Button>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div
            className="relative mx-auto max-w-[350px]"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl blur-xl opacity-50"></div>
            <div className="relative bg-black/60 backdrop-blur-sm p-4 rounded-3xl border border-gray-800">
              <img 
                src="/placeholder.svg?height=600&width=300" 
                alt="Mobile App" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-4 rounded-xl backdrop-blur-sm border border-gray-800">
              <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Live Updates</Badge>
              <p className="text-sm mt-1 text-white">Issue resolved in 48 hours!</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}