import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import socketIOClient from 'socket.io-client';

const socket = socketIOClient('http://localhost:5000');

const DriverPage = () => {
  const [user, setUser] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      socket.emit('joinRoom', parsedUser._id);
      fetchRoutes(parsedUser._id);
    } else {
      navigate('/login');
    }
  }, []);

  const fetchRoutes = async (driverId) => {
    try {
      const res = await api.get(`/driver/driver/${driverId}`);
      setRoutes(res.data);
    } catch (err) {
      console.error('Error fetching routes:', err);
    }
  };

  const geocode = async (location) => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`);
    const data = await res.json();
    return data[0] ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null;
  };

  const handleCreateRoute = async () => {
    if (!from || !to) return alert('Both "From" and "To" fields are required');

    const fromCoords = await geocode(from);
    const toCoords = await geocode(to);

    if (!fromCoords || !toCoords) {
      alert('Invalid location entered. Please try again.');
      return;
    }

    socket.emit('start-route', {
      driverId: user._id,
      from,
      to,
      fromCoords,
      toCoords
    });

    // Wait a moment to let backend save the new route, then refresh
    setTimeout(() => fetchRoutes(user._id), 1000);
    setFrom('');
    setTo('');
  };

  const handleContinue = (routeId) => {
    navigate(`/driver/route/${routeId}`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>My Routes</h2>

      {routes.length === 0 ? (
        <p>No routes assigned yet.</p>
      ) : (
        <ul>
          {routes.map(route => (
            <li key={route._id} style={{ marginBottom: 10 }}>
              <div>
                <strong>From:</strong> {route.from}<br />
                <strong>To:</strong> {route.to}<br />
                <button onClick={() => handleContinue(route._id)}>Continue</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <hr />
      <h3>Create New Route</h3>
      <input
        type="text"
        placeholder="From (e.g., Delhi)"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        style={{ marginRight: 10 }}
      />
      <input
        type="text"
        placeholder="To (e.g., Mumbai)"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        style={{ marginRight: 10 }}
      />
      <button onClick={handleCreateRoute}>Create Route</button>
    </div>
  );
};

export default DriverPage;
