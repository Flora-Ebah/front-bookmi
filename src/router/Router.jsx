import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/landingpage/LandingPage';
import AuthPage from '../pages/auth/AuthPage';
import { ArtistDashboard, ArtistEvents, ArtistProfile, ArtistServices, ArtistReviews } from '../app/artist';
import EventDetail from '../app/artist/EventDetail';
import { 
  BookerDashboard, 
  BookerSearch, 
  BookerBookings, 
  ProfilArtistsBooker, 
  BookingDetail,
  BookerFavorites,
  BookerPayment
} from '../app/booker';
import ReservationPage from '../app/booker/ReservationPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { USER_ROLES } from '../services/config/constants';

const AppRouter = () => {
  return (
    <Routes>
      {/* Route principale pour la page d'accueil */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Routes d'authentification */}
      <Route path="/auth/*" element={<AuthPage />} />
      
      {/* Route pour la connexion */}
      <Route path="/connexion" element={<Navigate to="/auth/login" replace />} />
      
      {/* Routes de l'application artiste - protégées pour le rôle artiste */}
      <Route 
        path="/app/artist" 
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ARTIST]}>
            <ArtistDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/artist/events" 
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ARTIST]}>
            <ArtistEvents />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/artist/events/:id" 
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ARTIST]}>
            <EventDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/artist/profile" 
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ARTIST]}>
            <ArtistProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/artist/services" 
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ARTIST]}>
            <ArtistServices />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/artist/reviews" 
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ARTIST]}>
            <ArtistReviews />
          </ProtectedRoute>
        } 
      />
      
      {/* Routes de l'application booker - protégées pour le rôle booker */}
      <Route 
        path="/app/booker" 
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.BOOKER]}>
            <BookerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/booker/search" 
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.BOOKER]}>
            <BookerSearch />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/booker/artists/:artistId" 
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.BOOKER]}>
            <ProfilArtistsBooker />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/booker/reservation/:artistId/:serviceId" 
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.BOOKER]}>
            <ReservationPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/booker/bookings" 
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.BOOKER]}>
            <BookerBookings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/booker/booking/:id" 
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.BOOKER]}>
            <BookingDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/booker/favorites" 
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.BOOKER]}>
            <BookerFavorites />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/booker/payment" 
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.BOOKER]}>
            <BookerPayment />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/booker/messages" 
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.BOOKER]}>
            <Navigate to="/app/booker" replace />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/booker/reviews" 
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.BOOKER]}>
            <Navigate to="/app/booker/bookings" replace />
          </ProtectedRoute>
        } 
      />
      
      {/* Route pour gérer les erreurs 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter; 