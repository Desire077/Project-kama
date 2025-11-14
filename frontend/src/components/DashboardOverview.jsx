import React from 'react';

export default function DashboardOverview({ stats }) {
  // Mock AI score calculation
  const aiScore = Math.min(100, Math.round((stats.totalViews / 10) + (stats.totalFavorites / 2)));
  
  // Mock market insights
  const marketInsights = [
    "Les maisons à Akanda similaires à la vôtre se vendent 12 % moins cher.",
    "Les annonces avec 5 photos ou plus ont 3x plus de chances d'être vues.",
    "La demande sur les terrains à Owendo a augmenté de 18 % ce mois-ci."
  ];

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="premium-card p-6 rounded-xl">
        <h2 className="text-2xl font-bold text-primary-dark mb-6">Vue d'ensemble des performances</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-primary-dark">{stats.totalViews}</div>
            <div className="text-sm text-gray-600">Vues totales</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-primary-dark">{stats.totalContacts || 0}</div>
            <div className="text-sm text-gray-600">Contacts reçus</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-primary-dark">{stats.scheduledVisits || 0}</div>
            <div className="text-sm text-gray-600">Visites planifiées</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-primary-dark">{stats.visibilityRate || 0}%</div>
            <div className="text-sm text-gray-600">Taux de visibilité</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-luxury-gold">{aiScore}/100</div>
            <div className="text-sm text-gray-600">Score IA</div>
          </div>
        </div>
        
        {/* AI Performance Message */}
        <div className="bg-luxury-gold bg-opacity-10 border border-luxury-gold rounded-lg p-4">
          <div className="flex items-start">
            <i className="fas fa-robot text-luxury-gold text-xl mr-3 mt-1"></i>
            <div>
              <h3 className="font-bold text-primary-dark mb-1">Votre performance IA</h3>
              <p className="text-sm text-gray-700">
                {aiScore > 80 
                  ? "Excellent travail ! Votre annonce performe très bien." 
                  : aiScore > 60 
                    ? "Votre offre performe bien, mais les photos pourraient être améliorées pour +15 % de visibilité."
                    : "Améliorez votre description et ajoutez plus de photos pour augmenter votre score."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights and Market Analysis */}
      <div className="premium-card p-6 rounded-xl">
        <h2 className="text-2xl font-bold text-primary-dark mb-6">Conseils IA et Analyse de Marché</h2>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-2/3">
            <div className="bg-primary-dark bg-opacity-5 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-3">
                <i className="fas fa-brain text-luxury-gold text-xl mr-2"></i>
                <h3 className="font-bold text-primary-dark">Recommandations personnalisées</h3>
              </div>
              <ul className="space-y-2">
                {marketInsights.map((insight, index) => (
                  <li key={index} className="flex items-start">
                    <i className="fas fa-lightbulb text-luxury-gold mt-1 mr-2"></i>
                    <span className="text-sm text-gray-700">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <button className="premium-btn-gold px-4 py-2 rounded-lg font-medium">
              Voir mon rapport détaillé
            </button>
          </div>
          
          <div className="md:w-1/3">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-primary-dark mb-3">Comparaison de performance</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Vos vues</span>
                    <span>{stats.totalViews}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-luxury-gold h-2 rounded-full" 
                      style={{ width: `${Math.min(100, stats.totalViews / 5)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Moyenne du site</span>
                    <span>150</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-dark h-2 rounded-full" 
                      style={{ width: '60%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}