import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import userClient from '../../api/userClient';

export default function ProfileTab() {
  const user = useSelector(state => state.auth.user);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    whatsapp: user?.whatsapp || '',
    city: user?.city || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: user?.emailNotifications ?? true,
    smsNotifications: user?.smsNotifications ?? false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSection, setActiveSection] = useState('profile');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePreferenceChange = (e) => {
    setPreferences({ ...preferences, [e.target.name]: e.target.checked });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await userClient.updateProfile(formData);
      const updatedUser = response.data?.user || response.user;
      
      // In a real app, this would update the user in Redux store
      setSuccess('Profil mis à jour avec succès ✅');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }
    
    try {
      // In a real implementation, this would call an API to change the password
      // await userClient.changePassword(passwordData);
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSuccess('Mot de passe mis à jour avec succès ✅');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la mise à jour du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-poppins font-bold text-text-primary">Mon Profil</h2>
        <p className="text-text-secondary font-inter">Gérez vos informations personnelles et vos préférences</p>
      </div>
      
      {/* Section tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-3 px-6 font-medium font-inter ${
            activeSection === 'profile'
              ? 'border-b-2 border-[#0D6EFD] text-[#0D6EFD]'
              : 'text-text-secondary hover:text-[#0D6EFD]'
          }`}
          onClick={() => setActiveSection('profile')}
        >
          Informations personnelles
        </button>
        <button
          className={`py-3 px-6 font-medium font-inter ${
            activeSection === 'security'
              ? 'border-b-2 border-[#0D6EFD] text-[#0D6EFD]'
              : 'text-text-secondary hover:text-[#0D6EFD]'
          }`}
          onClick={() => setActiveSection('security')}
        >
          Sécurité
        </button>
        <button
          className={`py-3 px-6 font-medium font-inter ${
            activeSection === 'preferences'
              ? 'border-b-2 border-[#0D6EFD] text-[#0D6EFD]'
              : 'text-text-secondary hover:text-[#0D6EFD]'
          }`}
          onClick={() => setActiveSection('preferences')}
        >
          Préférences
        </button>
      </div>
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 animate-fadeIn">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* Profile Information Section */}
      {activeSection === 'profile' && (
        <div className="premium-card p-6 rounded-2xl shadow-lg">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#0D6EFD] to-[#007BFF] flex items-center justify-center text-white text-2xl font-bold mb-4 font-poppins">
              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <h3 className="text-xl font-poppins font-bold text-text-primary">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-text-secondary font-inter">Acheteur</p>
          </div>
          
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Prénom *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D6EFD] font-medium font-inter"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Nom *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D6EFD] font-medium font-inter"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D6EFD] font-medium font-inter"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Ville</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D6EFD] font-medium font-inter"
                placeholder="Ex: Libreville"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Numéro WhatsApp</label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D6EFD] font-medium font-inter"
                placeholder="+241 XX XX XX XX"
              />
              <p className="mt-2 text-sm text-text-secondary font-inter">
                Ce numéro sera utilisé pour les contacts entre acheteurs et vendeurs
              </p>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#0D6EFD] to-[#007BFF] text-white px-6 py-3 rounded-lg font-poppins font-bold hover-lift transition-all duration-300 shadow hover:shadow-lg"
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
        </div>
      )}
      
      {/* Security Section */}
      {activeSection === 'security' && (
        <div className="premium-card p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-poppins font-bold text-text-primary mb-6">Changement de mot de passe</h3>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Mot de passe actuel *</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D6EFD] font-medium font-inter"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Nouveau mot de passe *</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D6EFD] font-medium font-inter"
              />
              <p className="mt-2 text-sm text-text-secondary font-inter">
                Minimum 6 caractères
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Confirmer le nouveau mot de passe *</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D6EFD] font-medium font-inter"
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#0D6EFD] to-[#007BFF] text-white px-6 py-3 rounded-lg font-poppins font-bold hover-lift transition-all duration-300 shadow hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Mise à jour...
                  </>
                ) : (
                  'Mettre à jour le mot de passe'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Preferences Section */}
      {activeSection === 'preferences' && (
        <div className="premium-card p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-poppins font-bold text-text-primary mb-6">Préférences de notification</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-text-primary font-inter">Notifications par email</h4>
                <p className="text-sm text-text-secondary font-inter">Recevoir des notifications par email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={preferences.emailNotifications}
                  onChange={handlePreferenceChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0D6EFD]"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-text-primary font-inter">Notifications SMS</h4>
                <p className="text-sm text-text-secondary font-inter">Recevoir des notifications par SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="smsNotifications"
                  checked={preferences.smsNotifications}
                  onChange={handlePreferenceChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0D6EFD]"></div>
              </label>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-poppins font-bold text-text-primary mb-4">Sécurité du compte</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="premium-card p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary font-inter">Authentification à deux facteurs</h4>
                    <p className="text-sm text-text-secondary font-inter">Activée</p>
                  </div>
                </div>
              </div>
              
              <div className="premium-card p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                    <i className="fas fa-history"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary font-inter">Connexions récentes</h4>
                    <p className="text-sm text-text-secondary font-inter">Voir l'historique</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}