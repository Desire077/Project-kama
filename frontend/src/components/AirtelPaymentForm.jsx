// components/AirtelPaymentForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import airtelClient from '../api/airtelClient';

const AirtelPaymentForm = ({ amount, planId, userId, onSuccess, onError }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validatePhone = (phone) => {
    // Gabon phone number validation
    const gabonPhoneRegex = /^(\+241|241)?(0?[2-7]\d{6})$/;
    return gabonPhoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    if (!validatePhone(phone)) {
      setError('Veuillez entrer un numéro de téléphone Gabonais valide (+241XXXXXXXX)');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const data = await airtelClient.initiateAirtelPayment({
        phone,
        amount,
        userId,
        planId
      });
      
      // On success, call the onSuccess callback or navigate to payment status page
      if (onSuccess) {
        onSuccess(data.reference);
      } else {
        navigate(`/payment-status/${data.reference}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
      if (onError) {
        onError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Paiement par Airtel Money</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Numéro de téléphone Airtel Money
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+241XXXXXXXX"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kama-vert focus:border-kama-vert"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Entrez votre numéro de téléphone Airtel Money Gabonais
          </p>
        </div>
        
        <div className="bg-kama-bg rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Montant à payer:</span>
            <span className="text-xl font-bold text-kama-vert">{amount} FCFA</span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Plan: {planId === 'premium' ? 'Premium' : 'Basique'}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Traitement...
            </span>
          ) : (
            'Payer avec Airtel Money'
          )}
        </button>
      </form>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Instructions:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Assurez-vous d'avoir suffisamment de fonds sur votre compte Airtel Money</li>
          <li>• Vous recevrez une demande de confirmation sur votre téléphone</li>
          <li>• Entrez votre code PIN pour confirmer le paiement</li>
          <li>• Le processus est instantané mais peut prendre jusqu'à 3 minutes</li>
        </ul>
      </div>
    </div>
  );
};

export default AirtelPaymentForm;