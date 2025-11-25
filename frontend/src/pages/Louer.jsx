import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import propertyClient from '../api/propertyClient';
import userClient from '../api/userClient';

export default function Louer() {
  const user = useSelector(state => state.auth.user);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    loadOffers();
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadOffers = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Load offers for rent
      const params = {
        status: 'online',
        availability: 'rent'
      };
      
      const response = await propertyClient.getAll(params);
      const properties = response.properties || response.data?.properties || [];
      
      setOffers(properties);
    } catch (err) {
      console.error('Error loading offers:', err);
      setError('Erreur lors du chargement des offres');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await userClient.getFavorites();
      const favoritesData = response.data || response;
      const favoriteIds = new Set(favoritesData.map(fav => fav._id));
      setFavorites(favoriteIds);
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  };

  const toggleFavorite = async (propertyId) => {
    if (!user) {
      alert('Veuillez vous connecter pour ajouter aux favoris');
      return;
    }
    
    try {
      if (favorites.has(propertyId)) {
        // Remove from favorites
        await userClient.removeFromFavorites(propertyId);
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(propertyId);
          return newFavorites;
        });
      } else {
        // Add to favorites
        await userClient.addToFavorites(propertyId);
        setFavorites(prev => new Set(prev).add(propertyId));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Erreur lors de l\'ajout/retir de vos favoris');
    }
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-bg-light py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Louer un bien</h1>
          <p className="text-text-secondary">Trouvez la location parfaite pour vous</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark"></div>
          </div>
        ) : (
          <>
            {offers.length === 0 ? (
              <div className="premium-card p-12 text-center shadow-lg">
                <h3 className="text-xl font-medium text-text-primary mb-2">Aucune offre trouvée</h3>
                <p className="text-text-secondary mb-4">Nous n'avons pas encore de biens à louer. Revenez bientôt !</p>
                <Link 
                  to="/offers" 
                  className="premium-btn-primary px-4 py-2 rounded-md shadow-sm"
                >
                  Voir toutes les offres
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map(offer => (
                  <div key={offer._id} className="premium-card overflow-hidden hover-lift transition-all duration-300 shadow-md hover:shadow-xl fade-in">
                    <Link to={`/offers/${offer._id}`} className="block">
                      {offer.images && offer.images.length > 0 ? (
                        <div className="relative">
                          <img
                            src={offer.images[0].url}
                            alt={offer.title}
                            className="w-full h-56 object-cover object-center hover-scale transition-all duration-500"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/600x400/cccccc/000000?text=Image+Indisponible';
                              e.target.onerror = null;
                            }}
                          />
                          {offer.images.length > 1 && (
                            <div className="absolute top-3 right-3 bg-primary-dark text-white text-xs px-2 py-1 rounded-full font-bold">
                              +{offer.images.length - 1}
                            </div>
                          )}
                          
                          <div className="absolute top-3 left-3 bg-secondary-gold text-text-primary text-xs px-2 py-1 rounded-full font-bold">
                            <i className="fas fa-fire mr-1"></i> Nouveau
                          </div>
                          
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              toggleFavorite(offer._id);
                            }}
                            className={`absolute top-3 right-12 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              favorites.has(offer._id) 
                                ? 'bg-red-500 text-white' 
                                : 'bg-white bg-opacity-80 text-gray-700 hover:bg-red-100'
                            }`}
                            aria-label={favorites.has(offer._id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                          >
                            <i className={`fas ${favorites.has(offer._id) ? 'fa-heart' : 'fa-heart-o'}`}></i>
                          </button>
                          
                          <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                            <i className="fas fa-eye mr-1"></i> {offer.views || 0} vues
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 flex items-center justify-center">
                          <span className="text-gray-500">Pas d'image</span>
                        </div>
                      )}
                      
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-semibold text-text-primary truncate">{offer.title}</h3>
                          <div className="flex flex-col items-end">
                            <span className="premium-badge">
                              {offer.type}
                            </span>
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                              offer.status === 'online' ? 'bg-green-100 text-green-800' :
                              offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              offer.status === 'negotiation' ? 'bg-blue-100 text-blue-800' :
                              offer.status === 'sold' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {offer.status === 'online' ? 'En ligne' :
                               offer.status === 'pending' ? 'En attente' :
                               offer.status === 'negotiation' ? 'En négociation' :
                               offer.status === 'sold' ? 'Vendu' : 'Retiré'}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-text-secondary text-sm mb-4">
                          <i className="fas fa-map-marker-alt text-accent-turquoise mr-2"></i>
                          {offer.address?.city}, {offer.address?.district || ''}
                        </p>
                        
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xl font-bold text-primary-dark">
                            {formatPrice(offer.price, offer.currency)}
                          </span>
                          <span className="text-sm text-text-secondary">
                            <i className="fas fa-ruler-combined mr-2 text-accent-turquoise"></i>
                            {offer.surface} m²
                          </span>
                        </div>
                        
                        <div className="flex justify-between border-t border-gray-100 pt-4">
                          <div className="flex text-sm text-text-secondary">
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
                          
                          <div className="flex items-center text-xs text-text-secondary">
                            <i className="fas fa-heart text-red-500 mr-1"></i> {offer.favorites || 0}
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div className="text-xs text-accent-turquoise font-medium">
                            <i className="fas fa-clock mr-1"></i> Publié il y a 2 jours
                          </div>
                          <button className="premium-btn-accent px-3 py-1 rounded-full text-sm hover-lift">
                            Voir détails
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}