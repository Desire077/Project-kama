import React, { useState } from 'react';

export default function PremiumBoost() {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const boostPlans = [
    {
      id: 1,
      name: "Boost 7 jours",
      price: "3 000 FCFA",
      features: [
        "Mise en première page",
        "Visibilité 3x supérieure",
        "Rapport IA détaillé",
        "Support prioritaire"
      ],
      popular: true
    },
    {
      id: 2,
      name: "Boost 14 jours",
      price: "5 500 FCFA",
      features: [
        "Mise en première page",
        "Visibilité 5x supérieure",
        "Rapport IA détaillé",
        "Support prioritaire",
        "Recommandation premium"
      ],
      popular: false
    },
    {
      id: 3,
      name: "Boost 30 jours",
      price: "10 000 FCFA",
      features: [
        "Mise en première page",
        "Visibilité 8x supérieure",
        "Rapport IA détaillé",
        "Support prioritaire",
        "Recommandation premium",
        "Analyse concurrentielle"
      ],
      popular: false
    }
  ];

  return (
    <div className="premium-card p-6 rounded-xl">
      <h2 className="text-2xl font-bold text-primary-dark mb-2">Premium / Boost de Visibilité</h2>
      <p className="text-gray-600 mb-6">Augmentez la visibilité de vos annonces et vendez plus rapidement</p>
      
      {/* Scarcity Indicator */}
      <div className="bg-luxury-gold bg-opacity-20 border border-luxury-gold rounded-lg p-3 mb-6 flex items-center">
        <i className="fas fa-fire text-luxury-gold mr-2"></i>
        <span className="text-sm font-medium text-luxury-gold">
          Plus que <span className="font-bold">3</span> emplacements Premium disponibles cette semaine
        </span>
      </div>
      
      {/* Free Trial Offer */}
      <div className="bg-accent-soft bg-opacity-10 border border-accent-soft rounded-lg p-4 mb-6 text-center">
        <h3 className="font-bold text-primary-dark mb-2">Essayez gratuitement pendant 3 jours</h3>
        <p className="text-sm text-gray-700 mb-3">
          Découvrez l'impact d'un boost sur la visibilité de vos annonces
        </p>
        <button className="premium-btn-gold px-4 py-2 rounded-lg font-medium">
          Commencer l'essai gratuit
        </button>
      </div>
      
      {/* Boost Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {boostPlans.map((plan) => (
          <div 
            key={plan.id}
            className={`border rounded-xl p-6 relative transition-all duration-300 cursor-pointer ${
              selectedPlan === plan.id 
                ? 'border-luxury-gold ring-2 ring-luxury-gold ring-opacity-50' 
                : 'border-gray-200 hover:border-luxury-gold'
            } ${plan.popular ? 'ring-2 ring-luxury-gold ring-opacity-30' : ''}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-luxury-gold text-primary-dark px-4 py-1 rounded-full text-xs font-bold">
                POPULAIRE
              </div>
            )}
            
            <h3 className="font-bold text-lg text-primary-dark mb-2">{plan.name}</h3>
            <div className="text-2xl font-bold text-luxury-gold mb-4">{plan.price}</div>
            
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <i className="fas fa-check text-luxury-gold mt-1 mr-2"></i>
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button 
              className={`w-full py-3 rounded-lg font-bold transition-all duration-300 ${
                selectedPlan === plan.id
                  ? 'bg-luxury-gold text-primary-dark hover:bg-opacity-90'
                  : 'bg-primary-dark text-white hover:bg-opacity-90'
              }`}
            >
              Choisir ce plan
            </button>
          </div>
        ))}
      </div>
      
      {/* FOMO Element */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm">
          <i className="fas fa-clock mr-2"></i>
          Offre spéciale : 20% de réduction pour les 10 premiers boosters !
        </div>
      </div>
    </div>
  );
}