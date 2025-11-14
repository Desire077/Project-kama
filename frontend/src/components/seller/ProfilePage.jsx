import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/authSlice';
import userClient from '../../api/userClient';

export default function ProfilePage() {
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    firstName: auth.user?.firstName || '',
    lastName: auth.user?.lastName || '',
    email: auth.user?.email || '',
    phone: auth.user?.phone || '',
    whatsapp: auth.user?.whatsapp || '',
    description: auth.user?.description || '',
    company: auth.user?.company || '',
    website: auth.user?.website || ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Update profile data
      const response = await userClient.updateProfile(formData);
      const updatedUser = response.data?.user || response.user;
      
      // Update user in Redux store
      dispatch(setUser(updatedUser));
      
      setSuccess('Profil mis à jour avec succès');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    // In a real implementation, this would save user settings
    setSuccess('Paramètres enregistrés avec succès');
    setTimeout(() => setSuccess(''), 3000);
  };

  if (!auth.user) {
    return (
      <div className="min-h-screen bg-kama-bg flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-kama-vert mb-4">Connectez-vous pour accéder à votre profil</h1>
          <button 
            onClick={() => navigate('/login')}
            className="premium-btn-primary px-6 py-3 rounded-lg font-medium"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-poppins font-semibold text-kama-vert">
          Mon profil
        </h1>
        <p className="text-kama-muted">Gérez vos informations personnelles et vos préférences</p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 animate-fadeIn">
          {success}
        </div>
      )}

      {/* Profile Header */}
      <section className="bg-white rounded-2xl p-6 shadow-soft mb-6">
        <div className="flex flex-col md:flex-row items-center">
          <div className="relative mb-4 md:mb-0 md:mr-6">
            <div className="w-24 h-24 rounded-full bg-primary-dark flex items-center justify-center text-white text-2xl font-bold">
              {auth.user?.firstName?.charAt(0) || auth.user?.email?.charAt(0) || 'U'}
            </div>
            <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer">
              <i className="fas fa-camera text-kama-vert"></i>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold text-kama-text">
              {auth.user?.firstName} {auth.user?.lastName}
            </h2>
            <p className="text-kama-muted">Vendeur vérifié</p>
            <p className="text-sm text-kama-muted mt-1">
              Membre depuis {new Date(auth.user?.createdAt || Date.now()).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long'
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-3 px-6 font-medium ${
            activeTab === 'profile'
              ? 'border-b-2 border-primary-dark text-primary-dark'
              : 'text-kama-muted hover:text-primary-dark'
          }`}
          onClick={() => setActiveTab('profile')}
        >
          Informations personnelles
        </button>
        <button
          className={`py-3 px-6 font-medium ${
            activeTab === 'settings'
              ? 'border-b-2 border-primary-dark text-primary-dark'
              : 'text-kama-muted hover:text-primary-dark'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          Paramètres
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <section className="bg-white rounded-2xl p-6 shadow-soft">
          <h2 className="font-poppins font-semibold text-lg text-kama-vert mb-6">Informations personnelles</h2>
          
          <form onSubmit={handleSubmitProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-kama-muted mb-2">Prénom</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-dark font-medium"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-kama-muted mb-2">Nom</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-dark font-medium"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-kama-muted mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-dark font-medium"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-kama-muted mb-2">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-dark font-medium"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-kama-muted mb-2">WhatsApp</label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-dark font-medium"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-kama-muted mb-2">Entreprise</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-dark font-medium"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-kama-muted mb-2">Site web</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://votresite.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-dark font-medium"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-kama-muted mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Parlez-nous de vous, de votre expérience dans l'immobilier..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-dark font-medium"
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-primary-dark to-[#00BFA6] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Enregistrement...
                  </>
                ) : (
                  'Enregistrer les modifications'
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <section className="bg-white rounded-2xl p-6 shadow-soft">
          <h2 className="font-poppins font-semibold text-lg text-kama-vert mb-6">Paramètres du compte</h2>
          
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="font-medium text-kama-text mb-4">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-kama-text">Notifications par email</h4>
                      <p className="text-sm text-kama-muted">Recevoir des notifications par email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-dark"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-kama-text">Notifications SMS</h4>
                      <p className="text-sm text-kama-muted">Recevoir des notifications par SMS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-dark"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="font-medium text-kama-text mb-4">Sécurité</h3>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-kama-text mb-2">Changer le mot de passe</h4>
                    <button
                      type="button"
                      onClick={() => navigate('/change-password')}
                      className="text-primary-dark hover:underline"
                    >
                      Modifier le mot de passe
                    </button>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-kama-text mb-2">Authentification à deux facteurs</h4>
                    <p className="text-sm text-kama-muted mb-3">Ajoutez une couche de sécurité supplémentaire à votre compte</p>
                    <button
                      type="button"
                      className="bg-gray-100 text-kama-text px-4 py-2 rounded-lg font-medium"
                    >
                      Activer l'authentification
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="font-medium text-kama-text mb-4">Zone de danger</h3>
                <div className="p-4 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-600 mb-2">Supprimer le compte</h4>
                  <p className="text-sm text-kama-muted mb-3">Supprimer définitivement votre compte et toutes vos données</p>
                  <button
                    type="button"
                    className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium"
                  >
                    Supprimer mon compte
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-gradient-to-r from-primary-dark to-[#00BFA6] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Enregistrer les paramètres
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}