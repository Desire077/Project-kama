import React from 'react';

export default function PropertiesGrid({ properties, onEdit, onDelete, onBoost }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'online': { text: 'Publié', class: 'bg-green-100 text-green-800' },
      'pending': { text: 'En attente', class: 'bg-yellow-100 text-yellow-800' },
      'expired': { text: 'Expiré', class: 'bg-red-100 text-red-800' },
      'sold': { text: 'Vendu', class: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status] || { text: status, class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.class}`}>
        <span className={`w-2 h-2 rounded-full mr-2 ${
          status === 'online' ? 'bg-green-500' : 
          status === 'pending' ? 'bg-yellow-500' : 
          status === 'expired' ? 'bg-red-500' : 'bg-gray-500'
        }`}></span>
        {config.text}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property, index) => (
        <div 
          key={property._id} 
          className="premium-card bg-white rounded-xl overflow-hidden hover-lift transition-all duration-300 fade-in-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* Property Image */}
          <div className="relative">
            {property.images && property.images.length > 0 ? (
              <img 
                src={property.images[0].url} 
                alt={property.title} 
                className="w-full h-56 object-cover object-center"
              />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 flex items-center justify-center">
                <i className="fas fa-home text-gray-500 text-2xl"></i>
              </div>
            )}
            
            <div className="absolute top-4 right-4">
              {getStatusBadge(property.status)}
            </div>
            
            {property.boostedUntil && new Date(property.boostedUntil) > new Date() && (
              <div className="absolute top-4 left-4 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                <i className="fas fa-rocket mr-1"></i> BOOSTÉ
              </div>
            )}
          </div>
          
          {/* Property Details */}
          <div className="p-5">
            <h3 className="font-bold text-lg text-primary-dark mb-2">{property.title}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{property.description}</p>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold text-primary-dark">
                {formatPrice(property.price)}
              </span>
              <span className="text-sm text-gray-500">
                <i className="fas fa-map-marker-alt text-luxury-gold mr-1"></i>
                {property.address?.city || 'Gabon'}
              </span>
            </div>
            
            {/* Stats */}
            <div className="flex justify-between text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <i className="fas fa-eye text-luxury-gold mr-1"></i>
                <span>{property.views || 0} vues</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-comment text-luxury-gold mr-1"></i>
                <span>{property.messages || 0} messages</span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-between">
              <button 
                onClick={() => onEdit(property)}
                className="text-primary-dark hover:text-luxury-gold transition-colors"
                title="Modifier"
              >
                <i className="fas fa-edit"></i>
              </button>
              
              <button 
                onClick={() => onBoost(property._id)}
                className="text-purple-600 hover:text-purple-800 transition-colors"
                title="Booster"
              >
                <i className="fas fa-rocket"></i>
              </button>
              
              <button 
                onClick={() => onDelete(property._id)}
                className="text-red-600 hover:text-red-800 transition-colors"
                title="Supprimer"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}