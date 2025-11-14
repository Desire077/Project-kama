import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearAuth } from '../store/slices/authSlice';
import api from '../api/api';

export default function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Call logout endpoint
    api.post('/auth/logout')
      .then(() => {
        // Clear auth state
        dispatch(clearAuth());
        // Redirect to home
        navigate('/');
      })
      .catch((error) => {
        console.error('Logout error:', error);
        // Even if server logout fails, clear local state
        dispatch(clearAuth());
        navigate('/');
      });
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Déconnexion en cours...</p>
      </div>
    </div>
  );
}