// pages/PaymentSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-kama-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-kama-vert mb-2">Paiement réussi !</h1>
        <p className="text-gray-600 mb-6">
          Votre abonnement a été activé avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités premium.
        </p>
        <div className="bg-kama-gold bg-opacity-10 rounded-lg p-4 mb-6">
          <p className="text-kama-vert font-medium">
            Redirection vers votre tableau de bord dans {countdown} secondes...
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-kama-vert text-white py-2 rounded-lg hover:bg-opacity-90 transition"
        >
          Accéder au tableau de bord
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;