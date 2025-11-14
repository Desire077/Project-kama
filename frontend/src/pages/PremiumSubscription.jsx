import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AirtelPaymentForm from '../components/AirtelPaymentForm';

export default function PremiumSubscription() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const plans = {
    basic: {
      id: 'basic',
      name: 'Formule Basique',
      price: 5000,
      period: 'par mois',
      features: [
        'Publication limitée (5 annonces)',
        'Visibilité standard',
        'Support par email'
      ]
    },
    premium: {
      id: 'premium',
      name: 'Formule Premium',
      price: 15000,
      period: 'par mois',
      features: [
        'Publications illimitées',
        'Visibilité premium',
        'Promotion automatique',
        'Support prioritaire',
        'Analyses avancées',
        'Badge vendeur premium'
      ]
    }
  };

  const handlePaymentSuccess = (reference) => {
    // Redirect to payment status page
    navigate(`/payment-status/${reference}`);
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    // Optionally show an error message to the user
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Choisissez votre formule</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Débloquez des fonctionnalités premium pour maximiser votre visibilité et vos ventes
          </p>
        </div>

        {!showPaymentForm ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {Object.values(plans).map((plan) => (
                <div 
                  key={plan.id}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300 ${
                    selectedPlan === plan.id 
                      ? 'border-kama-gold ring-2 ring-kama-gold ring-opacity-50' 
                      : 'border-gray-200 hover:border-kama-vert'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                        <div className="mt-2">
                          <span className="text-3xl font-bold text-kama-vert">{plan.price}</span>
                          <span className="text-gray-600"> FCFA {plan.period}</span>
                        </div>
                      </div>
                      {selectedPlan === plan.id && (
                        <div className="bg-kama-gold text-white rounded-full p-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => setShowPaymentForm(true)}
                      className={`w-full py-3 px-4 rounded-lg font-bold transition-all ${
                        selectedPlan === plan.id
                          ? 'bg-gradient-to-r from-kama-vert to-kama-gold text-white hover:from-kama-vert hover:to-kama-gold hover:opacity-90'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      Choisir {plan.name}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-white rounded-2xl shadow-lg p-6 max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Avantages du boost d'annonce</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-kama-gold bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-kama-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Visibilité accrue</h3>
                  <p className="text-gray-600 text-sm">Votre annonce apparaît en tête de liste et est mise en avant</p>
                </div>
                <div className="text-center">
                  <div className="bg-kama-gold bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-kama-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Plus de vues</h3>
                  <p className="text-gray-600 text-sm">Jusqu'à 5x plus de vues que les annonces standards</p>
                </div>
                <div className="text-center">
                  <div className="bg-kama-gold bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-kama-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Meilleures ventes</h3>
                  <p className="text-gray-600 text-sm">3x plus de chances d'être contacté par des acheteurs</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <button
                onClick={() => setShowPaymentForm(false)}
                className="flex items-center text-kama-vert hover:text-kama-vert-dark"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Retour
              </button>
              <h2 className="text-2xl font-bold text-gray-800 ml-4">Paiement Airtel Money</h2>
            </div>
            
            <AirtelPaymentForm
              amount={plans[selectedPlan].price}
              planId={selectedPlan}
              userId={user?.id || user?._id}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        )}
      </div>
    </div>
  );
}