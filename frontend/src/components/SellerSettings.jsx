import React, { useState } from 'react';

export default function SellerSettings() {
  const [profile, setProfile] = useState({
    firstName: "Marie",
    lastName: "Curie",
    email: "marie.curie@example.com",
    phone: "+241 01 02 03 04",
    address: "Libreville, Gabon"
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    notifications: true
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (e) => {
    const { name, checked } = e.target;
    setSecurity(prev => ({ ...prev, [name]: checked }));
  };

  return (
    <div className="premium-card p-6 rounded-xl">
      <h2 className="text-2xl font-bold text-primary-dark mb-6">Paramètres / Sécurité</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Settings */}
        <div className="lg:col-span-2">
          <div className="mb-8">
            <h3 className="font-bold text-primary-dark mb-4">Gestion du profil</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleProfileChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleProfileChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <input
                  type="text"
                  name="address"
                  value={profile.address}
                  onChange={handleProfileChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <button className="premium-btn-primary px-4 py-2 rounded-lg font-medium">
                Sauvegarder les modifications
              </button>
            </div>
          </div>
          
          {/* Security Settings */}
          <div>
            <h3 className="font-bold text-primary-dark mb-4">Options de sécurité</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Authentification à deux facteurs</h4>
                  <p className="text-sm text-gray-600">Ajoutez une couche de sécurité supplémentaire</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="twoFactor"
                    checked={security.twoFactor}
                    onChange={handleSecurityChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Notifications</h4>
                  <p className="text-sm text-gray-600">Recevez des alertes par email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="notifications"
                    checked={security.notifications}
                    onChange={handleSecurityChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Validation d'identité</h4>
                  <p className="text-sm text-gray-600">Téléchargez votre CNI ou passeport</p>
                </div>
                <button className="premium-btn-secondary px-4 py-2 rounded-lg font-medium">
                  Télécharger
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Preview */}
        <div>
          <h3 className="font-bold text-primary-dark mb-4">Aperçu du profil</h3>
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-luxury-gold flex items-center justify-center text-primary-dark font-bold text-2xl mx-auto mb-4">
              {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
            </div>
            <h4 className="font-bold text-lg text-primary-dark">{profile.firstName} {profile.lastName}</h4>
            <p className="text-gray-600 text-sm mb-2">{profile.email}</p>
            <p className="text-gray-600 text-sm mb-4">{profile.address}</p>
            
            <div className="flex justify-center space-x-2">
              <div className="bg-luxury-gold bg-opacity-10 text-luxury-gold px-3 py-1 rounded-full text-xs">
                Vendeur vérifié
              </div>
              <div className="bg-accent-soft bg-opacity-10 text-accent-soft px-3 py-1 rounded-full text-xs">
                Premium
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button className="w-full premium-btn-gold px-4 py-3 rounded-lg font-bold">
              Changer le mot de passe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}