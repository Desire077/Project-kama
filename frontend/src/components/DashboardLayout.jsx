import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function DashboardLayout({ children }) {
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNewProperty = () => {
    navigate('/vendre');
  };

  const menuItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'fas fa-chart-line' },
    { id: 'listings', label: 'Mes annonces', icon: 'fas fa-home' },
    { id: 'statistics', label: 'Statistiques', icon: 'fas fa-chart-bar' },
    { id: 'boost', label: 'Boost / Premium', icon: 'fas fa-rocket' },
    { id: 'profile', label: 'Profil', icon: 'fas fa-user' }
  ];

  return (
    <div className="min-h-screen bg-kama-bg">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="bg-kama-dore text-kama-vert rounded-lg px-2 py-1 mr-2 font-bold text-lg">K</span>
              <span className="font-bold text-kama-vert hidden sm:inline">KAMA</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* User info */}
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-kama-dore flex items-center justify-center text-kama-vert font-bold mr-3">
                {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block">
                <div className="font-semibold text-kama-text">
                  {user?.firstName || user?.email}
                </div>
                <div className="text-xs text-kama-muted">
                  Vendeur vérifié
                </div>
              </div>
            </div>

            {/* New property button */}
            <button 
              onClick={handleNewProperty}
              className="bg-gradient-to-r from-kama-vert to-[#00BFA6] text-white px-4 py-2 rounded-full shadow font-poppins font-semibold text-sm"
            >
              + Nouvelle annonce
            </button>

            {/* Mobile menu button */}
            <button 
              className="md:hidden text-kama-text"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className={`fixed md:relative md:translate-x-0 z-30 h-full bg-white shadow-sm w-64 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:block`}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-poppins font-semibold text-kama-vert">Navigation</h2>
            </div>
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <Link 
                      to={`/dashboard/seller/${item.id}`}
                      className="flex items-center px-4 py-3 rounded-lg text-kama-text hover:bg-kama-bg transition-colors"
                    >
                      <i className={`${item.icon} mr-3 text-kama-muted`}></i>
                      <span className="font-inter">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}