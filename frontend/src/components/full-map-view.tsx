"use client"

import { useEffect, useRef } from "react"
import { MapPin } from "lucide-react"

interface Issue {
  id: number
  title: string
  description: string
  category: string
  status: string
  location: string
  date: string
  votes: number
  comments: number
  image: string
  coordinates: {
    lat: number
    lng: number
  }
}

interface FullMapViewProps {
  issues: Issue[]
  onSelectIssue: (issue: Issue) => void
  selectedIssueId?: number
}

export function FullMapView({ issues, onSelectIssue, selectedIssueId }: FullMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const mapElement = mapRef.current

    // Create a mock map with a grid
    const ctx = document.createElement("canvas").getContext("2d")
    if (!ctx) return

    const canvas = ctx.canvas
    canvas.width = mapElement.clientWidth
    canvas.height = mapElement.clientHeight

    // Draw grid
    ctx.fillStyle = "#111111"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = "#222222"
    ctx.lineWidth = 1

    // Draw grid lines
    const gridSize = 40
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw some roads
    ctx.strokeStyle = "#333333"
    ctx.lineWidth = 8

    // Horizontal main road
    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()

    // Vertical main road
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.stroke()

    // Some diagonal roads
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(canvas.width / 3, canvas.height / 3)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(canvas.width, 0)
    ctx.lineTo((canvas.width * 2) / 3, canvas.height / 3)
    ctx.stroke()

    // Add a blue dot for current location
    ctx.fillStyle = "#3b82f6"
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, 8, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, 12, 0, Math.PI * 2)
    ctx.stroke()

    // Set the canvas as the background
    mapElement.style.backgroundImage = `url(${canvas.toDataURL()})`
    mapElement.style.backgroundSize = "cover"
    mapElement.style.backgroundPosition = "center"

    return () => {
      mapElement.style.backgroundImage = ""
    }
  }, [])

  const getMarkerColor = (status: string) => {
    switch (status) {
      case "Open":
        return "text-yellow-500 bg-yellow-500/20"
      case "In Progress":
        return "text-blue-500 bg-blue-500/20"
      case "Resolved":
        return "text-green-500 bg-green-500/20"
      default:
        return "text-gray-500 bg-gray-500/20"
    }
  }

  return (
    <div className="relative h-full w-full" ref={mapRef}>
      {/* Issue markers */}
      {issues.map((issue, index) => {
        // Generate random positions for demo
        const left = 10 + index * 15 + Math.random() * 50
        const top = 10 + index * 10 + Math.random() * 400

        return (
          <div
            key={issue.id}
            className={`absolute flex flex-col items-center group cursor-pointer transition-transform duration-200 ${
              selectedIssueId === issue.id ? "scale-125 z-10" : "hover:scale-110"
            }`}
            style={{ left: `${left}%`, top: `${top}px` }}
            onClick={() => onSelectIssue(issue)}
          >
            <div
              className={`p-2 rounded-full ${getMarkerColor(issue.status)} shadow-lg ${
                selectedIssueId === issue.id ? "ring-2 ring-white" : ""
              }`}
            >
              <MapPin className="h-6 w-6" />
            </div>
            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-black/80 backdrop-blur-sm p-2 rounded-md shadow-lg text-xs max-w-[200px]">
                <p className="font-semibold">{issue.title}</p>
                <p className="text-gray-400 text-xs mt-1">{issue.location}</p>
              </div>
            </div>
          </div>
        )
      })}

      {/* Current location indicator */}
      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm p-2 rounded-md shadow-lg text-xs flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
        <span>Your Location</span>
      </div>
    </div>
  )
}
