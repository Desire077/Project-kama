import React, { useState } from 'react';

export default function MessagesPanel() {
  const [conversations] = useState([
    {
      id: 1,
      name: "Marie Curie",
      preview: "Bonjour, je suis très intéressé par votre villa à Akanda...",
      time: "14:30",
      unread: true,
      leadScore: "hot" // hot, warm, cold
    },
    {
      id: 2,
      name: "Jean Pierre",
      preview: "Merci pour les photos supplémentaires. Je peux venir visiter demain ?",
      time: "11:15",
      unread: false,
      leadScore: "warm"
    },
    {
      id: 3,
      name: "Sophie Lambert",
      preview: "Le prix est-il négociable ? J'ai vu une propriété similaire à 10% moins cher.",
      time: "09:45",
      unread: true,
      leadScore: "hot"
    }
  ]);

  const getLeadScoreClass = (score) => {
    return score === 'hot' ? 'bg-red-500' : 
           score === 'warm' ? 'bg-yellow-500' : 
           'bg-gray-500';
  };

  const getLeadScoreText = (score) => {
    return score === 'hot' ? 'Fort' : 
           score === 'warm' ? 'Moyen' : 
           'Faible';
  };

  const handleSendMessage = (conversationId) => {
    // In a real app, this would open WhatsApp or the internal chat
    console.log(`Sending message to conversation ${conversationId}`);
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-soft">
      <h3 className="font-poppins font-semibold text-kama-vert mb-4">Messages</h3>
      
      <div className="space-y-3">
        {conversations.map((conv) => (
          <div 
            key={conv.id} 
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              conv.unread 
                ? 'bg-kama-dore bg-opacity-10 border-kama-dore' 
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center mb-1">
                  <h4 className="font-poppins font-medium text-kama-text truncate mr-2">
                    {conv.name}
                  </h4>
                  <span className={`w-2 h-2 rounded-full ${getLeadScoreClass(conv.leadScore)}`}></span>
                  <span className="text-xs text-kama-muted ml-1">
                    {getLeadScoreText(conv.leadScore)}
                  </span>
                </div>
                <p className={`text-sm truncate ${conv.unread ? 'text-kama-text font-medium' : 'text-kama-muted'}`}>
                  {conv.preview}
                </p>
              </div>
              <div className="flex flex-col items-end ml-2">
                <span className="text-xs text-kama-muted">{conv.time}</span>
                {conv.unread && (
                  <span className="w-2 h-2 rounded-full bg-kama-dore mt-1"></span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick templates */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-xs text-kama-muted mb-2">Réponses rapides</h4>
        <div className="flex flex-wrap gap-2">
          <button 
            className="text-xs bg-kama-bg text-kama-text px-2 py-1 rounded-lg hover:bg-kama-dore hover:text-white transition-colors"
            onClick={() => handleSendMessage(1)}
          >
            Disponible visite
          </button>
          <button 
            className="text-xs bg-kama-bg text-kama-text px-2 py-1 rounded-lg hover:bg-kama-dore hover:text-white transition-colors"
            onClick={() => handleSendMessage(1)}
          >
            Prix négociable
          </button>
          <button 
            className="text-xs bg-kama-bg text-kama-text px-2 py-1 rounded-lg hover:bg-kama-dore hover:text-white transition-colors"
            onClick={() => handleSendMessage(1)}
          >
            Plus de photos
          </button>
        </div>
      </div>
      
      {/* WhatsApp CTA */}
      <button 
        className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg font-inter font-medium flex items-center justify-center hover:bg-green-700 transition-colors"
        onClick={() => window.open('https://wa.me/?text=Bonjour,%20je%20suis%20intéressé%20par%20votre%20annonce', '_blank')}
      >
        <i className="fab fa-whatsapp mr-2"></i>
        Envoyer via WhatsApp
      </button>
    </div>
  );
}