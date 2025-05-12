import React from 'react';
import AppRouter from './router/Router';
import { ServiceProvider } from './contexts/ServiceContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import ReservationPage from './app/booker/ReservationPage';

function App() {
  return (
    <ServiceProvider>
      <AppRouter />
      <ToastContainer position="bottom-right" autoClose={3000} />
    </ServiceProvider>
  );
}

export default App;
