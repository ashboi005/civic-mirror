"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { FeatureCard } from "@/components/feature-card"
import { MapPin, Zap, CheckCircle, BarChart3, Users, Building } from "lucide-react"

export function FeaturesSection() {
  return (
    <section className="py-20 bg-black/20 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-purple-900/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-indigo-900/10 rounded-full blur-3xl"></div>
      
      <div className="container px-4 md:px-6 relative">
        <motion.div 
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 backdrop-blur-sm">
            Features
          </Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How Civic Mirror Works</h2>
          <p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Our platform makes it easy to report and resolve civic issues in your community
          </p>
        </motion.div>
        
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<MapPin className="h-10 w-10 text-purple-500" />}
            title="Report Issues"
            description="Easily report local issues with photos and location data in just a few taps"
          />
          <FeatureCard
            icon={<Zap className="h-10 w-10 text-indigo-500" />}
            title="AI Categorization"
            description="Issues are automatically categorized using advanced AI technology"
          />
          <FeatureCard
            icon={<CheckCircle className="h-10 w-10 text-blue-500" />}
            title="Track Progress"
            description="Follow the status of your reports from submission to resolution"
          />
          <FeatureCard
            icon={<BarChart3 className="h-10 w-10 text-teal-500" />}
            title="Visual Analytics"
            description="Get insights on community issues with powerful data visualization"
          />
          <FeatureCard
            icon={<Users className="h-10 w-10 text-amber-500" />}
            title="Community Engagement"
            description="Collaborate with neighbors to address local concerns together"
          />
          <FeatureCard
            icon={<Building className="h-10 w-10 text-rose-500" />}
            title="Government Integration"
            description="Direct connection with local government services and departments"
          />
        </div>
      </div>
    </section>
  )
}