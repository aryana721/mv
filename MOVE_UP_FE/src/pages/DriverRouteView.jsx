import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import socketIOClient from 'socket.io-client';
import api from '../services/api';

const socket = socketIOClient('http://localhost:5000');

const DriverRouteView = () => {
  const { driverId } = useParams();
  const [route, setRoute] = useState([]);
  const [routeMeta, setRouteMeta] = useState({ fromCoords: null, toCoords: null });

  useEffect(() => {
    const fetchRoute = async () => {
      const res = await api.get(`/driver/${driverId}/route`);
      setRoute(res.data.route);
      setRouteMeta({
        fromCoords: res.data.fromCoords,
        toCoords: res.data.toCoords
      });
    };
    fetchRoute();

    socket.emit('join-room', driverId);
    socket.on('location-update', data => {
      if (data.driverId === driverId) {
        setRoute(prev => [...prev, data.coords]);
      }
    });

    return () => {
      socket.emit('leave-room', driverId);
      socket.off('location-update');
    };
  }, [driverId]);

  return (
    <div>
      <h2>Driver Route View</h2>
      <MapContainer center={route[0] || [0, 0]} zoom={13} style={{ height: '400px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={route} color="blue" />
        {route.length > 0 && <Marker position={route[route.length - 1]} />} 
        {routeMeta.fromCoords && <Marker position={routeMeta.fromCoords} />} 
        {routeMeta.toCoords && <Marker position={routeMeta.toCoords} />} 
      </MapContainer>
    </div>
  );
};

export default DriverRouteView;