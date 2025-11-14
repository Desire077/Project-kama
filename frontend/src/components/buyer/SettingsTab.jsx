import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

export default function SettingsTab() {
  const dispatch = useDispatch();
  const [language, setLanguage] = useState('fr');
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    // In a real implementation, this would update the app language
  };

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
    // In a real implementation, this would update the app theme
  };

  const handleNotificationChange = (type) => {
    setNotifications({
      ...notifications,
      [type]: !notifications[type]
    });
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-poppins font-bold text-text-primary">Paramètres</h2>
        <p className="text-text-secondary font-inter">Gérez vos préférences et paramètres de l'application</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Language Settings */}
          <div className="premium-card p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-poppins font-bold text-text-primary mb-4">Langue</h3>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Langue de l'application</label>
              <select
                value={language}
                onChange={handleLanguageChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D6EFD] font-medium font-inter"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
              <p className="mt-2 text-sm text-text-secondary font-inter">
                La langue de l'interface sera mise à jour après rechargement de la page
              </p>
            </div>
          </div>
          
          {/* Theme Settings */}
          <div className="premium-card p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-poppins font-bold text-text-primary mb-4">Thème</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
              <div
                onClick={() => setTheme('light')}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  theme === 'light' 
                    ? 'border-[#0D6EFD] ring-2 ring-[#0D6EFD] ring-opacity-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full border border-gray-300 mr-3 flex items-center justify-center">
                    {theme === 'light' && (
                      <div className="w-2 h-2 rounded-full bg-[#0D6EFD]"></div>
                    )}
                  </div>
                  <span className="font-medium text-text-primary font-inter">Clair</span>
                </div>
                <div className="mt-3 flex space-x-2">
                  <div className="w-8 h-8 bg-white border border-gray-200 rounded"></div>
                  <div className="w-8 h-8 bg-gray-100 border border-gray-200 rounded"></div>
                  <div className="w-8 h-8 bg-gray-200 border border-gray-200 rounded"></div>
                </div>
              </div>
              
              <div
                onClick={() => setTheme('dark')}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  theme === 'dark' 
                    ? 'border-[#0D6EFD] ring-2 ring-[#0D6EFD] ring-opacity-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full border border-gray-300 mr-3 flex items-center justify-center">
                    {theme === 'dark' && (
                      <div className="w-2 h-2 rounded-full bg-[#0D6EFD]"></div>
                    )}
                  </div>
                  <span className="font-medium text-text-primary font-inter">Sombre</span>
                </div>
                <div className="mt-3 flex space-x-2">
                  <div className="w-8 h-8 bg-gray-800 border border-gray-700 rounded"></div>
                  <div className="w-8 h-8 bg-gray-700 border border-gray-600 rounded"></div>
                  <div className="w-8 h-8 bg-gray-600 border border-gray-500 rounded"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Notification Settings */}
          <div className="premium-card p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-poppins font-bold text-text-primary mb-4">Notifications</h3>
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-text-primary font-inter">Notifications par email</h4>
                  <p className="text-sm text-text-secondary font-inter">Recevoir des notifications par email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={() => handleNotificationChange('email')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0D6EFD]"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-text-primary font-inter">Notifications push</h4>
                  <p className="text-sm text-text-secondary font-inter">Recevoir des notifications push</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={() => handleNotificationChange('push')}
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
                    checked={notifications.sms}
                    onChange={() => handleNotificationChange('sms')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0D6EFD]"></div>
                </label>
              </div>
            </div>
          </div>
          
          {/* Privacy Settings */}
          <div className="premium-card p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-poppins font-bold text-text-primary mb-4">Confidentialité</h3>
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-text-primary font-inter">Profil public</h4>
                  <p className="text-sm text-text-secondary font-inter">Autoriser les autres utilisateurs à voir mon profil</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0D6EFD]"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-text-primary font-inter">Historique de navigation</h4>
                  <p className="text-sm text-text-secondary font-inter">Conserver l'historique de mes recherches</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0D6EFD]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar with Account Actions */}
        <div className="space-y-6">
          {/* Account Information */}
          <div className="premium-card p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-poppins font-bold text-text-primary mb-4">Compte</h3>
            <div className="space-y-4">
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                    <i className="fas fa-download"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary font-inter">Exporter mes données</h4>
                    <p className="text-sm text-text-secondary font-inter">Télécharger une copie de vos données</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-3">
                    <i className="fas fa-user-lock"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary font-inter">Sécurité du compte</h4>
                    <p className="text-sm text-text-secondary font-inter">Gérer l'authentification à deux facteurs</p>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-full text-left p-3 rounded-lg hover:bg-red-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-3">
                    <i className="fas fa-sign-out-alt"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-600 font-inter">Déconnexion</h4>
                    <p className="text-sm text-text-secondary font-inter">Se déconnecter de votre compte</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
          
          {/* Danger Zone */}
          <div className="premium-card p-6 rounded-2xl shadow-lg border border-red-200">
            <h3 className="text-xl font-poppins font-bold text-red-600 mb-4">Zone de danger</h3>
            <div className="space-y-4">
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mr-3">
                    <i className="fas fa-user-edit"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary font-inter">Désactiver le compte</h4>
                    <p className="text-sm text-text-secondary font-inter">Désactiver temporairement votre compte</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg hover:bg-red-50 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-3">
                    <i className="fas fa-trash-alt"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-600 font-inter">Supprimer le compte</h4>
                    <p className="text-sm text-text-secondary font-inter">Supprimer définitivement votre compte</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}