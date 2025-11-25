import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import BuyerSidebar from '../components/BuyerSidebar';
import HomeTab from '../components/buyer/HomeTab';
import FavoritesTab from '../components/buyer/FavoritesTab';
import AlertsTab from '../components/buyer/AlertsTab';
import CommentsTab from '../components/buyer/CommentsTab';
import ProfileTab from '../components/buyer/ProfileTab';
import SettingsTab from '../components/buyer/SettingsTab';


export default function BuyerDashboard() {
  const user = useSelector(state => state.auth.user);
  const [activeTab, setActiveTab] = useState('home');
  
  if (!user) {
    return <div className="p-4">Veuillez vous connecter pour accéder à votre tableau de bord.</div>;
  }

  return (
    <div className="min-h-screen bg-bg-light flex">
      <BuyerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'favorites' && <FavoritesTab />}
          {activeTab === 'alerts' && <AlertsTab />}
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'settings' && <SettingsTab />}

        </div>
      </main>
    </div>
  );
}