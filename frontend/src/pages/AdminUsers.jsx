import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axios from '../api/api'

export default function AdminUsers(){
  const auth = useSelector(s=>s.auth)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(()=>{ 
    if(auth.user && auth.user.role === 'admin') loadUsers() 
  }, [auth.user])

  const loadUsers = async ()=>{
    setLoading(true)
    try{
      const res = await axios.get('/api/admin/users/list')
      setUsers(res.data.users)
    }catch(e){ 
      console.error(e) 
    }
    setLoading(false)
  }

  const handleBanUser = async (userId) => {
    const ok = confirm('Êtes-vous sûr de vouloir bannir cet utilisateur ?')
    if(!ok) return
    try {
      await axios.put(`/api/admin/users/${userId}/ban`)
      loadUsers()
    } catch (error) {
      console.error('Error banning user:', error)
      alert('Erreur lors du bannissement de l\'utilisateur')
    }
  }

  const handleUnbanUser = async (userId) => {
    const ok = confirm('Êtes-vous sûr de vouloir débannir cet utilisateur ?')
    if(!ok) return
    try {
      await axios.put(`/api/admin/users/${userId}/unban`)
      loadUsers()
    } catch (error) {
      console.error('Error unbanning user:', error)
      alert('Erreur lors du débannissement de l\'utilisateur')
    }
  }

  const handleDeleteUser = async (userId) => {
    const ok = confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')
    if(!ok) return
    try {
      await axios.delete(`/api/admin/users/${userId}`)
      loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Erreur lors de la suppression de l\'utilisateur')
    }
  }

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if(!auth.user || auth.user.role !== 'admin') return <div className="p-4">Accès réservé aux admins</div>

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Gestion des utilisateurs</h2>
      
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kama-vert focus:border-kama-vert"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && <div className="text-center py-4">Chargement...</div>}
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Nom</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Rôle</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Statut</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm">
                  {user.firstName} {user.lastName}
                  {user.whatsapp && (
                    <div className="text-xs text-gray-500">WhatsApp: {user.whatsapp}</div>
                  )}
                </td>
                <td className="py-3 px-4 text-sm">{user.email}</td>
                <td className="py-3 px-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'vendeur' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role === 'admin' ? 'Administrateur' : 
                     user.role === 'vendeur' ? 'Vendeur' : 
                     'Client'}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm">
                  {user.isBanned ? (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Banni</span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Actif</span>
                  )}
                </td>
                <td className="py-3 px-4 text-sm">
                  <div className="flex flex-wrap gap-2">
                    {user.isBanned ? (
                      <button 
                        onClick={() => handleUnbanUser(user._id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                      >
                        Débannir
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleBanUser(user._id)}
                        className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                      >
                        Bannir
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteUser(user._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          Aucun utilisateur trouvé
        </div>
      )}
    </div>
  )
}