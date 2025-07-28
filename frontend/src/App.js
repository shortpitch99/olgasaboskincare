import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AIChat from './components/AIChat';

// Pages
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Consultation from './pages/Consultation';
import LashBrow from './pages/LashBrow';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';
import BookingPage from './pages/BookingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/admin/AdminDashboard';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding-top: 80px; // Account for fixed navbar
`;

function App() {
  return (
    <AppContainer>
      <Helmet>
        <title>Olga's Skincare - Professional Skincare Services & Products</title>
        <meta name="description" content="Transform your skin with Olga's professional skincare services and premium products. Book your appointment today!" />
      </Helmet>
      
      <Navbar />
      
      <MainContent>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/consultation" element={<Consultation />} />
          <Route path="/lash-brow" element={<LashBrow />} />
          <Route path="/products" element={<Products />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          
          {/* Booking Route - Now supports guest bookings */}
          <Route path="/booking" element={<BookingPage />} />
          
          {/* Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </MainContent>
      
      <Footer />
      
      {/* AI Chat Widget - appears on all pages */}
      <AIChat />
    </AppContainer>
  );
}

export default App; 