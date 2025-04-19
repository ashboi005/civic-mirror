"use client"

import { useEffect, useRef } from "react"

export function ResolutionTimeChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Define chart dimensions
    const padding = 60
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2

    // Define data
    const data = [
      { category: "Road", avgDays: 4.2 },
      { category: "Lighting", avgDays: 2.8 },
      { category: "Sanitation", avgDays: 1.5 },
      { category: "Water", avgDays: 3.7 },
      { category: "Other", avgDays: 5.1 },
    ]

    // Find max value for scaling
    const maxValue = Math.max(...data.map((item) => item.avgDays)) * 1.2

    // Draw grid lines
    ctx.strokeStyle = "#333"
    ctx.lineWidth = 0.5

    // Horizontal grid lines
    const numGridLines = 5
    for (let i = 0; i <= numGridLines; i++) {
      const y = padding + (chartHeight / numGridLines) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + chartWidth, y)
      ctx.stroke()

      // Add y-axis labels
      const value = (maxValue - (maxValue / numGridLines) * i).toFixed(1)
      ctx.fillStyle = "#888"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(`${value} days`, padding - 10, y + 3)
    }

    // Draw bars
    const barWidth = (chartWidth / data.length) * 0.6
    const barSpacing = (chartWidth / data.length) * 0.4

    data.forEach((item, i) => {
      const x = padding + (chartWidth / data.length) * i + barSpacing / 2
      const barHeight = (item.avgDays / maxValue) * chartHeight
      const y = padding + chartHeight - barHeight

      // Create gradient for bar
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)
      gradient.addColorStop(0, "#8B5CF6")
      gradient.addColorStop(1, "#6366F1")

      // Draw bar
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, barHeight, 4)
      ctx.fill()

      // Add category label
      ctx.fillStyle = "#888"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(item.category, x + barWidth / 2, canvas.height - padding / 2)

      // Add value label
      ctx.fillStyle = "#fff"
      ctx.font = "bold 10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`${item.avgDays.toFixed(1)}`, x + barWidth / 2, y - 5)
    })

    // Add title
    ctx.fillStyle = "#fff"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Average Resolution Time (Days) by Category", canvas.width / 2, padding / 2)
  }, [])

  return (
    <div className="w-full h-[300px]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
