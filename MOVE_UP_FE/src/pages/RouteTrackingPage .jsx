import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useParams, useNavigate } from 'react-router-dom';
import socketIOClient from 'socket.io-client';

const socket = socketIOClient('https://mv-1-qyzm.onrender.com/');

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

const MapViewUpdater = ({ livePath }) => {
    const map = useMap();
    useEffect(() => {
        if (livePath.length > 0) {
            map.setView(livePath[livePath.length - 1], 13);
        }
    }, [livePath, map]);
    return null;
};

const RouteTrackingPage = () => {
    const { routeId } = useParams();
    const [user, setUser] = useState(null);
    const [route, setRoute] = useState(null);
    const [livePath, setLivePath] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, [navigate]);

    useEffect(() => {
        if (!user) return;
        const fetchRoute = async () => {
            try {
                const res = await fetch(`https://mv-1-qyzm.onrender.com/driver/${user._id}/${routeId}/route`);
                if (!res.ok) throw new Error('Route fetch failed');
                const data = await res.json();
                setRoute(data);
                if (data.route?.length) setLivePath(data.route);
            } catch (err) {
                alert('Failed to load route or unauthorized');
                navigate('/');
            }
        };
        fetchRoute();
    }, [routeId, user, navigate]);

    useEffect(() => {
    if (!user || !routeId) return;

    socket.emit('joinRoom', user._id);
    socket.emit('join-route', { routeId, driverId: user._id });

    // 📡 Request latest location from server
    socket.emit('get-latest-location', { driverId: user._id, routeId });

    let watchId = null;
    let lastCoords = null;

    const handleLocation = (position) => {
        const newCoords = [
            position.coords.latitude,
            position.coords.longitude,
        ];

        if (
            !lastCoords ||
            lastCoords[0] !== newCoords[0] ||
            lastCoords[1] !== newCoords[1]
        ) {
            lastCoords = newCoords;
            socket.emit('location-update', {
                driverId: user._id,
                routeId,
                coords: newCoords,
            });
        }
    };

    const geoError = (err) => {
        console.error('Location error:', err);
    };

    // Start watching for movement
    if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(handleLocation, geoError, {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 5000,
        });
    }

    // 🧠 Listen for updates, including immediate one
    socket.on('location-update', (update) => {
        if (update.routeId === routeId) {
            setLivePath((prev) => [...prev, update.coords]);
        }
    });

    return () => {
        navigator.geolocation.clearWatch(watchId);
        socket.emit('leave-route', { routeId, driverId: user._id });
        socket.off('location-update');
    };
}, [user, routeId]);


    if (!route) return <p>Loading route...</p>;

    const fullRoute = [
        ...livePath,
        ...(route.fromCoords ? [route.fromCoords] : []),
        ...(route.toCoords ? [route.toCoords] : []),
    ];

    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            <h2>Tracking Route from {route.from} to {route.to}</h2>
            <MapContainer center={fullRoute[0]} zoom={13} style={{ height: '90vh', width: '100%' }}>
                <MapViewUpdater livePath={livePath} />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {route.fromCoords && <Marker position={route.fromCoords} icon={blueIcon} />}
                {route.toCoords && <Marker position={route.toCoords} icon={greenIcon} />}
                {livePath.length > 0 && <Marker position={livePath[livePath.length - 1]} icon={redIcon} />}
                <Polyline positions={fullRoute} color="blue" />
            </MapContainer>
        </div>
    );
};

export default RouteTrackingPage;
