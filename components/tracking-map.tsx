"use client"

import { useState, useEffect } from "react"
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api"

const containerStyle = {
  width: "100%",
  height: "256px", // Matching the h-64 from the previous implementation
}

interface Location {
  lat: number
  lng: number
}

interface TrackingMapProps {
  currentLocation: string
  trackingId: string
}

export default function TrackingMap({ currentLocation, trackingId }: TrackingMapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  })

  const [vehicleLocation, setVehicleLocation] = useState<Location | null>(null)

  // Default center (Chicago, IL - matching our mock data)
  const center = {
    lat: 41.8781,
    lng: -87.6298,
  }

  useEffect(() => {
    // Mock function to simulate getting vehicle coordinates
    async function fetchLocation() {
      try {
        // For now, we'll use mock coordinates for Chicago, IL
        // In a real app, this would fetch from your API endpoint
        const mockLocation = {
          lat: 41.8781,
          lng: -87.6298,
        }
        setVehicleLocation(mockLocation)

        // Uncomment below for real API integration:
        // const res = await fetch(`/api/vehicle-location/${trackingId}`)
        // if (!res.ok) throw new Error("Error fetching coordinates")
        // const data = await res.json()
        // setVehicleLocation(data)
      } catch (err) {
        console.error("Error fetching vehicle location:", err)
        // Fallback to default location
        setVehicleLocation(center)
      }
    }

    fetchLocation()

    // For real-time updates, uncomment the line below:
    // const interval = setInterval(fetchLocation, 30000) // Update every 30 seconds
    // return () => clearInterval(interval)
  }, [trackingId])

  if (loadError) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4">
          <div className="w-full h-64 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <p className="text-red-500 font-body">Error loading map</p>
              <p className="text-sm text-gray-500 font-body">Please check your internet connection</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 font-body">📍 Current location: {currentLocation}</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4">
          <div className="w-full h-64 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#044BD9] mx-auto mb-2"></div>
              <p className="text-gray-600 font-body">Loading map...</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 font-body">📍 Current location: {currentLocation}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="p-4">
        <div className="w-full h-64 rounded-lg border border-gray-200 overflow-hidden">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={vehicleLocation || center}
            zoom={vehicleLocation ? 12 : 8}
            options={{
              styles: [
                {
                  featureType: "all",
                  elementType: "geometry.fill",
                  stylers: [{ color: "#f5f5f5" }],
                },
                {
                  featureType: "water",
                  elementType: "geometry",
                  stylers: [{ color: "#e9e9e9" }],
                },
                {
                  featureType: "road",
                  elementType: "geometry",
                  stylers: [{ color: "#ffffff" }],
                },
              ],
            }}
          >
            {vehicleLocation && (
              <Marker
                position={vehicleLocation}
                title={`Vehicle Location - ${trackingId}`}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE, // Updated to use window.google
                  scale: 12,
                  fillColor: "#044BD9",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 3,
                }}
              />
            )}
          </GoogleMap>
        </div>
        <p className="text-sm text-gray-500 mt-2 font-body">📍 Current location: {currentLocation}</p>
      </div>
    </div>
  )
}
