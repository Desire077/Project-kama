import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import propertyClient from '../../api/propertyClient';

export default function BoostPage() {
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

  const handleBoost = (listingId) => {
    navigate(`/seller/pay?propertyId=${listingId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non boosté';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const isBoosted = (listing) => {
    if (!listing.boostedUntil) return false;
    const boostedUntil = new Date(listing.boostedUntil);
    const now = new Date();
    return boostedUntil > now;
  };

  if (!auth.user) {
    return (
      <div className="min-h-screen bg-kama-bg flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-kama-vert mb-4">Connectez-vous pour accéder aux options de boost</h1>
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
          Boostez vos annonces
        </h1>
        <p className="text-kama-muted">Augmentez la visibilité de vos annonces avec le boost premium</p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <section className="bg-white rounded-2xl p-6 shadow-soft mb-6">
        <h2 className="font-poppins font-semibold text-lg text-kama-vert mb-4">Comment ça marche ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="w-10 h-10 bg-primary-dark text-white rounded-full flex items-center justify-center mb-3">1</div>
            <h3 className="font-semibold mb-2">Sélectionnez une annonce</h3>
            <p className="text-sm text-kama-muted">Choisissez l'annonce que vous souhaitez booster</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="w-10 h-10 bg-primary-dark text-white rounded-full flex items-center justify-center mb-3">2</div>
            <h3 className="font-semibold mb-2">Choisissez un plan</h3>
            <p className="text-sm text-kama-muted">Sélectionnez la durée de boost qui vous convient</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="w-10 h-10 bg-primary-dark text-white rounded-full flex items-center justify-center mb-3">3</div>
            <h3 className="font-semibold mb-2">Boostez votre visibilité</h3>
            <p className="text-sm text-kama-muted">Votre annonce apparaîtra en tête de liste</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl p-6 shadow-soft">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-poppins font-semibold text-lg text-kama-vert">Mes annonces à booster</h2>
          <button 
            onClick={() => navigate('/vendre')}
            className="bg-gradient-to-r from-kama-vert to-[#00BFA6] text-white px-4 py-2 rounded-full shadow text-sm font-poppins font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            + Nouvelle annonce
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
              <i className="fas fa-rocket text-gray-500 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-kama-text mb-2">Aucune annonce pour l'instant</h3>
            <p className="text-kama-muted mb-6">Publiez votre première annonce pour la booster</p>
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
              <div key={listing._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-kama-text truncate">{listing.title}</h3>
                  {isBoosted(listing) && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Boosté</span>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-kama-muted mb-3">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  <span>{listing.address?.city}, {listing.address?.district || ''}</span>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="text-lg font-bold text-primary-dark">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: listing.currency || 'XAF',
                      minimumFractionDigits: 0
                    }).format(listing.price)}
                  </div>
                  <div className="text-sm text-kama-muted">
                    {isBoosted(listing) ? (
                      <span>Boosté jusqu'au {formatDate(listing.boostedUntil)}</span>
                    ) : (
                      <span>Non boosté</span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => handleBoost(listing._id)}
                  className="w-full bg-gradient-to-r from-primary-dark to-[#00BFA6] text-white py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                >
                  {isBoosted(listing) ? 'Renouveler le boost' : 'Booster cette annonce'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}