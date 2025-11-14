import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function OfferRedirect() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login with return URL
    navigate(`/login?redirect=/offers/${id}`);
  }, [id, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gabon-green"></div>
    </div>
  );
}