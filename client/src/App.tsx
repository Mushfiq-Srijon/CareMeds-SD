import { Outlet, Route, Routes, Navigate } from 'react-router-dom';
import BaseLayout from './views/BaseLayout';
import Home from './views/Home';
import PharmacyDashboard from './pages/PharmacyDashboard';
import RiderPanel from './pages/RiderPanel';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import About from './pages/About';
import Help from './pages/Help';
import Checkout from './pages/Checkout';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MyOrders from './pages/MyOrders';
import MedicineDetail from './pages/MedicineDetail'; // ✅ Task 5

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { Toaster } from 'react-hot-toast';

import ProtectedRoute from './components/ProtectedRoute';

function RoleRoute({ role, children }: { role: string, children: JSX.Element }) {
  const userRole = localStorage.getItem("user_role");
  if (userRole !== role) return <Navigate to="/home" />;
  return children;
}

function App() {
  return (
    <>
      <Routes>
        <Route
          element={
            <BaseLayout>
              <Outlet />
            </BaseLayout>
          }
        >
          <Route path="/" element={<Landing />} />

          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />

          {/* ✅ Task 5 — Medicine Detail */}
          <Route path="/medicine/:id" element={<ProtectedRoute><MedicineDetail /></ProtectedRoute>} />

          <Route path="/pharmacy" element={<RoleRoute role="pharmacy"><PharmacyDashboard /></RoleRoute>} />
          <Route path="/rider" element={<RoleRoute role="rider"><RiderPanel /></RoleRoute>} />
        </Route>
      </Routes>

      <Toaster position="top-center" toastOptions={{ error: { duration: 5000 } }} />
    </>
  );
}

export default App;
