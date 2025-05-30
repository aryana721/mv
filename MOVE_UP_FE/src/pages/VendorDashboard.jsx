import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const VendorDashboard = () => {
  const [drivers, setDrivers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDrivers = async () => {
      const res = await api.get('/vendor/drivers');
      setDrivers(res.data);
    };
    fetchDrivers();
  }, []);

  return (
    <div>
      <h2>Vendor Dashboard</h2>
      {drivers.map(driver => (
        <div key={driver._id}>
          <p>{driver.name} ({driver.email})</p>
          <button onClick={() => navigate(`/route/${driver._id}`)}>View Route</button>
        </div>
      ))}
    </div>
  );
};

export default VendorDashboard;