import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/authClient';
import { setUser, setToken } from '../store/slices/authSlice';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client',
    whatsapp: '' // Ajout du champ WhatsApp
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Calculate password strength
    if (name === 'password') {
      let strength = 0;
      if (value.length >= 8) strength += 25;
      if (/[A-Z]/.test(value)) strength += 25;
      if (/[0-9]/.test(value)) strength += 25;
      if (/[^A-Za-z0-9]/.test(value)) strength += 25;
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await register(formData);
      // Dispatch both setUser and setToken actions
      dispatch(setUser(response.user));
      dispatch(setToken(response.token));
      // Redirect based on role
      if (response.user.role === 'vendeur') {
        navigate('/dashboard/seller');
      } else if (response.user.role === 'admin') {
        navigate('/dashboard/admin/properties');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  // Function to get password strength label
  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 50) return { label: 'Faible', color: 'bg-red-500' };
    if (passwordStrength < 75) return { label: 'Moyen', color: 'bg-yellow-500' };
    return { label: 'Fort', color: 'bg-green-500' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gabon-beige to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 gabon-card rounded-2xl shadow-xl p-8">
        <div>
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-gabon-green to-dark-forest flex items-center justify-center">
            <span className="text-white text-2xl font-bold">K</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créer un compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Rejoignez la plateforme Kama
          </p>
          
          {/* Social Proof Element */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center bg-gabon-green bg-opacity-10 text-gabon-green px-3 py-1 rounded-full text-sm">
              <i className="fas fa-users mr-1"></i>
              <span>Rejoint par 12,000+ utilisateurs</span>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-exclamation-circle text-red-500"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="hover-glow">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Prénom *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition"
                placeholder="Votre prénom"
              />
            </div>
            
            <div className="hover-glow">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Nom *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition"
                placeholder="Votre nom"
              />
            </div>
          </div>
          
          <div className="hover-glow">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition"
              placeholder="votre@email.com"
            />
            
            {/* Authority Element */}
            <div className="mt-1 text-xs text-gray-500 flex items-center">
              <i className="fas fa-shield-alt text-gabon-green mr-1"></i>
              Votre email ne sera jamais partagé
            </div>
          </div>
          
          <div className="hover-glow">
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
              Numéro WhatsApp
            </label>
            <input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              value={formData.whatsapp}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition"
              placeholder="+241 XX XX XX XX"
            />
            <p className="mt-1 text-sm text-gray-500">
              Ce numéro sera utilisé pour les contacts entre acheteurs et vendeurs
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="hover-glow">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition"
                placeholder="••••••••"
              />
              
              {/* Engagement Element - Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Force du mot de passe</span>
                    <span>{getPasswordStrengthLabel().label}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getPasswordStrengthLabel().color}`} 
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Utilisez au moins 8 caractères avec des lettres, chiffres et symboles
                  </div>
                </div>
              )}
            </div>
            
            <div className="hover-glow">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div className="hover-glow">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Je souhaite *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'client' })}
                className={`px-4 py-3 border rounded-lg text-center transition-all ${
                  formData.role === 'client' 
                    ? 'border-gabon-green bg-gabon-green bg-opacity-10 text-gabon-green' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <i className="fas fa-search-location text-xl mb-1"></i>
                <div className="font-medium">Acheter</div>
                <div className="text-xs text-gray-500">Trouver un bien</div>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'vendeur' })}
                className={`px-4 py-3 border rounded-lg text-center transition-all ${
                  formData.role === 'vendeur' 
                    ? 'border-gabon-green bg-gabon-green bg-opacity-10 text-gabon-green' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <i className="fas fa-home text-xl mb-1"></i>
                <div className="font-medium">Vendre</div>
                <div className="text-xs text-gray-500">Publier une annonce</div>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'client' })}
                className={`px-4 py-3 border rounded-lg text-center transition-all ${
                  formData.role === 'client' 
                    ? 'border-gabon-green bg-gabon-green bg-opacity-10 text-gabon-green' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <i className="fas fa-key text-xl mb-1"></i>
                <div className="font-medium">Louer</div>
                <div className="text-xs text-gray-500">Trouver un logement</div>
              </button>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-gabon-green focus:ring-gabon-green border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              J'accepte les <a href="/cgu" className="text-gabon-green hover:text-dark-forest">Conditions Générales d'Utilisation</a>
            </label>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full gabon-btn-primary py-3 rounded-lg font-bold disabled:opacity-50 shadow-lg hover-glow"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i> Inscription en cours...
                </span>
              ) : (
                'Créer un compte'
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="font-medium text-gabon-green hover:text-dark-forest">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}