"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export function HeroAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create particles
    const particles: {
      x: number
      y: number
      radius: number
      color: string
      velocity: { x: number; y: number }
    }[] = []

    const colors = ["#8B5CF6", "#6366F1", "#4F46E5", "#4338CA"]

    for (let i = 0; i < 50; i++) {
      const radius = Math.random() * 3 + 1
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocity: {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
        },
      })
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw and update particles
      particles.forEach((particle) => {
        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()

        // Update position
        particle.x += particle.velocity.x
        particle.y += particle.velocity.y

        // Bounce off edges
        if (particle.x + particle.radius > canvas.width || particle.x - particle.radius < 0) {
          particle.velocity.x = -particle.velocity.x
        }

        if (particle.y + particle.radius > canvas.height || particle.y - particle.radius < 0) {
          particle.velocity.y = -particle.velocity.y
        }
      })

      // Draw connections
      particles.forEach((particleA, i) => {
        particles.slice(i + 1).forEach((particleB) => {
          const distance = Math.sqrt(Math.pow(particleA.x - particleB.x, 2) + Math.pow(particleA.y - particleB.y, 2))

          if (distance < 100) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(150, 150, 255, ${1 - distance / 100})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particleA.x, particleA.y)
            ctx.lineTo(particleB.x, particleB.y)
            ctx.stroke()
          }
        })
      })
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [])

  return (
    <motion.div
      className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden border border-gray-800 bg-black/40"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-64 h-64 md:w-80 md:h-80">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-r from-purple-600/30 to-indigo-600/30 animate-pulse [animation-delay:300ms]" />
          <div className="absolute inset-8 rounded-full bg-gradient-to-r from-purple-700/40 to-indigo-700/40 animate-pulse [animation-delay:600ms]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.5)]"
            >
              <span className="text-white text-4xl font-bold">CM</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
