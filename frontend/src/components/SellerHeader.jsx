import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function SellerHeader({ onNewProperty }) {
  const user = useSelector(state => state.auth.user);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="bg-luxury-gold text-primary-dark rounded-lg px-2 py-1 mr-2 font-bold text-lg">K</span>
            <span className="font-bold text-primary-dark hidden sm:inline">KAMA</span>
          </Link>

          {/* User info and notifications */}
          <div className="flex items-center space-x-4">
            {/* Notification bell */}
            <button className="relative p-2 text-gray-600 hover:text-luxury-gold transition-colors">
              <i className="fas fa-bell text-xl"></i>
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
            </button>

            {/* User profile */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-luxury-gold flex items-center justify-center text-primary-dark font-bold mr-2">
                {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <span className="hidden md:inline text-sm font-medium text-gray-700">
                {user?.firstName || user?.email}
              </span>
            </div>

            {/* New property button */}
            <button 
              onClick={onNewProperty}
              className="bg-luxury-gold text-primary-dark px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-300 hover:shadow-lg"
            >
              + Nouvelle annonce
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}