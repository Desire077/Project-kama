import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requireRole }) {
  const { token, user } = useSelector((state) => state.auth || {});
  if (!token) return <Navigate to="/login" replace />;
  if (requireRole && user?.role !== requireRole) return <Navigate to="/unauthorized" replace />;
  return children;
}