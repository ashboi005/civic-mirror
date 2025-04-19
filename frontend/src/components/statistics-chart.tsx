"use client"

import { useEffect, useRef } from "react"

interface StatisticsChartProps {
  timeRange: "week" | "month" | "year"
}

export function StatisticsChart({ timeRange }: StatisticsChartProps) {
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
    const padding = 40
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2

    // Generate data based on time range
    let labels: string[] = []
    let reportedData: number[] = []
    let resolvedData: number[] = []

    if (timeRange === "week") {
      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      reportedData = [12, 19, 15, 8, 22, 14, 10]
      resolvedData = [8, 15, 12, 6, 18, 10, 7]
    } else if (timeRange === "month") {
      labels = Array.from({ length: 30 }, (_, i) => (i + 1).toString())
      reportedData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 30) + 5)
      resolvedData = reportedData.map((val) => Math.floor(val * (0.7 + Math.random() * 0.2)))
    } else if (timeRange === "year") {
      labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      reportedData = [45, 52, 38, 65, 74, 80, 62, 58, 90, 85, 72, 78]
      resolvedData = [35, 42, 30, 55, 60, 65, 50, 45, 75, 70, 60, 65]
    }

    // Find max value for scaling
    const maxValue = Math.max(...reportedData, ...resolvedData) * 1.2

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
      const value = Math.round(maxValue - (maxValue / numGridLines) * i)
      ctx.fillStyle = "#888"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(value.toString(), padding - 10, y + 3)
    }

    // Draw x-axis labels
    const xStep = chartWidth / (labels.length - 1)
    labels.forEach((label, i) => {
      const x = padding + xStep * i
      ctx.fillStyle = "#888"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(label, x, canvas.height - padding / 2)
    })

    // Draw reported issues line
    ctx.strokeStyle = "#8B5CF6"
    ctx.lineWidth = 2
    ctx.beginPath()
    reportedData.forEach((value, i) => {
      const x = padding + (chartWidth / (reportedData.length - 1)) * i
      const y = padding + chartHeight - (value / maxValue) * chartHeight
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw resolved issues line
    ctx.strokeStyle = "#6366F1"
    ctx.lineWidth = 2
    ctx.beginPath()
    resolvedData.forEach((value, i) => {
      const x = padding + (chartWidth / (resolvedData.length - 1)) * i
      const y = padding + chartHeight - (value / maxValue) * chartHeight
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw data points for reported issues
    reportedData.forEach((value, i) => {
      const x = padding + (chartWidth / (reportedData.length - 1)) * i
      const y = padding + chartHeight - (value / maxValue) * chartHeight

      ctx.fillStyle = "#8B5CF6"
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw data points for resolved issues
    resolvedData.forEach((value, i) => {
      const x = padding + (chartWidth / (resolvedData.length - 1)) * i
      const y = padding + chartHeight - (value / maxValue) * chartHeight

      ctx.fillStyle = "#6366F1"
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    // Add legend
    const legendX = padding
    const legendY = padding / 2

    // Reported legend
    ctx.fillStyle = "#8B5CF6"
    ctx.beginPath()
    ctx.arc(legendX, legendY, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#fff"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("Reported", legendX + 10, legendY + 4)

    // Resolved legend
    ctx.fillStyle = "#6366F1"
    ctx.beginPath()
    ctx.arc(legendX + 100, legendY, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#fff"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("Resolved", legendX + 110, legendY + 4)
  }, [timeRange])

  return (
    <div className="w-full h-[300px]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
