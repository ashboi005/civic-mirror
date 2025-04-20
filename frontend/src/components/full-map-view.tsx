"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Report } from "@/lib/api"
import { useLoadScript } from '@react-google-maps/api';

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

// Container style for Google Maps
const containerStyle = {
  width: '100%',
  height: '100%'
};

// Map styling to match dark theme
const mapStyles = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#263c3f" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#6b9a76" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#38414e" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#212a37" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9ca5b3" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#1f2835" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#f3d19c" }]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [{ "color": "#2f3948" }]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#17263c" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#515c6d" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#17263c" }]
  }
];

// Libraries to load - add marker library
const libraries: ["places", "marker"] = ['places', 'marker'];

export function FullMapView({ issues, onSelectIssue, selectedIssueId, onVote, userLocation }: FullMapViewProps) {
  // State for currently open InfoWindow
  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<{[key: number]: google.maps.marker.AdvancedMarkerElement}>({});
  const [infoWindows, setInfoWindows] = useState<{[key: number]: google.maps.InfoWindow}>({});

  // Google Maps API loader with marker library
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
    version: "weekly" // Use the latest weekly version
  });

  // Handle map load
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
  }, []);

  // Handle marker click
  const handleMarkerClick = (issueId: number, issue: MapReport) => {
    setActiveMarker(issueId);
    onSelectIssue(issue);

    // Open the info window for this marker
    const infoWindow = infoWindows[issueId];
    if (infoWindow && markers[issueId]) {
      infoWindow.open({
        anchor: markers[issueId],
        map: mapInstance
      });
    }
  };

  // Create markers when map and issues are available
  useEffect(() => {
    if (!isLoaded || !mapInstance) return;
    
    // Clear existing markers
    Object.values(markers).forEach((marker) => {
      marker.map = null;
    });

    // Clear existing info windows
    Object.values(infoWindows).forEach((infoWindow) => {
      infoWindow.close();
    });

    const newMarkers: {[key: number]: google.maps.marker.AdvancedMarkerElement} = {};
    const newInfoWindows: {[key: number]: google.maps.InfoWindow} = {};

    issues.filter(issue => issue.id !== undefined).forEach((issue) => {
      if (!issue.id) return;

      // Create marker content based on issue status
      const markerColor = issue.status === 'pending' ? '#f59e0b' : 
                         issue.status === 'in_progress' ? '#3b82f6' : 
                         issue.status === 'resolved' ? '#10b981' : '#f59e0b';

      // Create a pin element
      const pinElement = document.createElement('div');
      pinElement.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="${markerColor}">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `;
      pinElement.style.cursor = 'pointer';
      
      // Add glow effect for selected issue
      if (issue.id === selectedIssueId) {
        pinElement.style.filter = 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))';
        pinElement.style.zIndex = '1000';
      }

      // Create advanced marker
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstance,
        position: issue.coordinates,
        content: pinElement,
        title: issue.title
      });

      // Create info window content
      const infoContent = document.createElement('div');
      infoContent.className = 'bg-gray-900 p-2 rounded max-w-[200px]';
      infoContent.innerHTML = `
        <h4 class="font-medium text-sm">${issue.title}</h4>
        <p class="text-gray-400 text-xs mt-1">${issue.location || 'Unknown location'}</p>
        ${issue.distance !== null && issue.distance !== undefined ? 
          `<p class="text-blue-400 text-xs mt-1">${issue.distance.toFixed(1)}km away</p>` : 
          ''}
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
        handleMarkerClick(issue.id as number, issue);
      });

      // Close other info windows when a new one is opened
      infoWindow.addListener('closeclick', () => {
        setActiveMarker(null);
      });

      newMarkers[issue.id] = marker;
      newInfoWindows[issue.id] = infoWindow;

      // Open info window if this is the selected issue
      if (issue.id === selectedIssueId) {
        infoWindow.open({
          anchor: marker,
          map: mapInstance
        });
        setActiveMarker(issue.id);
      }
    });

    setMarkers(newMarkers);
    setInfoWindows(newInfoWindows);

    // Add user location marker if available
    if (userLocation) {
      const userLocationElement = document.createElement('div');
      userLocationElement.innerHTML = `
        <div style="background-color: #3b82f6; border-radius: 50%; width: 16px; height: 16px; border: 3px solid white;"></div>
      `;

      new google.maps.marker.AdvancedMarkerElement({
        map: mapInstance,
        position: userLocation,
        content: userLocationElement,
        title: "Your location"
      });
    }
  }, [isLoaded, mapInstance, issues, selectedIssueId, userLocation]);

  // Handle render for Google Map
  const renderMap = () => {
    if (loadError) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-gray-900">
          <div className="text-red-500">
            Error loading Google Maps: {loadError.message}
          </div>
        </div>
      );
    }

    if (!isLoaded) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-gray-900">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-400">Loading map...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full w-full" id="map-container">
        <div id="google-map" className="h-full w-full" ref={(el) => {
          if (el && !mapInstance) {
            // Initialize the map
            const map = new google.maps.Map(el, {
              center: userLocation || { lat: 40.7128, lng: -74.006 },
              zoom: 12,
              styles: mapStyles,
              disableDefaultUI: true,
              zoomControl: true,
              fullscreenControl: false,
              streetViewControl: false,
              mapTypeControl: false
            });
            
            handleMapLoad(map);
          }
        }} />
      </div>
    );
  };

  return renderMap();
}
