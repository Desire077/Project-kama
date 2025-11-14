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

  // Define chart data and colors
  const COLORS = ['#0D6EFD', '#007BFF', '#00BFA6', '#FFC107'];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Load recommended properties (mock data for now)
      const mockRecommended = [
        {
          _id: '1',
          title: 'Villa Moderne à Akanda',
          price: 15000000,
          currency: 'XAF',
          address: { city: 'Libreville', district: 'Akanda' },
          images: [
            { url: 'https://images.unsplash.com/photo-1523374547115-7d4d80884098?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' }
          ],
          isFavorite: true
        },
        {
          _id: '2',
          title: 'Appartement Moderne à Mont-Bouët',
          price: 8500000,
          currency: 'XAF',
          address: { city: 'Libreville', district: 'Mont-Bouët' },
          images: [
            { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' }
          ],
          isFavorite: false
        },
        {
          _id: '3',
          title: 'Terrain à Owendo',
          price: 6000000,
          currency: 'XAF',
          address: { city: 'Libreville', district: 'Owendo' },
          images: [
            { url: 'https://images.unsplash.com/photo-1533933269825-4f1d9dfe4d46?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' }
          ],
          isFavorite: true
        },
        {
          _id: '4',
          title: 'Maison à Bernabé',
          price: 12000000,
          currency: 'XAF',
          address: { city: 'Libreville', district: 'Bernabé' },
          images: [
            { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' }
          ],
          isFavorite: false
        },
        {
          _id: '5',
          title: 'Appartement à Ndogbong',
          price: 7500000,
          currency: 'XAF',
          address: { city: 'Libreville', district: 'Ndogbong' },
          images: [
            { url: 'https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' }
          ],
          isFavorite: true
        }
      ];
      
      // Mock recent searches
      const mockRecentSearches = [
        { id: 1, city: 'Libreville', type: 'Maison', budget: '5M - 15M FCFA' },
        { id: 2, city: 'Port-Gentil', type: 'Appartement', budget: '3M - 8M FCFA' },
        { id: 3, city: 'Franceville', type: 'Terrain', budget: '2M - 10M FCFA' }
      ];
      
      // Mock stats with Recharts data format
      const propertyTypesData = [
        { name: 'Maison', value: 45 },
        { name: 'Appartement', value: 35 },
        { name: 'Terrain', value: 15 },
        { name: 'Vacances', value: 5 }
      ];
      
      const citiesData = [
        { name: 'Libreville', value: 60 },
        { name: 'Port-Gentil', value: 20 },
        { name: 'Franceville', value: 15 },
        { name: 'Oyem', value: 5 }
      ];

      const mockStats = {
        propertyTypes: propertyTypesData,
        cities: citiesData,
        averageBudget: 10500000
      };
      
      setRecommendedProperties(mockRecommended);
      setRecentSearches(mockRecentSearches);
      setStats(mockStats);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Erreur lors du chargement des données du tableau de bord');
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

  const toggleFavorite = async (propertyId) => {
    try {
      const property = recommendedProperties.find(p => p._id === propertyId);
      if (property.isFavorite) {
        await userClient.removeFromFavorites(propertyId);
      } else {
        await userClient.addToFavorites(propertyId);
      }
      
      setRecommendedProperties(prev => 
        prev.map(p => 
          p._id === propertyId ? { ...p, isFavorite: !p.isFavorite } : p
        )
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError('Erreur lors de la mise à jour des favoris');
    }
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
      {/* Welcome Section */}
      <section className="premium-card rounded-2xl p-6 shadow-lg bg-gradient-to-r from-[#0D6EFD] to-[#007BFF] text-white">
        <div className="mb-2">
          <h1 className="text-3xl font-poppins font-bold">
            Bienvenue, {user.firstName} 👋
          </h1>
          <p className="text-white opacity-90 mt-2 font-inter">
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
                    src={property.images[0]?.url || 'https://via.placeholder.com/600x400/cccccc/000000?text=Image+Indisponible'}
                    alt={property.title}
                    className="w-full h-48 object-cover hover-scale transition-all duration-500"
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
                  <div className="absolute top-3 left-3 bg-secondary-gold text-text-primary text-xs px-2 py-1 rounded-full font-bold font-inter">
                    Nouveau
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-poppins font-semibold text-text-primary truncate">{property.title}</h3>
                  </div>
                  
                  <p className="text-text-secondary text-sm mb-4 font-inter">
                    <i className="fas fa-map-marker-alt text-accent-turquoise mr-2"></i>
                    {property.address?.city}, {property.address?.district || ''}
                  </p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-poppins font-bold text-primary-dark">
                      {formatPrice(property.price, property.currency)}
                    </span>
                  </div>
                  
                  <Link 
                    to={`/offers/${property._id}`}
                    className="w-full bg-gradient-to-r from-[#0D6EFD] to-[#007BFF] text-white py-2 rounded-lg font-poppins font-medium text-center block hover-lift transition-all duration-300 shadow hover:shadow-lg"
                  >
                    Voir l'offre
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Recent Searches */}
      <section className="premium-card rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-poppins font-bold text-text-primary mb-6">
          Vos recherches récentes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentSearches.map((search) => (
            <div 
              key={search.id} 
              className="premium-card p-4 rounded-lg hover-lift cursor-pointer transition-all duration-300 border border-gray-200 hover:border-[#0D6EFD]"
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
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
            <h3 className="font-poppins font-semibold text-text-primary mb-3">Villes préférées</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.cities}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#0D6EFD" name="Pourcentage" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="premium-card p-4 rounded-lg flex flex-col items-center justify-center">
            <h3 className="font-poppins font-semibold text-text-primary mb-2">Budget moyen</h3>
            <div className="text-2xl font-poppins font-bold text-primary-dark">
              {formatPrice(stats.averageBudget, 'XAF')}
            </div>
            <p className="text-sm text-text-secondary mt-2 text-center font-inter">
              Basé sur vos recherches récentes
            </p>
            
            <div className="mt-4 w-full">
              <div className="flex justify-between text-sm mb-1 font-inter">
                <span className="text-text-secondary">Progression</span>
                <span className="font-medium text-primary-dark">+12%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary-dark to-[#007BFF] h-2 rounded-full" 
                  style={{ width: '65%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="premium-card rounded-2xl p-6 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-poppins font-bold text-text-primary">Besoin d'aide ?</h2>
            <p className="text-text-secondary mt-1 font-inter">
              Un conseiller Project-Kama peut vous guider gratuitement.
            </p>
          </div>
          <button className="bg-gradient-to-r from-[#0D6EFD] to-[#007BFF] text-white px-6 py-3 rounded-lg font-poppins font-bold hover-lift transition-all duration-300 shadow hover:shadow-lg">
            <i className="fas fa-headset mr-2"></i> Contacter le support
          </button>
        </div>
      </section>
    </div>
  );
}