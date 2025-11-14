import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile } from '../store/slices/authSlice';

export default function PremiumSuccess() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Refresh user profile to get updated subscription status
    dispatch(fetchUserProfile());
    
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard/seller');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-kama-bg to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-kama-lg p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-kama-vert mb-2 font-poppins">Félicitations !</h1>
        <p className="text-gray-600 mb-6 font-inter">
          Votre abonnement premium a été activé avec succès. Vous avez maintenant accès à toutes les fonctionnalités premium.
        </p>
        
        <div className="bg-gradient-to-r from-kama-vert to-kama-gold bg-opacity-10 rounded-xl p-4 mb-6">
          <h2 className="font-bold text-kama-vert mb-2 font-poppins">Avantages débloqués</h2>
          <ul className="text-left text-gray-700 space-y-2 font-inter">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kama-gold mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Publications illimitées</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kama-gold mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Visibilité premium sur toutes vos annonces</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kama-gold mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Analyses avancées et statistiques</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kama-gold mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Support prioritaire</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-kama-gold bg-opacity-10 rounded-lg p-4 mb-6">
          <p className="text-kama-vert font-medium font-inter">
            Redirection vers votre tableau de bord dans {countdown} secondes...
          </p>
        </div>
        
        <button
          onClick={() => navigate('/dashboard/seller')}
          className="w-full bg-gradient-to-r from-kama-vert to-kama-gold text-white py-3 rounded-lg font-semibold hover:from-kama-vert hover:to-kama-gold hover:opacity-90 transition-all duration-300 font-poppins"
        >
          Accéder au tableau de bord
        </button>
      </div>
    </div>
  );
}