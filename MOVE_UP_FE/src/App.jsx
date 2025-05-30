
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import VendorDashboard from './pages/VendorDashboard';
import DriverPage from './pages/DriverPage';
import DriverRouteView from './pages/DriverRouteView';

function App() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/admin"
        element={user?.role === 'Admin' ? <AdminDashboard /> : <Navigate to="/" />}
      />
      <Route
        path="/vendor"
        element={user?.role === 'Vendor' ? <VendorDashboard /> : <Navigate to="/" />}
      />
      <Route
        path="/driver"
        element={user?.role === 'Driver' ? <DriverPage /> : <Navigate to="/" />}
      />
      <Route
        path="/route/:driverId"
        element={<DriverRouteView />}
      />
    </Routes>
  );
}

export default App;