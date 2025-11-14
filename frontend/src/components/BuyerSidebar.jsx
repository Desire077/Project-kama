import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

export default function BuyerSidebar({ activeTab, setActiveTab }) {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const menuItems = [
    { id: 'home', label: 'Accueil acheteur', icon: 'fas fa-home' },
    { id: 'favorites', label: 'Mes favoris', icon: 'fas fa-heart' },
    { id: 'alerts', label: 'Mes alertes', icon: 'fas fa-bell' },
    { id: 'comments', label: 'Mes commentaires', icon: 'fas fa-comments' },
    { id: 'profile', label: 'Profil', icon: 'fas fa-user' },
    { id: 'settings', label: 'Paramètres', icon: 'fas fa-cog' }
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <i className="fas fa-bars text-xl text-[#1A3C40]"></i>
      </button>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:relative md:translate-x-0 z-40 h-full bg-white shadow-lg w-64 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:block`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <span className="bg-gradient-to-r from-[#1A3C40] to-[#00BFA6] text-white rounded-lg px-2 py-1 mr-2 font-bold text-lg font-poppins">K</span>
              <span className="font-bold text-[#1A3C40] hidden sm:inline font-poppins">KAMA</span>
            </div>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1A3C40] to-[#00BFA6] flex items-center justify-center text-white font-bold mr-3 font-poppins">
                {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="font-semibold text-[#1A3C40] font-poppins">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-600 font-inter">
                  Acheteur
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 ease-in-out ${
                      activeTab === item.id
                        ? 'bg-white border-l-4 border-[#1A3C40] text-[#1A3C40] font-medium'
                        : 'text-gray-600 hover:bg-[#F8F9FA] hover:text-[#1A3C40]'
                    }`}
                  >
                    <i className={`${item.icon} mr-3 ${activeTab === item.id ? 'text-[#1A3C40]' : 'text-[#00BFA6]'}`}></i>
                    <span className="font-inter">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-500 transition-all duration-300 ease-in-out"
            >
              <i className="fas fa-sign-out-alt mr-3"></i>
              <span className="font-inter">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
}