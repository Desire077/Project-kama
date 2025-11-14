import React, { useState } from 'react';

export default function IAAdvicePanel({ listing, onApplyRecommendation }) {
  const [applied, setApplied] = useState(false);

  // Mock IA recommendations based on listing data
  const getRecommendations = () => {
    if (!listing) return [];
    
    const recommendations = [];
    
    // Price recommendation
    if (listing.price > 10000000) {
      recommendations.push({
        id: 1,
        title: "Ajuster le prix",
        description: "Baisser le prix de 5% pourrait augmenter les contacts de +25%",
        impact: "high",
        action: "Baisser prix de 5%"
      });
    }
    
    // Photos recommendation
    if (!listing.images || listing.images.length < 5) {
      recommendations.push({
        id: 2,
        title: "Ajouter des photos",
        description: "Ajouter 3 photos intérieures augmente vos chances de contact de +30%",
        impact: "high",
        action: "Ajouter 3 photos"
      });
    }
    
    // Boost recommendation
    if (!listing.boostedUntil || new Date(listing.boostedUntil) < new Date()) {
      recommendations.push({
        id: 3,
        title: "Booster l'annonce",
        description: "Sponsoriser pendant 7 jours pour doubler la visibilité",
        impact: "medium",
        action: "Booster 7 jours"
      });
    }
    
    return recommendations;
  };

  const recommendations = getRecommendations();
  
  const getImpactClass = (impact) => {
    return impact === 'high' ? 'bg-red-100 text-red-800' : 
           impact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
           'bg-green-100 text-green-800';
  };

  const handleApply = (recommendation) => {
    setApplied(true);
    if (onApplyRecommendation) {
      onApplyRecommendation(recommendation);
    }
    
    // Reset applied state after animation
    setTimeout(() => setApplied(false), 2000);
  };

  // Mock IA score calculation
  const iaScore = listing ? Math.min(100, Math.floor((listing.views || 0) / 2 + (listing.messages || 0) * 5)) : 0;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-poppins font-semibold text-kama-vert">Conseils IA</h3>
        <button 
          className="text-kama-dore text-sm font-inter"
          onClick={() => console.log('Open IA report')}
        >
          Voir le rapport IA
        </button>
      </div>
      
      {/* IA Score */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-kama-muted">Score IA</span>
          <span className="font-poppins font-semibold">{iaScore}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-kama-dore h-2 rounded-full" 
            style={{ width: `${iaScore}%` }}
          ></div>
        </div>
        <div className="text-xs text-kama-muted mt-1">
          {iaScore > 80 ? "Excellent" : iaScore > 60 ? "Bon" : iaScore > 40 ? "Correct" : "À améliorer"}
        </div>
      </div>
      
      {/* Recommendations */}
      <div className="space-y-3">
        {recommendations.length > 0 ? (
          recommendations.map((rec) => (
            <div key={rec.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-poppins font-medium text-kama-text text-sm">{rec.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${getImpactClass(rec.impact)}`}>
                  {rec.impact === 'high' ? 'Élevé' : rec.impact === 'medium' ? 'Moyen' : 'Faible'}
                </span>
              </div>
              <p className="text-xs text-kama-muted mb-3">{rec.description}</p>
              <button 
                onClick={() => handleApply(rec)}
                className={`w-full text-xs py-2 rounded-lg font-inter font-medium transition-all ${
                  applied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-kama-dore bg-opacity-20 text-kama-dore hover:bg-opacity-30'
                }`}
              >
                {applied ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-check mr-1"></i> Appliqué !
                  </span>
                ) : (
                  rec.action
                )}
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <i className="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
            <p className="text-sm text-kama-muted">Votre annonce est optimale !</p>
          </div>
        )}
      </div>
      
      {/* Mini-graph */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h4 className="text-xs text-kama-muted mb-2">Prix vs concurrents</h4>
        <div className="h-12 flex items-end gap-1">
          {[40, 60, 80, 100, 70, 90, 60].map((value, index) => (
            <div 
              key={index} 
              className="flex-1 bg-kama-dore rounded-t-sm"
              style={{ height: `${value}%` }}
            ></div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-kama-muted mt-1">
          <span>Votre annonce</span>
          <span className="text-kama-dore font-medium">Moyenne</span>
        </div>
      </div>
    </div>
  );
}