import React, { useState } from 'react';

export default function BoostPanel({ onBoost }) {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const boostPlans = [
    {
      id: 1,
      name: "Boost 7 jours",
      price: "3 000 FCFA",
      features: [
        "Mise en première page",
        "Visibilité 3x supérieure",
        "Rapport IA détaillé"
      ],
      popular: false
    },
    {
      id: 2,
      name: "Boost 14 jours",
      price: "5 500 FCFA",
      features: [
        "Mise en première page",
        "Visibilité 5x supérieure",
        "Rapport IA détaillé",
        "Support prioritaire"
      ],
      popular: true
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
        "Analyse concurrentielle"
      ],
      popular: false
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-soft">
      <h3 className="font-poppins font-semibold text-kama-vert mb-2">Boost / Premium</h3>
      <p className="text-sm text-kama-muted mb-4">
        Boostez votre annonce pour +50% de visibilité
      </p>
      
      {/* Scarcity indicator */}
      <div className="bg-kama-dore bg-opacity-20 border border-kama-dore rounded-lg p-2 mb-4 flex items-center">
        <i className="fas fa-fire text-kama-dore mr-2"></i>
        <span className="text-xs font-medium text-kama-dore">
          Plus que <span className="font-bold">3</span> emplacements Premium disponibles cette semaine
        </span>
      </div>
      
      {/* Boost Plans */}
      <div className="space-y-3">
        {boostPlans.map((plan) => (
          <div 
            key={plan.id}
            className={`border rounded-lg p-3 relative transition-all cursor-pointer ${
              selectedPlan === plan.id 
                ? 'border-kama-dore ring-2 ring-kama-dore ring-opacity-50' 
                : 'border-gray-200 hover:border-kama-dore'
            } ${plan.popular ? 'ring-1 ring-kama-dore ring-opacity-30' : ''}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.popular && (
              <div className="absolute -top-2 left-4 bg-kama-dore text-white px-2 py-1 rounded-full text-xs font-bold">
                POPULAIRE
              </div>
            )}
            
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-poppins font-medium text-kama-text">{plan.name}</h4>
              <div className="font-poppins font-bold text-kama-dore">{plan.price}</div>
            </div>
            
            <ul className="space-y-1 mb-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start text-xs text-kama-muted">
                  <i className="fas fa-check text-kama-dore mt-1 mr-2 text-xs"></i>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <button 
              className={`w-full py-2 rounded-lg font-inter font-medium text-sm transition-all ${
                selectedPlan === plan.id
                  ? 'bg-kama-dore text-kama-vert hover:bg-opacity-90'
                  : 'bg-kama-vert text-white hover:bg-opacity-90'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (onBoost) onBoost(plan.id);
              }}
            >
              Choisir ce plan
            </button>
          </div>
        ))}
      </div>
      
      {/* Free trial offer */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
        <p className="text-xs text-kama-muted mb-2">
          Essayez gratuitement pendant 3 jours
        </p>
        <button className="text-xs text-kama-dore font-inter font-medium hover:underline">
          Commencer l'essai gratuit
        </button>
      </div>
    </div>
  );
}