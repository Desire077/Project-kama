import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearAuth } from '../store/slices/authSlice';
import authClient from '../api/authClient';

export default function Logout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call the logout API endpoint to clear the refresh token cookie
        await authClient.logout();
      } catch (error) {
        console.error('Error during logout API call:', error);
      } finally {
        // Clear the authentication state in Redux
        dispatch(clearAuth());
        
        // Redirect to the home page
        navigate('/');
      }
    };

    performLogout();
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Déconnexion en cours...</p>
      </div>
    </div>
  );
}