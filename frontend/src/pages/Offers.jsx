import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import propertyClient from '../api/propertyClient';
import userClient from '../api/userClient';

export default function Offers() {
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    availability: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    rooms: '',
    surface: '',
    status: 'approved' // Changed from 'online' to 'approved' to match the default property status
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  // Add state for favorites
  const [favorites, setFavorites] = useState(new Set());

  // Determine category based on URL - memoized with useCallback
  const getCategoryFromPath = useCallback(() => {
    if (location.pathname === '/acheter') return 'acheter';
    if (location.pathname === '/louer') return 'louer';
    if (location.pathname === '/vacances') return 'vacances';
    return 'all';
  }, [location.pathname]);

  // Parse search query from URL and update filters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('q');
    
    // Always start with a clean set of filters
    const newFilters = {
      type: '',
      availability: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      rooms: '',
      surface: '',
      status: 'online'
    };
    
    if (searchQuery) {
      // Split the query into words
      const words = searchQuery.trim().split(/\s+/);
      
      // Process each word
      words.forEach(word => {
        // Check if it's a number (potential price)
        if (/^\d+$/.test(word)) {
          const number = parseInt(word);
          // If it's a large number, treat it as a price
          if (number > 10000) {
            // If we don't have a maxPrice yet, set it
            if (!newFilters.maxPrice) {
              newFilters.maxPrice = number;
            }
            // If we already have a maxPrice and this is smaller, treat it as minPrice
            else if (number < newFilters.maxPrice) {
              newFilters.minPrice = number;
            }
          }
          // If it's a small number, treat it as rooms
          else if (number <= 10 && number > 0) {
            newFilters.rooms = number;
          }
        }
        // Check if it's a range (e.g., "100000-200000")
        else if (/^\d+-\d+$/.test(word)) {
          const [min, max] = word.split('-').map(Number);
          newFilters.minPrice = min;
          newFilters.maxPrice = max;
        }
        // Otherwise treat it as location (city/neighborhood)
        else {
          // If we don't have a city yet, use this word
          if (!newFilters.city) {
            // Capitalize first letter of each word for proper city name matching
            newFilters.city = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          }
          // If we already have a city, append this word
          else {
            newFilters.city += ' ' + word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          }
        }
      });
      
      console.log('Parsed search query:', searchQuery);
      console.log('Parsed filters:', newFilters);
    }
    
    // Apply category-based filters
    const category = getCategoryFromPath();
    switch (category) {
      case 'acheter':
        newFilters.type = ['maison', 'appartement', 'terrain'];
        newFilters.availability = '';
        break;
      case 'louer':
        newFilters.availability = 'rent';
        break;
      case 'vacances':
        newFilters.type = 'vacances';
        newFilters.availability = '';
        break;
      default:
        newFilters.status = 'online';
        break;
    }
    
    setFilters(newFilters);
  }, [location.search, getCategoryFromPath]); // Run when search query or category changes

  // Load offers when filters or pagination changes
  useEffect(() => {
    const loadOffers = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Prepare params for API request
        const params = {
          page: pagination.current,
          limit: 10,
          status: filters.status
        };
        
        // Add non-empty filters
        if (filters.type) {
          params.type = filters.type;
        }
        if (filters.availability) {
          params.availability = filters.availability;
        }
        if (filters.city) {
          params.city = filters.city;
        }
        if (filters.minPrice) {
          params.minPrice = filters.minPrice;
        }
        if (filters.maxPrice) {
          params.maxPrice = filters.maxPrice;
        }
        if (filters.rooms) {
          params.rooms = filters.rooms;
        }
        if (filters.surface) {
          params.surface = filters.surface;
        }
        
        console.log('Making API request with params:', params);
        
        const response = await propertyClient.getAll(params);
        
        // Handle both possible response formats
        const properties = response.properties || response.data?.properties || [];
        const paginationData = response.pagination || response.data?.pagination || { current: 1, pages: 1, total: 0 };
        
        setOffers(properties);
        setPagination(paginationData);
      } catch (err) {
        console.error('Error loading offers:', err);
        // Show more detailed error message
        if (err.response && err.response.data && err.response.data.message) {
          setError(`Erreur lors du chargement des offres: ${err.response.data.message}`);
        } else {
          setError('Erreur lors du chargement des offres. Veuillez réessayer.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
    
    const loadFavorites = async () => {
      try {
        const response = await userClient.getFavorites();
        // Handle both possible response formats
        const favoritesData = response.data || response;
        const favoriteIds = new Set(favoritesData.map(fav => fav._id));
        setFavorites(favoriteIds);
      } catch (err) {
        console.error('Error loading favorites:', err);
      }
    };

    if (user) {
      loadFavorites();
    }
  }, [filters, pagination.current, user]); // Depend on filters, pagination, and user

  const toggleFavorite = async (propertyId) => {
    if (!user) {
      // Redirect to login with return URL
      navigate(`/login?redirect=${location.pathname}`);
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      availability: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      rooms: '',
      surface: '',
      status: 'approved' // Changed from 'online' to 'approved' to match our new default
    });
    setPagination({
      current: 1,
      pages: 1,
      total: 0
    });
    
    // Clear search query from URL
    if (location.search) {
      navigate(location.pathname);
    }
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getCategoryTitle = () => {
    const category = getCategoryFromPath();
    switch (category) {
      case 'acheter': return 'Acheter un bien';
      case 'louer': return 'Louer un bien';
      case 'vacances': return 'Locations de vacances';
      default: return 'Toutes les offres';
    }
  };

  const getCategoryDescription = () => {
    const category = getCategoryFromPath();
    switch (category) {
      case 'acheter': return 'Trouvez la propriété parfaite pour vous';
      case 'louer': return 'Découvrez les meilleures locations';
      case 'vacances': return 'Trouvez votre location de vacances idéale';
      default: return 'Découvrez toutes nos offres immobilières';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">{getCategoryTitle()}</h1>
          <p className="text-text-secondary">{getCategoryDescription()}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {offers.length === 0 ? (
          <div className="premium-card p-12 text-center shadow-lg">
            <h3 className="text-xl font-medium text-text-primary mb-2">Aucune offre trouvée</h3>
            <p className="text-text-secondary mb-4">
              Aucune offre ne correspond à vos critères. Essayez de modifier vos filtres.
            </p>
            <button 
              onClick={clearFilters}
              className="premium-btn-primary px-4 py-2 rounded-md shadow-sm"
            >
              Réinitialiser les filtres
            </button>
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
                        className="w-full h-48 object-cover hover-scale transition-all duration-500"
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
                      <div className="flex items-center text-sm text-text-secondary">
                        <span className="mr-3">
                          <i className="fas fa-bed mr-1 text-accent-turquoise"></i> {offer.rooms || 0}
                        </span>
                        <span>
                          <i className="fas fa-bath mr-1 text-accent-turquoise"></i> {offer.bathrooms || 0}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-text-secondary">
                        <i className="fas fa-ruler-combined mr-1 text-accent-turquoise"></i> {offer.surface || 0} m²
                      </div>
                      <div className="flex items-center text-sm text-text-secondary">
                        <i className="fas fa-car mr-1 text-accent-turquoise"></i> {offer.parking ? 'Oui' : 'Non'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Engagement Element */}
                  <div className="mt-4 flex justify-between items-center px-5 pb-5">
                    <div className="text-xs text-accent-turquoise font-medium">
                      <i className="fas fa-clock mr-1"></i> Publié le {new Date(offer.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}