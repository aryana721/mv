import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
  const [drivers, setDrivers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await api.get('/vendor/drivers');
        setDrivers(res.data);
      } catch (error) {
        console.error('Error fetching drivers:', error);
      }
    };
    fetchDrivers();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard</h2>
      {drivers.map(driver => (
        <div key={driver._id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '15px' }}>
          <h3>{driver.name} ({driver.email})</h3>
          <h4>Routes:</h4>
          {driver.routes.length > 0 ? (
            <ul>
              {driver.routes.map(route => (
                <li key={route._id} style={{ marginBottom: '8px' }}>
                  <strong>From:</strong> {route.from} &nbsp;
                  <strong>To:</strong> {route.to} &nbsp;
                  <button
                    style={{ marginLeft: '10px' }}
                    onClick={() => navigate(`/route/${route._id}/${driver._id}`)}
                  >
                    View Route
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No routes assigned</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
