"use client"

import { useEffect, useRef } from "react"
import { MapPin } from "lucide-react"
import { Report } from "@/lib/api"

// Enhanced report type with coordinates for map display
export interface MapReport extends Report {
  coordinates: {
    lat: number;
    lng: number;
  };
  category?: string;
  date?: string;
  comments?: number;
  image?: string;
}

interface FullMapViewProps {
  issues: MapReport[];
  onSelectIssue: (issue: MapReport) => void;
  selectedIssueId?: number;
  onVote?: () => void;
}

export function FullMapView({ issues, onSelectIssue, selectedIssueId, onVote }: FullMapViewProps) {
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

  const getMarkerColor = (status: string | undefined) => {
    switch (status) {
      case "pending":
        return "text-yellow-500 bg-yellow-500/20"
      case "in_progress":
        return "text-blue-500 bg-blue-500/20"
      case "resolved":
        return "text-green-500 bg-green-500/20"
      default:
        return "text-yellow-500 bg-yellow-500/20" // Default to pending
    }
  }

  // Generate map positions for issues
  const issuesWithPositions = issues.map((issue, index) => {
    // We're using the coordinates from the MapReport
    const { lat, lng } = issue.coordinates;
    
    // Scale coordinates to viewport percentages
    // This is just a simple example, real maps would use proper projections
    const left = ((lng + 74.006) * 1000) % 80 + 10; // Just a formula to spread things across the map
    const top = ((lat - 40.7128) * 1000) % 400 + 50;
    
    return {
      ...issue,
      position: { left, top }
    };
  });

  return (
    <div className="relative h-full w-full" ref={mapRef}>
      {/* Issue markers */}
      {issuesWithPositions.map((issue) => {
        return (
          <div
            key={issue.id}
            className={`absolute flex flex-col items-center group cursor-pointer transition-transform duration-200 ${
              selectedIssueId === issue.id ? "scale-125 z-10" : "hover:scale-110"
            }`}
            style={{ left: `${issue.position.left}%`, top: `${issue.position.top}px` }}
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
                <p className="text-gray-400 text-xs mt-1">{issue.location || 'Unknown location'}</p>
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
