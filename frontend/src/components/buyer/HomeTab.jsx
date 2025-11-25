import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import propertyClient from '../../api/propertyClient';
import userClient from '../../api/userClient';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function HomeTab() {
  const user = useSelector(state => state.auth.user);
  const [recommendedProperties, setRecommendedProperties] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [stats, setStats] = useState({
    propertyTypes: [],
    cities: [],
    averageBudget: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Theme-aligned chart colors
  const COLORS = ['#1A3C40', '#D4AF37', '#00BFA6', '#606060'];

  useEffect(() => {
    loadDashboardData();
    const handler = () => loadDashboardData();
    window.addEventListener('refreshMatchingProperties', handler);
    return () => window.removeEventListener('refreshMatchingProperties', handler);
  }, []);

  const computeStatsFromProperties = (props) => {
    // Compute types distribution
    const typeCounts = props.reduce((acc, p) => {
      const t = (p.type || 'Autre').toLowerCase();
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
    const propertyTypesData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

    // Compute cities distribution
    const cityCounts = props.reduce((acc, p) => {
      const c = p.address?.city || 'Inconnu';
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {});
    const citiesData = Object.entries(cityCounts).map(([name, value]) => ({ name, value }));

    // Average budget
    const prices = props.map(p => Number(p.price) || 0).filter(n => n > 0);
    const averageBudget = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;

    return { propertyTypes: propertyTypesData, cities: citiesData, averageBudget };
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Get alerts to drive recommendations and recent criteria
      const alertsRes = await userClient.getAlerts();
      const alerts = alertsRes.data?.alerts || alertsRes.alerts || [];

      // Recommended properties: matching alerts or fallback to random offers
      let recommended = [];
      if (alerts.length > 0) {
        const matchRes = await userClient.getMatchingPropertiesForAlerts();
        recommended = matchRes.data?.properties || matchRes.properties || matchRes || [];
      }
      if (!recommended || recommended.length === 0) {
        const allRes = await propertyClient.getAll({ limit: 12, sort: 'recent' });
        const all = allRes.data?.properties || allRes.properties || allRes || [];
        // Randomize a subset of offers
        recommended = all.sort(() => Math.random() - 0.5).slice(0, 9);
      }

      setRecommendedProperties(recommended);

      // Map alerts to recent searches-like items
      const recent = alerts.slice(-6).map((a, idx) => ({
        id: idx + 1,
        city: a.city || '–',
        type: a.type || '–',
        budget: `${a.minPrice ? Number(a.minPrice).toLocaleString('fr-FR') : '–'}${a.minPrice || a.maxPrice ? ' - ' : ''}${a.maxPrice ? Number(a.maxPrice).toLocaleString('fr-FR') : '–'} FCFA`
      }));
      setRecentSearches(recent);

      // Compute stats from the recommended properties for realism
      setStats(computeStatsFromProperties(recommended));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Erreur lors du chargement des données du tableau de bord');
      // Fallback: still show recent offers even if alerts API fails
      try {
        const allRes = await propertyClient.getAll({ limit: 12, sort: 'recent' });
        const all = allRes.data?.properties || allRes.properties || allRes || [];
        const recommended = all.sort(() => Math.random() - 0.5).slice(0, 9);
        setRecommendedProperties(recommended);
        setRecentSearches([]);
        setStats(computeStatsFromProperties(recommended));
      } catch (innerErr) {
        console.error('Fallback load properties failed:', innerErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (propertyId) => {
    try {
      // Simple optimistic toggle for UI (actual API could be integrated if needed)
      setRecommendedProperties(prev => prev.map(p => p._id === propertyId ? { ...p, isFavorite: !p.isFavorite } : p));
    } catch (err) {
      console.error('Error toggling favorite:', err);
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

  return (
    <div className="space-y-8">
      {/* Welcome Section - text noir et fond clair */}
      <section className="premium-card rounded-2xl p-6 shadow-lg bg-white">
        <div className="mb-2">
          <h1 className="text-3xl font-poppins font-bold text-kama-text">
            Bienvenue, {user.firstName} 👋
          </h1>
          <p className="text-kama-text mt-2 font-inter">
            Découvrez les meilleures opportunités du moment.
          </p>
        </div>
      </section>

      {/* Recommended Properties Carousel */}
      <section className="premium-card rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-poppins font-bold text-text-primary mb-6">
          Offres qui pourraient vous plaire 💡
        </h2>
        
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          className="py-4"
        >
          {recommendedProperties.map((property) => (
            <SwiperSlide key={property._id}>
              <div className="premium-card overflow-hidden rounded-xl hover-lift transition-all duration-300 h-full">
                <div className="relative">
                  <img
                    src={property.images?.[0]?.url || 'https://via.placeholder.com/600x400/cccccc/000000?text=Image+Indisponible'}
                    alt={property.title}
                    className="w-full h-56 object-cover object-center hover-scale transition-all duration-500"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/600x400/cccccc/000000?text=Image+Indisponible';
                      e.target.onerror = null;
                    }}
                  />
                  <button
                    onClick={() => toggleFavorite(property._id)}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      property.isFavorite 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <i className={`fas ${property.isFavorite ? 'fa-heart' : 'fa-heart'}`}></i>
                  </button>
                  <div className="absolute top-3 left-3 bg-kama-gold text-kama-text text-xs px-2 py-1 rounded-full font-bold font-inter">
                    Nouveau
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-poppins font-semibold text-text-primary truncate">{property.title}</h3>
                  </div>
                  
                  <p className="text-text-secondary text-sm mb-4 font-inter">
                    <i className="fas fa-map-marker-alt text-kama-turquoise mr-2"></i>
                    {property.address?.city}, {property.address?.district || ''}
                  </p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-poppins font-bold text-primary-dark">
                      {formatPrice(property.price, property.currency)}
                    </span>
                  </div>
                  
                  <Link 
                    to={`/offers/${property._id}`}
                    className="w-full bg-gradient-to-r from-kama-vert to-kama-gold text-white py-2 rounded-lg font-poppins font-medium text-center block hover-lift transition-all duration-300 shadow hover:shadow-lg"
                  >
                    Voir l'offre
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Recent Searches (based on alerts) */}
      <section className="premium-card rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-poppins font-bold text-text-primary mb-6">
          Vos critères récents
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentSearches.map((search) => (
            <div 
              key={search.id} 
              className="premium-card p-4 rounded-lg hover-lift cursor-pointer transition-all duration-300 border border-gray-200 hover:border-kama-vert"
              onClick={() => console.log('Recharger la recherche:', search)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-poppins font-semibold text-text-primary">{search.city}</h3>
                  <p className="text-sm text-text-secondary font-inter">{search.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary-dark font-inter">{search.budget}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Personalized Statistics */}
      <section className="premium-card rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-poppins font-bold text-text-primary mb-6">
          Statistiques personnalisées
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="premium-card p-4 rounded-lg">
            <h3 className="font-poppins font-semibold text-text-primary mb-3">Types de biens</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.propertyTypes}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {stats.propertyTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="premium-card p-4 rounded-lg">
            <h3 className="font-poppins font-semibold text-text-primary mb-3">Répartition par villes</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.cities}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: '#1C1C1C' }} />
                  <YAxis tick={{ fill: '#1C1C1C' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#1A3C40" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="premium-card p-4 rounded-lg">
            <h3 className="font-poppins font-semibold text-text-primary mb-3">Budget moyen</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-3xl font-bold text-primary-dark font-poppins">
                {formatPrice(stats.averageBudget, 'XAF')}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}