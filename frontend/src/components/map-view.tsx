"use client"

import { useState, useEffect, useCallback } from "react"
import { MapPin } from "lucide-react"
import { Report } from "@/lib/api"
import { useLoadScript } from "@react-google-maps/api"

interface MapViewProps {
  issues: Report[]
}

// Coordinates interface
interface Coordinates {
  lat: number;
  lng: number;
}

// Map styling to match dark theme
const mapStyles = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#242f3e" }]
  },
  // ...existing code...
];

// Libraries to load
const libraries: ["places", "marker"] = ['places', 'marker'];

export function MapView({ issues }: MapViewProps) {
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  // Google Maps API loader
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
    version: "weekly"
  });

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);

  // Handle map load
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
  }, []);

  // Create markers when map and issues are loaded
  useEffect(() => {
    if (!isLoaded || !mapInstance) return;

    // Clear existing markers
    mapInstance.data.forEach((feature) => {
      mapInstance.data.remove(feature);
    });

    // Add markers for each issue
    issues.forEach((issue) => {
      if (!issue.id) return;

      // Generate random positions for demo since actual coordinates may not be available
      const lat = 40.7128 + (Math.random() - 0.5) * 0.02; // Around NYC coordinates
      const lng = -74.006 + (Math.random() - 0.5) * 0.02;

      // Create marker element
      const markerColor = issue.status === 'pending' ? '#f59e0b' : 
                         issue.status === 'in_progress' ? '#3b82f6' : 
                         issue.status === 'resolved' ? '#10b981' : '#f59e0b';

      // Create a pin element
      const pinElement = document.createElement('div');
      pinElement.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="${markerColor}">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `;
      pinElement.style.cursor = 'pointer';

      // Create advanced marker
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstance,
        position: { lat, lng },
        content: pinElement,
        title: issue.title
      });

      // Create info window content
      const infoContent = document.createElement('div');
      infoContent.className = 'bg-gray-900 p-2 rounded max-w-[200px]';
      infoContent.innerHTML = `
        <h4 style="font-weight: 500; font-size: 0.875rem;">${issue.title}</h4>
        <p style="color: #9ca3af; font-size: 0.75rem; margin-top: 0.25rem;">${issue.location || 'Unknown location'}</p>
      `;
      infoContent.style.background = '#1f2937';
      infoContent.style.color = 'white';
      infoContent.style.padding = '8px';
      infoContent.style.borderRadius = '4px';
      infoContent.style.maxWidth = '200px';

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: infoContent
      });

      // Add event listener to marker
      marker.addEventListener('click', () => {
        infoWindow.open({
          anchor: marker,
          map: mapInstance
        });
      });
    });

    // Add user location marker
    if (userLocation) {
      const userLocationElement = document.createElement('div');
      userLocationElement.innerHTML = `
        <div style="background-color: #3b82f6; border-radius: 50%; width: 16px; height: 16px; border: 2px solid white;"></div>
      `;

      new google.maps.marker.AdvancedMarkerElement({
        map: mapInstance,
        position: userLocation,
        content: userLocationElement,
        title: "Your location"
      });
    }
  }, [isLoaded, mapInstance, issues, userLocation]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-[500px] w-full bg-gray-900 rounded-lg">
        <div className="text-red-500">
          Error loading Google Maps: {loadError.message}
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[500px] w-full bg-gray-900 rounded-lg">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-400">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[500px] w-full rounded-lg overflow-hidden">
      <div 
        className="h-full w-full" 
        ref={(el) => {
          if (el && !mapInstance) {
            // Initialize the map
            const map = new google.maps.Map(el, {
              center: userLocation || { lat: 40.7128, lng: -74.006 }, // Default to NYC
              zoom: 14,
              styles: mapStyles,
              disableDefaultUI: true,
              zoomControl: true,
              fullscreenControl: false,
              streetViewControl: false,
              mapTypeControl: false,
            });
            
            handleMapLoad(map);
          }
        }}
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm p-2 rounded-md shadow-lg text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <span>Open Issues</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span>Resolved</span>
        </div>
      </div>
    </div>
  );
}
