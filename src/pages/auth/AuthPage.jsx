import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import RegisterBookerForm from '../../components/auth/RegisterBookerForm';
import RegisterArtistForm from '../../components/auth/RegisterArtistForm';
import VerifyAccountForm from '../../components/auth/VerifyAccountForm';

const AuthPage = () => {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="w-full max-w-md">
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/register-booker" element={<RegisterBookerForm />} />
          <Route path="/register-artist" element={<RegisterArtistForm />} />
          <Route path="/verify" element={<VerifyAccountForm />} />
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default AuthPage; 