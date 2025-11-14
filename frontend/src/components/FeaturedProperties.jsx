import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const sample = [
  { id: 1, title: 'Maison familiale avec jardin', price: '350 000 XAF', city: 'Libreville', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60', views: 120, favorites: 24 },
  { id: 2, title: 'Appartement moderne centre-ville', price: '1 200 000 XAF', city: 'Port-Gentil', img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=60', views: 89, favorites: 18 },
  { id: 3, title: 'Villa avec piscine et vue mer', price: '250 000 XAF / nuit', city: 'Cité', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=60', views: 210, favorites: 42 }
]

export default function FeaturedProperties(){
  const [hoveredProperty, setHoveredProperty] = useState(null);
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (id) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gabon-beige">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Biens à la une</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Découvrez nos dernières offres sélectionnées pour vous</p>
          
          {/* Social Proof Element */}
          <div className="mt-4 flex justify-center items-center text-sm text-gray-500">
            <i className="fas fa-fire text-gabon-gold mr-1"></i>
            <span>15,000+ biens consultés cette semaine</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sample.map(p => (
            <div 
              key={p.id} 
              className="gabon-card rounded-xl overflow-hidden transition-all duration-300 hover-glow"
              onMouseEnter={() => setHoveredProperty(p.id)}
              onMouseLeave={() => setHoveredProperty(null)}
            >
              <div className="relative">
                <img src={p.img} alt={p.title} className="w-full h-64 object-cover smooth-transition" />
                <div className="absolute top-4 right-4 bg-gabon-green text-white px-3 py-1 rounded-full text-sm font-bold">
                  À vendre
                </div>
                
                {/* Interactive Favorite Button */}
                <button 
                  onClick={() => toggleFavorite(p.id)}
                  className={`absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    favorites[p.id] 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white bg-opacity-80 text-gray-700 hover:bg-red-100'
                  }`}
                  aria-label={favorites[p.id] ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  <i className={`fas ${favorites[p.id] ? 'fa-heart' : 'fa-heart-o'}`}></i>
                </button>
                
                {/* Engagement Element - Views Counter */}
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center">
                  <i className="fas fa-eye mr-1"></i> {p.views}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{p.title}</h3>
                  <div className="text-xl font-bold text-gabon-green">{p.price}</div>
                </div>
                
                <p className="text-gray-600 mt-2 flex items-center">
                  <i className="fas fa-map-marker-alt text-gabon-green mr-2"></i>
                  {p.city}
                </p>
                
                {/* Interactive Engagement Elements */}
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-500">
                    <i className="fas fa-heart text-red-500 mr-1"></i>
                    <span>{p.favorites + (favorites[p.id] ? 1 : 0)} favoris</span>
                  </div>
                  
                  {/* Scarcity Element */}
                  {hoveredProperty === p.id && (
                    <div className="text-xs bg-gabon-gold bg-opacity-20 text-gabon-gold px-2 py-1 rounded-full animate-pulse">
                      <i className="fas fa-bolt mr-1"></i> Populaire
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <Link to={`/offers/${p.id}`}>
                    <button className="w-full gabon-btn-primary py-2 rounded-lg font-medium smooth-transition">
                      Voir les détails
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/offers">
            <button className="gabon-btn-primary px-8 py-3 rounded-lg font-bold text-lg hover-glow">
              Voir toutes les offres
              <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </Link>
          
          {/* Reciprocity Element */}
          <div className="mt-6 p-3 bg-gabon-beige bg-opacity-50 rounded-lg inline-flex items-center">
            <i className="fas fa-gift text-gabon-gold mr-2"></i>
            <span className="text-sm text-gray-700">Recevez des alertes pour les nouveaux biens correspondant à vos critères</span>
          </div>
        </div>
      </div>
    </section>
  )
}