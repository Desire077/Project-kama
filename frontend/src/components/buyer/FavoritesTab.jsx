import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userClient from '../../api/userClient';

export default function FavoritesTab() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await userClient.getFavorites();
      const favoritesData = response.data || response;
      setFavorites(favoritesData);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('Erreur lors du chargement des favoris');
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (propertyId) => {
    try {
      await userClient.removeFromFavorites(propertyId);
      setFavorites(favorites.filter(fav => fav._id !== propertyId));
    } catch (err) {
      console.error('Error removing from favorites:', err);
      setError('Erreur lors de la suppression du favori');
    }
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
        {error}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="premium-card rounded-2xl p-12 text-center shadow-lg">
        <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
          <i className="fas fa-heart text-gray-500 text-2xl"></i>
        </div>
        <h2 className="text-2xl font-poppins font-bold text-text-primary mb-2">Vous n'avez pas encore de favoris</h2>
        <p className="text-text-secondary mb-6 font-inter">Ajoutez des offres à vos favoris pour les retrouver facilement</p>
        <Link 
          to="/offers" 
          className="bg-gradient-to-r from-[#0D6EFD] to-[#007BFF] text-white px-6 py-3 rounded-lg font-poppins font-bold hover-lift transition-all duration-300 shadow hover:shadow-lg"
        >
          <i className="fas fa-search mr-2"></i> Parcourir les offres
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-poppins font-bold text-text-primary">Mes Favoris</h2>
          <p className="text-text-secondary font-inter">Retrouvez toutes vos offres favorites</p>
        </div>
        <Link 
          to="/offers" 
          className="bg-white border border-blue-200 text-[#0D6EFD] px-5 py-3 rounded-lg font-poppins font-bold mt-4 md:mt-0 hover-lift transition-all duration-300 shadow hover:shadow-lg"
        >
          <i className="fas fa-search mr-2"></i> Découvrir des biens similaires
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map(offer => (
          <div key={offer._id} className="premium-card overflow-hidden rounded-xl hover-lift transition-all duration-300">
            <div className="relative">
              <Link to={`/offers/${offer._id}`}>
                {offer.images && offer.images.length > 0 ? (
                  <div className="relative">
                    <img
                      src={offer.images[0].url}
                      alt={offer.title}
                      className="w-full h-48 object-cover hover-scale transition-all duration-500"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x400/cccccc/000000?text=Image+Indisponible';
                        e.target.onerror = null;
                      }}
                    />
                    {offer.images.length > 1 && (
                      <div className="absolute top-3 right-3 bg-primary-dark text-white text-xs px-2 py-1 rounded-full font-inter">
                        +{offer.images.length - 1}
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold font-inter">
                      Favori
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 flex items-center justify-center">
                    <span className="text-gray-500 font-inter">Pas d'image</span>
                  </div>
                )}
              </Link>
              
              <button
                onClick={() => removeFromFavorites(offer._id)}
                className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-all duration-300"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-poppins font-semibold text-text-primary truncate">{offer.title}</h3>
                <span className="premium-badge font-inter">
                  {offer.type}
                </span>
              </div>
              
              <p className="text-text-secondary text-sm mb-4 font-inter">
                <i className="fas fa-map-marker-alt text-accent-turquoise mr-2"></i>
                {offer.address?.city}, {offer.address?.district || ''}
              </p>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-poppins font-bold text-primary-dark">
                  {formatPrice(offer.price, offer.currency)}
                </span>
                <span className="text-sm text-text-secondary font-inter">
                  <i className="fas fa-ruler-combined mr-2 text-accent-turquoise"></i>
                  {offer.surface} m²
                </span>
              </div>
              
              <div className="flex justify-between border-t border-gray-100 pt-4">
                <div className="flex text-sm text-text-secondary font-inter">
                  <span className="mr-4 flex items-center">
                    <i className="fas fa-bed mr-2 text-accent-turquoise"></i> {offer.rooms || 0}
                  </span>
                  <span className="mr-4 flex items-center">
                    <i className="fas fa-bath mr-2 text-accent-turquoise"></i> {offer.bathrooms || 0}
                  </span>
                  <span className="flex items-center">
                    <i className="fas fa-car mr-2 text-accent-turquoise"></i> {offer.parking ? 'Oui' : 'Non'}
                  </span>
                </div>
              </div>
              
              <Link 
                to={`/offers/${offer._id}`}
                className="w-full bg-gradient-to-r from-[#0D6EFD] to-[#007BFF] text-white py-2 rounded-lg font-poppins font-medium mt-4 text-center block hover-lift transition-all duration-300 shadow hover:shadow-lg"
              >
                Voir les détails
              </Link>
              
              {/* Suggestion section */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-text-secondary mb-2 font-inter">
                  <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                  Offres similaires à celle-ci
                </p>
                <div className="flex space-x-2">
                  <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0"></div>
                  <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0"></div>
                  <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}