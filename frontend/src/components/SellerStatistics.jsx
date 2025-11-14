import React from 'react';

// Mock data for charts
const mockViewsData = [
  { day: 'Lun', views: 40 },
  { day: 'Mar', views: 30 },
  { day: 'Mer', views: 20 },
  { day: 'Jeu', views: 27 },
  { day: 'Ven', views: 18 },
  { day: 'Sam', views: 23 },
  { day: 'Dim', views: 34 }
];

const mockTrafficData = [
  { source: 'Direct', percentage: 45 },
  { source: 'Social', percentage: 25 },
  { source: 'Recommandations', percentage: 20 },
  { source: 'IA Boost', percentage: 10 }
];

export default function SellerStatistics() {
  return (
    <div className="premium-card p-6 rounded-xl">
      <h2 className="text-2xl font-bold text-primary-dark mb-6">Statistiques détaillées</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Views Chart */}
        <div>
          <h3 className="font-bold text-primary-dark mb-4">Vues par jour</h3>
          <div className="flex items-end h-40 gap-2 mt-8">
            {mockViewsData.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-gradient-to-t from-primary-dark to-luxury-gold rounded-t-lg transition-all duration-500 hover:opacity-75"
                  style={{ height: `${item.views}%` }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Traffic Sources */}
        <div>
          <h3 className="font-bold text-primary-dark mb-4">Origine du trafic</h3>
          <div className="space-y-4">
            {mockTrafficData.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.source}</span>
                  <span>{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      index === 0 ? 'bg-primary-dark' :
                      index === 1 ? 'bg-luxury-gold' :
                      index === 2 ? 'bg-gray-500' : 'bg-accent-soft'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Market Comparison */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="font-bold text-primary-dark mb-4">Comparaison avec le marché local</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-primary-dark mb-1">82%</div>
            <div className="text-sm text-gray-600">Performance par rapport à la moyenne</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-luxury-gold mb-1">+12%</div>
            <div className="text-sm text-gray-600">Taux de conversion</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-accent-soft mb-1">3.2j</div>
            <div className="text-sm text-gray-600">Temps moyen de vente</div>
          </div>
        </div>
      </div>
    </div>
  );
}