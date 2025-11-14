// pages/PaymentCancelled.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-kama-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-kama-vert mb-2">Paiement annulé</h1>
        <p className="text-gray-600 mb-6">
          Votre paiement a été annulé. Vous pouvez réessayer lorsque vous êtes prêt.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-kama-vert text-white py-2 rounded-lg hover:bg-opacity-90 transition"
        >
          Retour au tableau de bord
        </button>
      </div>
    </div>
  );
};

export default PaymentCancelled;