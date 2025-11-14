import React, { useState } from 'react';

export default function SellerMessages() {
  // Mock messages data
  const [messages] = useState([
    {
      id: 1,
      buyerName: "Marie Curie",
      buyerAvatar: "MC",
      lastMessage: "Bonjour, je suis très intéressé par votre villa à Akanda. Pouvez-vous me donner plus de détails ?",
      timestamp: "2023-05-15T14:30:00Z",
      unread: true
    },
    {
      id: 2,
      buyerName: "Jean Pierre",
      buyerAvatar: "JP",
      lastMessage: "Merci pour les photos supplémentaires. Je peux venir visiter demain ?",
      timestamp: "2023-05-14T11:15:00Z",
      unread: false
    },
    {
      id: 3,
      buyerName: "Sophie Lambert",
      buyerAvatar: "SL",
      lastMessage: "Le prix est-il négociable ? J'ai vu une propriété similaire à 10% moins cher.",
      timestamp: "2023-05-13T09:45:00Z",
      unread: true
    }
  ]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="premium-card p-6 rounded-xl">
      <h2 className="text-2xl font-bold text-primary-dark mb-6">Messages / Contacts acheteurs</h2>
      
      <div className="space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
              message.unread 
                ? 'bg-luxury-gold bg-opacity-10 border-luxury-gold' 
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-primary-dark flex items-center justify-center text-white font-bold mr-4">
              {message.buyerAvatar}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-primary-dark truncate">{message.buyerName}</h3>
                <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
              </div>
              <p className={`text-sm truncate ${message.unread ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                {message.lastMessage}
              </p>
            </div>
            
            {message.unread && (
              <div className="ml-3 w-3 h-3 rounded-full bg-luxury-gold"></div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <button className="premium-btn-secondary px-4 py-2 rounded-lg font-medium">
          Voir tous les messages
        </button>
      </div>
    </div>
  );
}