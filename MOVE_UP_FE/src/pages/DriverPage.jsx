import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import socketIOClient from 'socket.io-client';
import api from '../services/api';

const socket = socketIOClient('http://localhost:5000');

const DriverPage = () => {
  const [tracking, setTracking] = useState(false);
  const [route, setRoute] = useState([]);
  const [coords, setCoords] = useState({ from: '', to: '' });

  const user = JSON.parse(localStorage.getItem('user'));

  const geocode = async location => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`);
    const data = await res.json();
    return data[0] ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null;
  };

  const startRoute = async () => {
    if (!coords.from || !coords.to) return alert('Enter from/to');

    const fromCoords = await geocode(coords.from);
    const toCoords = await geocode(coords.to);
    console.log(fromCoords, toCoords);
    if (!fromCoords || !toCoords) return alert('Invalid location(s)');

    socket.emit('start-route', {
      driverId: user._id,
      from: coords.from,
      to: coords.to,
      fromCoords,
      toCoords
    });

    setTracking(true);

    navigator.geolocation.watchPosition(pos => {
      const latLng = [pos.coords.latitude, pos.coords.longitude];
      setRoute(prev => [...prev, latLng]);
      socket.emit('location-update', {
        driverId: user._id,
        coords: latLng,
      });
    });
  };

  return (
    <div>
      <h2>Driver Page</h2>
      {!tracking && (
        <div>
          <input
            placeholder="From (e.g., Delhi)"
            onChange={e => setCoords({ ...coords, from: e.target.value })}
          />
          <input
            placeholder="To (e.g., Mumbai)"
            onChange={e => setCoords({ ...coords, to: e.target.value })}
          />
          <button onClick={startRoute}>Start Route</button>
        </div>
      )}
      {tracking && (
        <MapContainer center={route[0] || [0, 0]} zoom={13} style={{ height: '400px' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Polyline positions={route} color="green" />
          {route.length > 0 && <Marker position={route[route.length - 1]} />} 
        </MapContainer>
      )}
    </div>
  );
};

export default DriverPage;