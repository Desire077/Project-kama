import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import propertyClient from '../../api/propertyClient';
import ListingCard from '../ListingCard';

export default function ListingsPage() {
  const auth = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await propertyClient.getMyProperties();
      const propertiesData = response.data || response;
      setListings(propertiesData);
    } catch (error) {
      console.error('Error loading listings:', error);
      setError('Erreur lors du chargement des annonces');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (listing) => {
    navigate(`/edit-offer/${listing._id}`);
  };

  const handleDelete = (listingId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      setListings(prev => prev.filter(l => l._id !== listingId));
    }
  };

  const handleBoost = (listingId) => {
    navigate(`/seller/pay?propertyId=${listingId}`);
  };

  const handleView = (listing) => {
    // In a real app, this would open a modal or navigate to a detail view
    console.log('View listing', listing);
  };

  if (!auth.user) {
    return (
      <div className="min-h-screen bg-kama-bg flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-kama-vert mb-4">Connectez-vous pour accéder à vos annonces</h1>
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
          Mes annonces
        </h1>
        <p className="text-kama-muted">Gérez toutes vos annonces immobilières</p>
      </header>

      <section className="bg-white rounded-2xl p-6 shadow-soft">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-poppins font-semibold text-lg text-kama-vert">Toutes mes annonces</h2>
          <button 
            onClick={() => navigate('/vendre')}
            className="bg-gradient-to-r from-kama-vert to-[#00BFA6] text-white px-4 py-2 rounded-full shadow text-sm font-poppins font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            + Nouvelle annonce
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
              <i className="fas fa-home text-gray-500 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-kama-text mb-2">Aucune annonce pour l'instant</h3>
            <p className="text-kama-muted mb-6">Publiez votre première annonce</p>
            <button
              onClick={() => navigate('/vendre')}
              className="premium-btn-primary px-6 py-3 rounded-lg font-medium"
            >
              Créer une annonce
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {listings.map(listing => (
              <ListingCard 
                key={listing._id} 
                listing={listing}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onBoost={handleBoost}
                onView={handleView}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}