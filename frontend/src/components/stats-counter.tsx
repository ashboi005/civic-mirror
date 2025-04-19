"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCounterProps {
  value: number
  label: string
}

export function StatsCounter({ value, label }: StatsCounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      let start = 0
      const duration = 2000 // 2 seconds
      const increment = Math.ceil(value / (duration / 16)) // 16ms per frame

      const timer = setInterval(() => {
        start += increment
        if (start >= value) {
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(start)
        }
      }, 16)

      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-gray-800 bg-black/40 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-500">
              {count.toLocaleString()}
            </div>
            <p className="text-gray-400 mt-2">{label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
