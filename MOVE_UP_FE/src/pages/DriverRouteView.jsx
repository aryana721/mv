import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import socketIOClient from 'socket.io-client';
import api from '../services/api';

const socket = socketIOClient('http://localhost:5000');

// Custom marker icons
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const FitBounds = ({ points }) => {
  const map = useMap();
  React.useEffect(() => {
    if (!points || points.length === 0) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [points, map]);
  return null;
};

const isValidLatLng = (point) =>
  Array.isArray(point) &&
  point.length === 2 &&
  typeof point[0] === 'number' &&
  typeof point[1] === 'number';

const DriverRouteView = () => {
  const { driverId, routeId } = useParams();
  const [route, setRoute] = useState([]);
  const [routeMeta, setRouteMeta] = useState({ fromCoords: [], toCoords: [] });

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const res = await api.get(`/driver/${driverId}/${routeId}/route`);
        setRoute(res.data.route || []);
        setRouteMeta({
          fromCoords: res.data.fromCoords || [],
          toCoords: res.data.toCoords || [],
        });
      } catch (error) {
        console.error('Failed to fetch route:', error);
      }
    };

    fetchRoute();

    socket.emit('join-room', driverId);
    socket.on('location-update', (data) => {
      if (data.driverId === driverId && isValidLatLng(data.coords)) {
        setRoute((prev) => [...prev, data.coords]);
      }
    });

    return () => {
      socket.emit('leave-room', driverId);
      socket.off('location-update');
    };
  }, [driverId, routeId]);

  // Determine liveLocation and polyline points only if valid
  const liveLocation = route.length > 0 ? route[route.length - 1] : null;
  const hasValidLive = isValidLatLng(liveLocation);
  const hasValidFrom = isValidLatLng(routeMeta.fromCoords);
  const hasValidTo = isValidLatLng(routeMeta.toCoords);

  const polylinePoints =
    hasValidLive && hasValidFrom && hasValidTo
      ? [liveLocation, routeMeta.fromCoords, routeMeta.toCoords]
      : [];

  // Points to fit map bounds on (all valid markers)
  const allPoints = [];
  if (hasValidLive) allPoints.push(liveLocation);
  if (hasValidFrom) allPoints.push(routeMeta.fromCoords);
  if (hasValidTo) allPoints.push(routeMeta.toCoords);

  // Fallback center if no points at all
  const center = allPoints.length > 0 ? allPoints[0] : [0, 0];

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <h2 style={{ textAlign: 'center', margin: '10px 0' }}>Driver Route View</h2>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: 'calc(100% - 50px)', width: '100%' }}
        scrollWheelZoom={true}
      >
        <FitBounds points={allPoints} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Markers */}
        {hasValidLive && <Marker position={liveLocation} icon={redIcon} />}
        {hasValidFrom && <Marker position={routeMeta.fromCoords} icon={blueIcon} />}
        {hasValidTo && <Marker position={routeMeta.toCoords} icon={greenIcon} />}

        {/* Single polyline: live -> from -> to */}
        {polylinePoints.length === 3 && (
          <Polyline positions={polylinePoints} color="blue" />
        )}
      </MapContainer>
    </div>
  );
};

export default DriverRouteView;
