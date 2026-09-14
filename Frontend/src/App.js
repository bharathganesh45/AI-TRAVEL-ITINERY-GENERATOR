import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/Authcontext';

import Navbar from './components/Navbar';
import DashboardLayout from './components/DashboardLayout';
import Footer from './components/Footer';
import ProtectedRoute from './components/Productedroute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Trips from './pages/Trip';
import TripDetails from './pages/Tripdetails';
import AIResult from './pages/AiResult';
import SharedTrip from './pages/SharedTrip';
import Profile from './pages/Profile';
import NotFound from './pages/Notfound';

const ProtectedPage = ({ children }) => (
  <ProtectedRoute>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
          <Navbar />

          <div className="flex-1 flex max-w-7xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/share/:token" element={<SharedTrip />} />

              <Route path="/dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
              <Route path="/upload" element={<ProtectedPage><Upload /></ProtectedPage>} />
              <Route path="/trips" element={<ProtectedPage><Trips /></ProtectedPage>} />
              <Route path="/trips/:id" element={<ProtectedPage><TripDetails /></ProtectedPage>} />
              <Route path="/ai-result" element={<ProtectedPage><AIResult /></ProtectedPage>} />
              <Route path="/profile" element={<ProtectedPage><Profile /></ProtectedPage>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
