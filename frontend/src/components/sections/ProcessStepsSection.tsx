"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Zap, CheckCircle, Users, ChevronRight } from "lucide-react"

export function ProcessStepsSection() {
  const steps = [
    {
      number: "01",
      title: "Report Issue",
      description: "Snap a photo, mark the location, and describe the problem in seconds",
      icon: <MapPin className="h-10 w-10 text-purple-500" />,
      delay: 0.1
    },
    {
      number: "02",
      title: "AI Processing",
      description: "Our AI categorizes the issue and routes it to the right department",
      icon: <Zap className="h-10 w-10 text-indigo-500" />,
      delay: 0.2
    },
    {
      number: "03",
      title: "Community Votes",
      description: "Issues gain visibility as community members vote and comment",
      icon: <Users className="h-10 w-10 text-blue-500" />,
      delay: 0.3
    },
    {
      number: "04",
      title: "Resolution",
      description: "Track progress and receive notifications until the issue is resolved",
      icon: <CheckCircle className="h-10 w-10 text-green-500" />,
      delay: 0.4
    }
  ]

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="container px-4 md:px-6">
        <motion.div 
          className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 backdrop-blur-sm">
            Process
          </Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Simple 4-Step Process</h2>
          <p className="max-w-[700px] text-gray-400 md:text-xl/relaxed">
            From reporting to resolution, we make civic engagement straightforward
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: step.delay }}
              viewport={{ once: true }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <Card className="border-gray-800 bg-black/40 backdrop-blur-sm overflow-hidden h-full">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    {step.icon}
                  </div>
                  <div className="absolute top-3 right-3 font-bold text-3xl opacity-20 text-white">{step.number}</div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </CardContent>
              </Card>
              {index < 3 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ChevronRight className="h-8 w-8 text-indigo-500" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}