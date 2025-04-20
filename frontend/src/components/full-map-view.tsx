"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Navigation } from "lucide-react"
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
  // Add these properties for the component to use
  position?: {
    left: number;
    top: number;
  };
  distance?: number | null;
}

// Coordinates interface
interface Coordinates {
  lat: number;
  lng: number;
}

interface FullMapViewProps {
  issues: MapReport[];
  onSelectIssue: (issue: MapReport) => void;
  selectedIssueId?: number;
  onVote?: () => void;
  userLocation?: Coordinates | null;
}

export function FullMapView({ issues, onSelectIssue, selectedIssueId, onVote, userLocation }: FullMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapCenterLat, setMapCenterLat] = useState(40.7128) // Default to NYC
  const [mapCenterLng, setMapCenterLng] = useState(-74.006)

  useEffect(() => {
    // If user location exists, update the map center
    if (userLocation) {
      setMapCenterLat(userLocation.lat);
      setMapCenterLng(userLocation.lng);
    }
  }, [userLocation]);

  useEffect(() => {
    if (!mapRef.current) return

    const mapElement = mapRef.current

    // Create a canvas for the map background
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = mapElement.clientWidth || 800
    canvas.height = mapElement.clientHeight || 600

    // Draw map background
    ctx.fillStyle = "#111111"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
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

    // Draw main roads
    ctx.strokeStyle = "#333333"
    ctx.lineWidth = 4

    // Horizontal main roads
    for (let y = gridSize * 2; y < canvas.height; y += gridSize * 4) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Vertical main roads
    for (let x = gridSize * 2; x < canvas.width; x += gridSize * 4) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    // Secondary roads
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 2;

    // Draw some intersecting roads
    for (let i = 1; i < 4; i++) {
      // Diagonal roads
      ctx.beginPath()
      ctx.moveTo(canvas.width * (i/4), 0)
      ctx.lineTo(canvas.width, canvas.height * (i/4))
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(0, canvas.height * (i/4))
      ctx.lineTo(canvas.width * (i/4), canvas.height)
      ctx.stroke()
    }

    // Draw city blocks
    for (let x = gridSize * 4; x < canvas.width; x += gridSize * 8) {
      for (let y = gridSize * 4; y < canvas.height; y += gridSize * 8) {
        ctx.fillStyle = "#1a1a1a"
        ctx.fillRect(x, y, gridSize * 2, gridSize * 2)
      }
    }

    // Add a blue dot for current location (only if we have a real user location)
    if (userLocation) {
      // Draw pulsing effect
      ctx.fillStyle = "rgba(59, 130, 246, 0.2)" // Semi-transparent blue
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, 24, 0, Math.PI * 2)
      ctx.fill()
      
      // Draw blue dot
      ctx.fillStyle = "#3b82f6"
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, 10, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, 16, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Set the canvas as the background
    const dataUrl = canvas.toDataURL()
    mapElement.style.backgroundImage = `url(${dataUrl})`
    mapElement.style.backgroundSize = "cover"
    mapElement.style.backgroundPosition = "center"

    return () => {
      mapElement.style.backgroundImage = ""
    }
  }, [mapRef, userLocation, mapCenterLat, mapCenterLng])

  const getMarkerColor = (status: string | undefined) => {
    switch (status) {
      case "pending":
        return "text-amber-500 bg-amber-500/20 border border-amber-500/40"
      case "in_progress":
        return "text-blue-500 bg-blue-500/20 border border-blue-500/40"
      case "resolved":
        return "text-green-500 bg-green-500/20 border border-green-500/40"
      default:
        return "text-amber-500 bg-amber-500/20 border border-amber-500/40" // Default to pending
    }
  }

  // Calculate distance between user and issue
  const calculateDistance = (issueCoords: Coordinates): number | null => {
    if (!userLocation) return null;
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (issueCoords.lat - userLocation.lat) * Math.PI / 180;
    const dLon = (issueCoords.lng - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(issueCoords.lat * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Position issues evenly across the map
  const issuesWithPositions = issues.map((issue, index) => {
    // Create a more predictable distribution of markers across the map
    // Rather than using the actual coordinates which may not display well
    const totalIssues = issues.length;
    const columns = Math.ceil(Math.sqrt(totalIssues));
    const rows = Math.ceil(totalIssues / columns);
    
    const col = index % columns;
    const row = Math.floor(index / columns);
    
    // Position markers in a grid pattern
    const left = 20 + (col * 60 / columns); 
    const top = 50 + (row * 400 / rows);
    
    // Calculate distance from user if available
    const distance = calculateDistance(issue.coordinates);
    
    return {
      ...issue,
      position: { left, top },
      distance
    };
  });

  // Group markers by position to avoid overlap
  const groupedMarkers: Record<string, MapReport[]> = {};
  
  issuesWithPositions.forEach(issue => {
    const posKey = `${Math.round(issue.position.left)}-${Math.round(issue.position.top)}`;
    if (!groupedMarkers[posKey]) {
      groupedMarkers[posKey] = [];
    }
    groupedMarkers[posKey].push(issue);
  });

  return (
    <div className="relative h-full w-full overflow-hidden" ref={mapRef}>
      {/* Issue markers */}
      {Object.entries(groupedMarkers).map(([posKey, issues]) => {
        const issue = issues[0]; // Use the first issue for positioning
        const isMultiple = issues.length > 1;
        
        return (
          <div
            key={posKey}
            className={`absolute flex flex-col items-center group cursor-pointer transition-transform duration-200 ${
              issues.some(i => i.id === selectedIssueId) ? "scale-125 z-10" : "hover:scale-110"
            }`}
            style={{ 
              left: `${issue.position?.left ?? 0}%`, 
              top: `${issue.position?.top ?? 0}px` 
            }}
          >
            <div 
              className={`p-2 rounded-full ${getMarkerColor(issue.status)} shadow-lg ${
                issues.some(i => i.id === selectedIssueId) ? "ring-2 ring-white" : ""
              } ${isMultiple ? "border-2" : ""}`}
              onClick={() => onSelectIssue(issue)}
            >
              {isMultiple ? (
                <div className="relative">
                  <MapPin className="h-6 w-6" />
                  <div className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {issues.length}
                  </div>
                </div>
              ) : (
                <MapPin className="h-6 w-6" />
              )}
            </div>
            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30">
              <div className="bg-black/90 backdrop-blur-sm p-2 rounded-md shadow-lg text-xs max-w-[200px]">
                {isMultiple ? (
                  <>
                    <p className="font-semibold">{issues.length} Issues at this location</p>
                    <ul className="mt-1 space-y-1">
                      {issues.slice(0, 3).map(i => (
                        <li key={i.id} className="text-gray-300 text-xs">{i.title}</li>
                      ))}
                      {issues.length > 3 && <li className="text-gray-400 text-xs">...and {issues.length - 3} more</li>}
                    </ul>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">{issue.title}</p>
                    <p className="text-gray-400 text-xs mt-1">{issue.location || 'Unknown location'}</p>
                  </>
                )}
                
                {issue.distance !== null && issue.distance !== undefined && (
                  <p className="text-blue-400 text-xs mt-1">
                    {issue.distance.toFixed(1)}km away
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* User location indicator */}
      {userLocation && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative">
            <div className="absolute -inset-4 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
            <div className="relative bg-blue-500 p-2 rounded-full shadow-lg">
              <Navigation className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
