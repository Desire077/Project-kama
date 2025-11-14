import React, { useState } from 'react';

export default function ListingCard({ listing, onEdit, onDelete, onBoost, onView }) {
  const [showActions, setShowActions] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'online': { text: 'En ligne', class: 'bg-green-100 text-green-800' },
      'pending': { text: 'En attente', class: 'bg-yellow-100 text-yellow-800' },
      'negotiation': { text: 'En négociation', class: 'bg-blue-100 text-blue-800' },
      'sold': { text: 'Vendu', class: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status] || { text: status, class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transform transition duration-200 relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Property Image */}
      <div className="relative h-44 overflow-hidden rounded-t-2xl">
        {listing.images && listing.images.length > 0 ? (
          <img 
            src={listing.images[0].url} 
            alt={listing.title} 
            className={`w-full h-full object-cover transition-transform duration-300 ${showActions ? 'scale-105' : ''}`}
            loading="lazy"
          />
        ) : (
          <div className="bg-gray-200 border-2 border-dashed rounded-t-2xl w-full h-full flex items-center justify-center">
            <i className="fas fa-home text-gray-500 text-2xl"></i>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {getStatusBadge(listing.status)}
          {listing.boostedUntil && new Date(listing.boostedUntil) > new Date() && (
            <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">
              Boostée
            </span>
          )}
        </div>
        
        {/* Quick Actions Overlay */}
        {showActions && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-3 rounded-t-2xl">
            <button 
              onClick={() => onEdit(listing)}
              className="p-2 bg-white rounded-full text-kama-vert hover:bg-kama-dore hover:text-white transition-colors"
              aria-label="Modifier"
            >
              <i className="fas fa-edit"></i>
            </button>
            <button 
              onClick={() => onBoost(listing._id)}
              className="p-2 bg-white rounded-full text-purple-600 hover:bg-purple-600 hover:text-white transition-colors"
              aria-label="Booster"
            >
              <i className="fas fa-rocket"></i>
            </button>
            <button 
              onClick={() => onDelete(listing._id)}
              className="p-2 bg-white rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-colors"
              aria-label="Supprimer"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        )}
      </div>
      
      {/* Property Details */}
      <div className="p-4">
        <h3 className="font-poppins font-semibold text-kama-text truncate">{listing.title}</h3>
        <p className="text-sm text-kama-muted mt-1 truncate">
          <i className="fas fa-map-marker-alt text-kama-dore mr-1"></i>
          {listing.address?.district || listing.address?.city || 'Gabon'}
        </p>
        
        <div className="flex justify-between items-center mt-3">
          <div className="font-poppins font-bold text-kama-vert">
            {formatPrice(listing.price)}
          </div>
          <div className="flex gap-2 text-xs text-kama-muted">
            <span className="flex items-center">
              <i className="fas fa-eye text-kama-dore mr-1"></i>
              {listing.views || 0}
            </span>
            <span className="flex items-center">
              <i className="fas fa-comment text-kama-dore mr-1"></i>
              {listing.messages || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}