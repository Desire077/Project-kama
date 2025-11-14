// components/PaymentPanel.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentPanel = ({ user, onSubscriptionUpdate }) => {
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const plans = {
    basic: {
      id: 'basic',
      name: 'Formule Basique',
      price: 5000,
      features: ['Publication limitée', 'Visibilité standard']
    },
    premium: {
      id: 'premium',
      name: 'Formule Premium',
      price: 15000,
      features: ['Publications illimitées', 'Visibilité premium', 'Promotion automatique']
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/subscriptions/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          planId: selectedPlan,
          method: paymentMethod
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création de la session de paiement');
      }

      // Handle the response based on payment method
      if (paymentMethod === 'stripe' && data.paymentUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.paymentUrl;
      } else if (paymentMethod === 'airtel' && data.reference) {
        // Show Airtel payment instructions
        alert(`Veuillez effectuer un paiement de ${data.plan.price} XAF au ${data.reference} via Airtel Money.`);
        // In a real implementation, you would show a modal with payment instructions
        // and possibly poll for payment confirmation
      }
      
      // Optionally, call onSubscriptionUpdate to refresh user data
      if (onSubscriptionUpdate) {
        onSubscriptionUpdate();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user?.subscription?.active) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-kama-vert mb-4">Votre Abonnement</h2>
        <div className="bg-kama-gold bg-opacity-10 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-kama-vert">
                {plans[user.subscription.plan]?.name || 'Formule Inconnue'}
              </h3>
              <p className="text-gray-600">
                Actif jusqu'au {new Date(user.subscription.expiresAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="bg-kama-gold text-white px-3 py-1 rounded-full text-sm font-medium">
              Actif
            </div>
          </div>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full bg-kama-vert text-white py-2 rounded-lg hover:bg-opacity-90 transition"
        >
          Accéder aux fonctionnalités premium
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-kama-vert mb-4">Choisissez votre formule</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Object.values(plans).map((plan) => (
          <div 
            key={plan.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedPlan === plan.id 
                ? 'border-kama-gold bg-kama-gold bg-opacity-10' 
                : 'border-gray-200 hover:border-kama-vert'
            }`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-kama-vert">{plan.name}</h3>
                <p className="text-2xl font-bold text-kama-gold">{plan.price} XAF</p>
                <p className="text-gray-500 text-sm">par mois</p>
              </div>
              {selectedPlan === plan.id && (
                <div className="bg-kama-gold text-white rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <ul className="mt-4 space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kama-gold mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-2">Méthode de paiement</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            className={`border rounded-lg p-3 flex items-center justify-center ${
              paymentMethod === 'stripe' 
                ? 'border-kama-vert bg-kama-vert bg-opacity-10' 
                : 'border-gray-200 hover:border-kama-vert'
            }`}
            onClick={() => setPaymentMethod('stripe')}
          >
            <span className="font-medium">Carte bancaire (Stripe)</span>
          </button>
          <button
            className={`border rounded-lg p-3 flex items-center justify-center ${
              paymentMethod === 'airtel' 
                ? 'border-kama-vert bg-kama-vert bg-opacity-10' 
                : 'border-gray-200 hover:border-kama-vert'
            }`}
            onClick={() => setPaymentMethod('airtel')}
          >
            <span className="font-medium">Airtel Money</span>
          </button>
        </div>
      </div>
      
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-kama-vert text-white py-3 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
      >
        {loading ? 'Traitement...' : `Payer ${plans[selectedPlan].price} XAF`}
      </button>
    </div>
  );
};

export default PaymentPanel;