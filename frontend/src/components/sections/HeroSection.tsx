"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { HeroAnimation } from "@/components/hero-animation"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-purple-900/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-indigo-900/20 rounded-full blur-3xl"></div>
      
      <div className="container px-4 md:px-6 relative">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center"
        >
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Badge className="mb-4 bg-purple-500/10 text-purple-500 border-purple-500/20 backdrop-blur-sm">
                  Transforming Communities
                </Badge>
              </motion.div>
              <motion.h1 
                className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Empowering Citizens to Solve Local Issues
              </motion.h1>
              <motion.p 
                className="max-w-[600px] text-gray-400 md:text-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Report, track, and resolve civic problems in your community with the power of technology and collective action.
              </motion.p>
            </div>
            <motion.div 
              className="flex flex-col gap-2 min-[400px]:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 rounded-xl font-medium text-lg transition-all duration-300 shadow-[0_0_15px_rgba(124,58,237,0.5)] hover:shadow-[0_0_25px_rgba(124,58,237,0.7)]">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="px-8 py-6 rounded-xl font-medium text-lg border-gray-700 hover:bg-gray-800"
              >
                Learn More
              </Button>
            </motion.div>
          </div>
          <motion.div 
            className="relative lg:ml-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
            <div className="relative">
              <HeroAnimation />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}