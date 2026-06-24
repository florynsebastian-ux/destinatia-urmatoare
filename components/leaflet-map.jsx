'use client'

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function LeafletMap({ lat, lon, name, country, title }) {
  return (
    <MapContainer
      center={[lat, lon]}
      zoom={11}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker
        center={[lat, lon]}
        pathOptions={{ color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 0.3, weight: 2 }}
        radius={28}
      />
      <CircleMarker
        center={[lat, lon]}
        pathOptions={{ color: '#0e7490', fillColor: '#fff', fillOpacity: 1, weight: 3 }}
        radius={8}
      >
        <Popup>
          <div className="text-sm">
            <strong>{name}</strong>
            {country ? <><br/>{country}</> : null}
            {title ? <><br/><span className="text-slate-500">{title}</span></> : null}
          </div>
        </Popup>
      </CircleMarker>
    </MapContainer>
  )
}
