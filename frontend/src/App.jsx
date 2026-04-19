import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AddItem from './pages/AddItem';
import Rentals from './pages/Rentals';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import ItemDetail from './pages/ItemDetail';
import AdminDashboard from './pages/AdminDashboard';
import Messages from './pages/Messages';
import Verify from './pages/Verify';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return user && user.role === 'admin' ? children : <Navigate to="/" />;
};

function App() {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/add-item" element={<PrivateRoute><AddItem /></PrivateRoute>} />
        <Route path="/rentals" element={<PrivateRoute><Rentals /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
        <Route path="/item/:id" element={<PrivateRoute><ItemDetail /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
<Route path="/messages/:userId" element={<PrivateRoute><Messages /></PrivateRoute>} />
<Route path="/verify/:token" element={<Verify />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;