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
import OAuthCallback from './pages/OAuthCallback';
import SelectRole from './pages/SelectRole';
import MyOrders from './pages/MyOrders';
import MedicineDetail from './pages/MedicineDetail';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';

function RoleRoute({ role, children }: { role: string, children: JSX.Element }) {
  const userRole = localStorage.getItem("user_role") || sessionStorage.getItem("user_role");
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
          {/* Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Home Page */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />

          {/* Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Google OAuth Pages (Sabikun) */}
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/select-role" element={<SelectRole />} />

          {/* Main Pages */}
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />

          {/* My Orders (Oni) */}
          <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />

          {/* Medicine Detail (Oni) */}
          <Route path="/medicine/:id" element={<ProtectedRoute><MedicineDetail /></ProtectedRoute>} />

          {/* Role Based Pages */}
          <Route path="/pharmacy" element={<RoleRoute role="pharmacy"><PharmacyDashboard /></RoleRoute>} />
          <Route path="/rider" element={<RoleRoute role="rider"><RiderPanel /></RoleRoute>} />
        </Route>
      </Routes>

      <Toaster
        position="top-center"
        toastOptions={{ error: { duration: 5000 } }}
      />
    </>
  );
}

export default App;