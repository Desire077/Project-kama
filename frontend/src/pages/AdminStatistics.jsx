import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axios from '../api/api'

export default function AdminStatistics(){
  const auth = useSelector(s=>s.auth)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ 
    if(auth.user && auth.user.role === 'admin') loadStats() 
  }, [auth.user])

  const loadStats = async ()=>{
    setLoading(true)
    try{
      const res = await axios.get('/api/admin/statistics')
      console.log('Received stats data:', res.data); // Debug log
      setStats(res.data)
    }catch(e){ 
      console.error('Error loading stats:', e) 
    }
    setLoading(false)
  }

  if(!auth.user || auth.user.role !== 'admin') return <div className="p-4">Accès réservé aux admins</div>

  // Helper function to safely get nested values
  const safeGet = (obj, path, defaultValue = 0) => {
    if (!obj) return defaultValue
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : defaultValue
    }, obj)
  }

  // Debug: Show what we have in stats
  if (stats) {
    console.log('Stats object structure:', Object.keys(stats));
    console.log('PropertyStatuses:', safeGet(stats, 'propertyStatuses', {}));
  }

  // If stats is null or undefined, show loading
  if (!stats && !loading) {
    return <div className="p-6">Erreur lors du chargement des statistiques</div>
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Statistiques détaillées</h2>
      
      {loading && <div className="text-center py-4">Chargement...</div>}
      
      {stats && !loading && (
        <div className="space-y-8">
          {/* Overview Stats */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Aperçu général</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-600">{safeGet(stats, 'overview.totalUsers')}</div>
                <div className="text-gray-600">Utilisateurs</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-green-600">{safeGet(stats, 'overview.totalProperties')}</div>
                <div className="text-gray-600">Propriétés</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-yellow-600">{safeGet(stats, 'overview.pendingProperties')}</div>
                <div className="text-gray-600">En attente</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-red-600">{safeGet(stats, 'overview.bannedUsers')}</div>
                <div className="text-gray-600">Utilisateurs bannis</div>
              </div>
            </div>
          </div>

          {/* User Roles */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Répartition des utilisateurs</h3>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-2xl font-bold">{safeGet(stats, 'userRoles.client')}</div>
                  <div className="text-gray-600">Clients</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-2xl font-bold">{safeGet(stats, 'userRoles.seller')}</div>
                  <div className="text-gray-600">Vendeurs</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded">
                  <div className="text-2xl font-bold">{safeGet(stats, 'userRoles.admin')}</div>
                  <div className="text-gray-600">Administrateurs</div>
                </div>
              </div>
            </div>
          </div>

          {/* Property Types */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Types de propriétés</h3>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-xl font-bold">{safeGet(stats, 'propertyTypes.maison')}</div>
                  <div className="text-gray-600">Maisons</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-xl font-bold">{safeGet(stats, 'propertyTypes.appartement')}</div>
                  <div className="text-gray-600">Appartements</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded">
                  <div className="text-xl font-bold">{safeGet(stats, 'propertyTypes.terrain')}</div>
                  <div className="text-gray-600">Terrains</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded">
                  <div className="text-xl font-bold">{safeGet(stats, 'propertyTypes.vacances')}</div>
                  <div className="text-gray-600">Vacances</div>
                </div>
                <div className="text-center p-3 bg-pink-50 rounded">
                  <div className="text-xl font-bold">{safeGet(stats, 'propertyTypes.location')}</div>
                  <div className="text-gray-600">Locations</div>
                </div>
              </div>
            </div>
          </div>

          {/* Property Statuses */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Statuts des propriétés</h3>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-yellow-50 rounded">
                  <div className="text-xl font-bold">{safeGet(stats, 'propertyStatuses.pending', 'N/A')}</div>
                  <div className="text-gray-600">En attente</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-xl font-bold">{safeGet(stats, 'propertyStatuses.approved', 'N/A')}</div>
                  <div className="text-gray-600">Approuvées</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded">
                  <div className="text-xl font-bold">{safeGet(stats, 'propertyStatuses.rejected', 'N/A')}</div>
                  <div className="text-gray-600">Rejetées</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-xl font-bold">{safeGet(stats, 'propertyStatuses.online', 'N/A')}</div>
                  <div className="text-gray-600">En ligne</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded">
                  <div className="text-xl font-bold">{safeGet(stats, 'propertyStatuses.negotiation', 'N/A')}</div>
                  <div className="text-gray-600">En négociation</div>
                </div>
                <div className="text-center p-3 bg-indigo-50 rounded">
                  <div className="text-xl font-bold">{safeGet(stats, 'propertyStatuses.sold', 'N/A')}</div>
                  <div className="text-gray-600">Vendues</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-xl font-bold">{safeGet(stats, 'propertyStatuses.removed', 'N/A')}</div>
                  <div className="text-gray-600">Supprimées</div>
                </div>
              </div>
            </div>
          </div>

          {/* Special Properties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Most Viewed Property */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-3">Propriété la plus visitée</h3>
              {safeGet(stats, 'mostViewedProperty') ? (
                <div>
                  <div className="font-medium">{safeGet(stats, 'mostViewedProperty.title', 'N/A')}</div>
                  <div className="text-sm text-gray-600">
                    Par: {safeGet(stats, 'mostViewedProperty.owner.firstName', '')} {safeGet(stats, 'mostViewedProperty.owner.lastName', '')}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Vues:</span> {safeGet(stats, 'mostViewedProperty.views', 0)}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Ville:</span> {safeGet(stats, 'mostViewedProperty.city', 'N/A')}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Prix:</span> {safeGet(stats, 'mostViewedProperty.price', 0)?.toLocaleString()} XAF
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">Aucune donnée</div>
              )}
            </div>

            {/* Most Expensive Property */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-3">Propriété la plus chère</h3>
              {safeGet(stats, 'mostExpensiveProperty') ? (
                <div>
                  <div className="font-medium">{safeGet(stats, 'mostExpensiveProperty.title', 'N/A')}</div>
                  <div className="text-sm text-gray-600">
                    Par: {safeGet(stats, 'mostExpensiveProperty.owner.firstName', '')} {safeGet(stats, 'mostExpensiveProperty.owner.lastName', '')}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Prix:</span> {safeGet(stats, 'mostExpensiveProperty.price', 0)?.toLocaleString()} XAF
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Ville:</span> {safeGet(stats, 'mostExpensiveProperty.city', 'N/A')}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">Aucune donnée</div>
              )}
            </div>
          </div>

          {/* Top Sellers */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Meilleurs vendeurs</h3>
            <div className="bg-white p-4 rounded-lg shadow">
              {Array.isArray(stats.topSellers) && stats.topSellers.length > 0 ? (
                <div className="space-y-3">
                  {stats.topSellers.slice(0, 5).map((seller, index) => (
                    <div key={seller._id || index} className="flex justify-between items-center p-3 border-b border-gray-100">
                      <div>
                        <div className="font-medium">
                          {index + 1}. {safeGet(seller, 'ownerInfo.firstName', '')} {safeGet(seller, 'ownerInfo.lastName', '')}
                        </div>
                        <div className="text-sm text-gray-600">{safeGet(seller, 'ownerInfo.email', '')}</div>
                        {safeGet(seller, 'ownerInfo.whatsapp') && (
                          <div className="text-sm text-gray-500">WhatsApp: {safeGet(seller, 'ownerInfo.whatsapp', '')}</div>
                        )}
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        {safeGet(seller, 'propertyCount', 0)} propriétés
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">Aucun vendeur trouvé</div>
              )}
            </div>
          </div>

          {/* Properties by City */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Propriétés par ville</h3>
            <div className="bg-white p-4 rounded-lg shadow">
              {Array.isArray(stats.propertiesByCity) && stats.propertiesByCity.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.propertiesByCity.slice(0, 9).map((city, index) => (
                    <div key={city._id || index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div className="font-medium">{safeGet(city, '_id', 'N/A')}</div>
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        {safeGet(city, 'count', 0)} propriétés
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">Aucune donnée</div>
              )}
            </div>
          </div>

          {/* Search Patterns */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Motifs de recherche récents</h3>
            <div className="bg-white p-4 rounded-lg shadow">
              {Array.isArray(stats.recentSearches) && stats.recentSearches.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentSearches.slice(0, 10).map((search, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border-b border-gray-100">
                      <div>
                        <div className="font-medium">
                          {safeGet(search, 'firstName', '')} {safeGet(search, 'lastName', '')}
                        </div>
                        <div className="text-sm text-gray-600">{safeGet(search, 'searchHistory.query', 'N/A')}</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {safeGet(search, 'searchHistory.timestamp') ? new Date(search.searchHistory.timestamp).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">Aucune donnée</div>
              )}
            </div>
          </div>

          {/* Popular Search Terms */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Termes de recherche populaires</h3>
            <div className="bg-white p-4 rounded-lg shadow">
              {Array.isArray(stats.popularSearchTerms) && stats.popularSearchTerms.length > 0 ? (
                <div className="space-y-3">
                  {stats.popularSearchTerms.slice(0, 10).map((term, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div className="font-medium">"{safeGet(term, '_id', 'N/A')}"</div>
                      <div className="flex space-x-4">
                        <div className="text-sm">
                          <span className="font-medium">Recherches:</span> {safeGet(term, 'count', 0)}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Résultats moyens:</span> {Math.round(safeGet(term, 'avgResults', 0))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">Aucune donnée</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}