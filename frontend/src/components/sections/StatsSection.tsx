"use client"

import { motion } from "framer-motion"
import { StatsCounter } from "@/components/stats-counter"

export function StatsSection() {
  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-indigo-900/10 pointer-events-none"></div>
      <div className="container px-4 md:px-6">
        <motion.div 
          className="grid gap-8 lg:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
            <StatsCounter value={1500} label="Issues Reported" />
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
            <StatsCounter value={1200} label="Issues Resolved" />
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
            <StatsCounter value={800} label="Active Users" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}