import React, { useEffect, useState } from 'react'
import { fetchAdminProperties, validateProperty } from '../api/adminPropertyClient'
import { useSelector } from 'react-redux'
import axios from '../api/api'

export default function AdminProperties(){
  const auth = useSelector(s=>s.auth)
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('pending') // pending, approved, rejected, all
  const [reason, setReason] = useState('')

  useEffect(()=>{ 
    if(auth.user && auth.user.role === 'admin') load() 
  }, [auth.user, activeTab])

  const load = async ()=>{
    setLoading(true)
    try{
      const res = await fetchAdminProperties({ status: activeTab === 'all' ? undefined : activeTab })
      setProperties(res.data.properties)
    }catch(e){ 
      console.error(e) 
    }
    setLoading(false)
  }

  const handleValidate = async (id)=>{
    const ok = confirm('Valider cette annonce ?')
    if(!ok) return
    await validateProperty(id, 'online')
    load()
  }

  const handleReject = async (id)=>{
    const r = prompt('Raison du rejet (optionnel) :')
    if(r === null) return
    await validateProperty(id, 'rejected', r)
    load()
  }

  const handleDelete = async (id) => {
    const ok = confirm('Êtes-vous sûr de vouloir supprimer cette propriété ? Cette action est irréversible.')
    if(!ok) return
    try {
      await axios.delete(`/api/admin/properties/${id}`)
      load()
    } catch (error) {
      console.error('Error deleting property:', error)
      alert('Erreur lors de la suppression de la propriété')
    }
  }

  if(!auth.user || auth.user.role !== 'admin') return <div className="p-4">Accès réservé aux admins</div>

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Gestion des annonces</h2>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'pending' ? 'border-b-2 border-kama-vert text-kama-vert' : 'text-gray-500'}`}
          onClick={() => setActiveTab('pending')}
        >
          En attente ({properties.filter(p => p.status === 'pending').length})
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'approved' ? 'border-b-2 border-kama-vert text-kama-vert' : 'text-gray-500'}`}
          onClick={() => setActiveTab('approved')}
        >
          Approuvées ({properties.filter(p => p.status === 'approved' || p.status === 'online').length})
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'rejected' ? 'border-b-2 border-kama-vert text-kama-vert' : 'text-gray-500'}`}
          onClick={() => setActiveTab('rejected')}
        >
          Rejetées ({properties.filter(p => p.status === 'rejected').length})
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'border-b-2 border-kama-vert text-kama-vert' : 'text-gray-500'}`}
          onClick={() => setActiveTab('all')}
        >
          Toutes ({properties.length})
        </button>
      </div>

      {loading && <div className="text-center py-4">Chargement...</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties
          .filter(p => activeTab === 'all' || p.status === activeTab || (activeTab === 'approved' && (p.status === 'approved' || p.status === 'online')))
          .map(p => (
          <div key={p._id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="font-bold text-lg mb-2">{p.title}</div>
            <div className="text-sm text-gray-600 mb-2">
              Par: {p.owner?.firstName} {p.owner?.lastName} ({p.owner?.email})
            </div>
            <div className="text-sm mb-2">
              <span className="font-medium">Ville:</span> {p.address?.city || 'Non spécifiée'}
            </div>
            <div className="text-sm mb-2">
              <span className="font-medium">Prix:</span> {p.price?.toLocaleString()} XAF
            </div>
            <div className="text-sm mb-3">
              <span className="font-medium">Statut:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                p.status === 'approved' || p.status === 'online' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {p.status === 'pending' ? 'En attente' : 
                 p.status === 'approved' || p.status === 'online' ? 'Approuvée' : 
                 'Rejetée'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.status === 'pending' && (
                <>
                  <button 
                    onClick={()=>handleValidate(p._id)} 
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Valider
                  </button>
                  <button 
                    onClick={()=>handleReject(p._id)} 
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Rejeter
                  </button>
                </>
              )}
              <button 
                onClick={()=>handleDelete(p._id)} 
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {properties.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          Aucune propriété trouvée
        </div>
      )}
    </div>
  )
}