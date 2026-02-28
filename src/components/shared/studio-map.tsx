"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface StudioMapProps {
  lat: number
  lng: number
  city?: string
  className?: string
}

export function StudioMap({ lat, lng, city, className = "" }: StudioMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: false,
    })

    // Vector-style tile layer (Carto Voyager - clean, modern look)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
      }
    ).addTo(map)

    // Approximate location circle (privacy - don't show exact pin)
    L.circle([lat, lng], {
      radius: 500,
      color: "#000",
      fillColor: "#000",
      fillOpacity: 0.08,
      weight: 1.5,
      opacity: 0.3,
    }).addTo(map)

    // Center dot
    const dotIcon = L.divIcon({
      className: "studio-map-dot",
      html: `<div style="width:12px;height:12px;background:#000;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    })

    L.marker([lat, lng], { icon: dotIcon }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [lat, lng])

  return (
    <div className={`relative rounded-2xl overflow-hidden z-0 ${className}`}>
      <div ref={mapRef} className="w-full h-full" />
      {city && (
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md flex items-center gap-2">
          <span className="material-symbols-outlined text-base">location_on</span>
          <span className="text-sm font-medium">{city}</span>
        </div>
      )}
    </div>
  )
}
