import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import userClient from '../api/userClient';
import propertyClient from '../api/propertyClient';

export default function TableauDeBord() {
  const user = useSelector(state => state.auth.user);
  const [activeTab, setActiveTab] = useState('favorites');
  const [favorites, setFavorites] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadFavorites();
      loadAlerts();
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      const response = await userClient.getFavorites();
      const favoritesData = response.data || response;
      setFavorites(favoritesData);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('Erreur lors du chargement des favoris');
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await userClient.getAlerts();
      const alertsData = response.data || response;
      setAlerts(alertsData);
    } catch (err) {
      console.error('Error loading alerts:', err);
      // Not critical, continue loading
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (!user) {
    return <div className="p-4">Veuillez vous connecter pour accéder à votre tableau de bord.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-kama-bg py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kama-vert"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kama-bg py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-kama-text mb-2">
            Bonjour, {user.firstName || user.email}
          </h1>
          <p className="text-kama-muted">
            Gérez vos préférences et vos recherches immobilières
          </p>
        </div>
        
        <div className="card-kama rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                className={`py-5 px-6 text-center whitespace-nowrap font-medium transition-all duration-300 ${
                  activeTab === 'favorites' 
                    ? 'border-b-2 border-kama-vert text-kama-vert' 
                    : 'text-kama-muted hover:text-kama-vert'
                }`}
                onClick={() => setActiveTab('favorites')}
              >
                <i className="fas fa-heart mr-2"></i>Favoris
              </button>
              <button
                className={`py-5 px-6 text-center whitespace-nowrap font-medium transition-all duration-300 ${
                  activeTab === 'alerts' 
                    ? 'border-b-2 border-kama-vert text-kama-vert' 
                    : 'text-kama-muted hover:text-kama-vert'
                }`}
                onClick={() => setActiveTab('alerts')}
              >
                <i className="fas fa-bell mr-2"></i>Alertes
              </button>
              <button
                className={`py-5 px-6 text-center whitespace-nowrap font-medium transition-all duration-300 ${
                  activeTab === 'profile' 
                    ? 'border-b-2 border-kama-vert text-kama-vert' 
                    : 'text-kama-muted hover:text-kama-vert'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <i className="fas fa-user mr-2"></i>Profil
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'favorites' && (
              <div>
                <h2 className="text-2xl font-bold text-kama-text mb-6">Mes favoris</h2>
                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
                      <i className="fas fa-heart text-gray-500 text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-medium text-kama-text mb-2">Aucun favori</h3>
                    <p className="text-kama-muted mb-6">Vous n'avez pas encore ajouté d'offres à vos favoris</p>
                    <Link to="/offers" className="btn-kama-primary px-6 py-3 rounded-lg font-bold">
                      <i className="fas fa-search mr-2"></i> Explorer les offres
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map(offer => (
                      <div key={offer._id} className="card-kama overflow-hidden hover-lift transition-all duration-300">
                        <Link to={`/offers/${offer._id}`}>
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
                                <div className="absolute top-3 right-3 bg-kama-vert text-white text-xs px-2 py-1 rounded-full">
                                  +{offer.images.length - 1}
                                </div>
                              )}
                              <div className="absolute top-3 left-3 bg-kama-dore text-kama-text text-xs px-2 py-1 rounded-full font-bold">
                                Nouveau
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 flex items-center justify-center">
                              <span className="text-gray-500">Pas d'image</span>
                            </div>
                          )}
                          
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-lg font-semibold text-kama-text truncate">{offer.title}</h3>
                              <div className="flex flex-col items-end">
                                <span className="bg-kama-dore bg-opacity-20 text-kama-vert text-xs px-2 py-1 rounded-full">
                                  {offer.type}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-kama-muted text-sm mb-4">
                              <i className="fas fa-map-marker-alt text-kama-turquoise mr-2"></i>
                              {offer.address?.city}, {offer.address?.district || ''}
                            </p>
                            
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-xl font-bold text-kama-vert">
                                {formatPrice(offer.price, offer.currency)}
                              </span>
                              <div className="flex items-center text-sm text-kama-muted">
                                <span className="mr-3">
                                  <i className="fas fa-bed mr-1 text-kama-turquoise"></i> {offer.rooms || 0}
                                </span>
                                <span>
                                  <i className="fas fa-bath mr-1 text-kama-turquoise"></i> {offer.bathrooms || 0}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center text-sm text-kama-muted">
                                <i className="fas fa-ruler-combined mr-1 text-kama-turquoise"></i> {offer.surface || 0} m²
                              </div>
                              <div className="flex items-center text-sm text-kama-muted">
                                <i className="fas fa-car mr-1 text-kama-turquoise"></i> {offer.parking ? 'Oui' : 'Non'}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'alerts' && (
              <div>
                <h2 className="text-2xl font-bold text-kama-text mb-6">Mes alertes</h2>
                {alerts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
                      <i className="fas fa-bell text-gray-500 text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-medium text-kama-text mb-2">Aucune alerte</h3>
                    <p className="text-kama-muted mb-6">Créez des alertes pour être informé des nouvelles offres</p>
                    <button className="btn-kama-primary px-6 py-3 rounded-lg font-bold">
                      <i className="fas fa-plus mr-2"></i> Créer une alerte
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alerts.map(alert => (
                      <div key={alert._id} className="card-kama p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-kama-text">{alert.name}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Actif
                          </span>
                          <button className="text-red-500 hover:text-red-700">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold text-kama-text mb-6">Mon profil</h2>
                <div className="card-kama p-6">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="bg-kama-vert rounded-full w-20 h-20 flex items-center justify-center text-white font-bold text-2xl">
                      {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-kama-text">{user.firstName} {user.lastName}</h3>
                      <p className="text-kama-muted">{user.email}</p>
                      <p className="text-sm text-kama-muted mt-1">
                        Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-kama-text mb-3">Informations personnelles</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-kama-muted">Prénom</label>
                          <p className="font-medium">{user.firstName || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-kama-muted">Nom</label>
                          <p className="font-medium">{user.lastName || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-kama-muted">Téléphone</label>
                          <p className="font-medium">{user.phone || '-'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-kama-text mb-3">Paramètres</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-kama-muted">Notifications</label>
                          <p className="font-medium">Activées</p>
                        </div>
                        <div>
                          <label className="text-sm text-kama-muted">Langue</label>
                          <p className="font-medium">Français</p>
                        </div>
                        <div>
                          <label className="text-sm text-kama-muted">Devise</label>
                          <p className="font-medium">XAF (Franc CFA)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <Link to="/profile" className="btn-kama-primary px-4 py-2 rounded-lg">
                      Modifier mon profil
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}