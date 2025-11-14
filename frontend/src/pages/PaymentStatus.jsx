// pages/PaymentStatus.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import airtelClient from '../api/airtelClient';

const PaymentStatus = () => {
  const { reference } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking');
  const [paymentData, setPaymentData] = useState(null);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!reference) {
      navigate('/premium');
      return;
    }

    // Function to check payment status
    const checkStatus = async () => {
      try {
        const data = await airtelClient.checkAirtelPaymentStatus(reference);
        
        setPaymentData(data.status);
        
        if (data.status.status === 'confirmed') {
          setStatus('success');
        } else if (data.status.status === 'failed') {
          setStatus('failed');
        } else {
          setStatus('pending');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('error');
      }
    };

    // Check status immediately
    checkStatus();

    // Set up polling every 5 seconds
    const interval = setInterval(checkStatus, 5000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [reference, navigate]);

  // Countdown timer for auto-refresh
  useEffect(() => {
    if (status === 'pending' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdown(30); // Reset countdown
    }
  }, [countdown, status]);

  // Auto-redirect to dashboard on success
  useEffect(() => {
    if (status === 'success') {
      // Wait 3 seconds then redirect
      const redirectTimer = setTimeout(() => {
        navigate('/dashboard/seller');
      }, 3000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [status, navigate]);

  const handleRetry = () => {
    navigate('/premium');
  };

  const handleCheckAgain = () => {
    setCountdown(30);
    // Force a status check
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {status === 'checking' && (
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Vérification du paiement</h1>
            <p className="text-gray-600">
              Nous vérifions l'état de votre paiement. Veuillez patienter...
            </p>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Paiement en attente</h1>
            <p className="text-gray-600 mb-6">
              Votre paiement est en cours de traitement. Veuillez confirmer sur votre téléphone Airtel Money.
            </p>
            
            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-700">
                Prochaine vérification dans {countdown} secondes
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleCheckAgain}
                className="w-full bg-kama-vert text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition"
              >
                Vérifier maintenant
              </button>
              <button
                onClick={handleRetry}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Annuler et réessayer
              </button>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Paiement réussi !</h1>
            <p className="text-gray-600 mb-6">
              Votre abonnement premium a été activé avec succès.
            </p>
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <p className="text-green-700">
                Redirection vers votre tableau de bord dans 3 secondes...
              </p>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Paiement échoué</h1>
            <p className="text-gray-600 mb-6">
              Votre paiement n'a pas abouti. Veuillez réessayer.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-kama-vert text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition"
              >
                Réessayer le paiement
              </button>
              <button
                onClick={() => navigate('/dashboard/seller')}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Retour au tableau de bord
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Erreur de vérification</h1>
            <p className="text-gray-600 mb-6">
              Une erreur s'est produite lors de la vérification de votre paiement.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleCheckAgain}
                className="w-full bg-kama-vert text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition"
              >
                Réessayer
              </button>
              <button
                onClick={() => navigate('/dashboard/seller')}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Retour au tableau de bord
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;