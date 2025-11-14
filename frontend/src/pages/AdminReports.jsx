import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axios from '../api/api'

export default function AdminReports(){
  const auth = useSelector(s=>s.auth)
  const [reportedProperties, setReportedProperties] = useState([])
  const [reportedComments, setReportedComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('properties') // properties, comments
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteAction, setDeleteAction] = useState({ type: '', id: '', propertyId: '' })
  const [showBanModal, setShowBanModal] = useState(false)
  const [banAction, setBanAction] = useState({ userId: '', userName: '' })

  useEffect(()=>{ 
    if(auth.user && auth.user.role === 'admin') loadReports() 
  }, [auth.user, activeTab])

  const loadReports = async ()=>{
    setLoading(true)
    try{
      const [propertiesRes, commentsRes] = await Promise.all([
        axios.get('/api/admin/reports/properties'),
        axios.get('/api/admin/reports/comments')
      ])
      setReportedProperties(propertiesRes.data.properties)
      setReportedComments(commentsRes.data.comments)
    }catch(e){ 
      console.error(e) 
    }
    setLoading(false)
  }

  const openDeleteModal = (type, id, propertyId = '') => {
    setDeleteAction({ type, id, propertyId })
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setDeleteAction({ type: '', id: '', propertyId: '' })
  }

  const openBanModal = (userId, userName) => {
    setBanAction({ userId, userName })
    setShowBanModal(true)
  }

  const closeBanModal = () => {
    setShowBanModal(false)
    setBanAction({ userId: '', userName: '' })
  }

  const handleDeleteProperty = async () => {
    try {
      await axios.delete(`/api/admin/properties/${deleteAction.id}`)
      loadReports()
      closeDeleteModal()
    } catch (error) {
      console.error('Error deleting property:', error)
      alert('Erreur lors de la suppression de la propriété')
    }
  }

  const handleDeleteComment = async () => {
    try {
      await axios.delete(`/api/properties/${deleteAction.propertyId}/comments/${deleteAction.id}`)
      loadReports()
      closeDeleteModal()
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Erreur lors de la suppression du commentaire')
    }
  }

  const handleBanUser = async () => {
    try {
      await axios.put(`/api/admin/users/${banAction.userId}/ban`)
      loadReports()
      closeBanModal()
    } catch (error) {
      console.error('Error banning user:', error)
      alert('Erreur lors du bannissement de l\'utilisateur')
    }
  }

  if(!auth.user || auth.user.role !== 'admin') return <div className="p-4">Accès réservé aux admins</div>

  return (
    <div className="p-6">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-kama-text mb-4">
                Confirmer la suppression
              </h3>
              <p className="text-kama-muted mb-6">
                Êtes-vous sûr de vouloir supprimer {deleteAction.type === 'property' ? 'cette propriété' : 'ce commentaire'} ? Cette action est irréversible.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="px-6 py-3 border border-kama-vert text-kama-vert rounded-xl font-medium hover:bg-kama-vert hover:text-white transition"
                >
                  Annuler
                </button>
                <button
                  onClick={deleteAction.type === 'property' ? handleDeleteProperty : handleDeleteComment}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ban Confirmation Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-ban text-red-600 text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-kama-text mb-4">
                Confirmer le bannissement
              </h3>
              <p className="text-kama-muted mb-6">
                Êtes-vous sûr de vouloir bannir l'utilisateur <strong>{banAction.userName}</strong> ? Cette action limitera son accès à la plateforme.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closeBanModal}
                  className="px-6 py-3 border border-kama-vert text-kama-vert rounded-xl font-medium hover:bg-kama-vert hover:text-white transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleBanUser}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
                >
                  Bannir l'utilisateur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6">Contenu signalé</h2>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'properties' ? 'border-b-2 border-kama-vert text-kama-vert' : 'text-gray-500'}`}
          onClick={() => setActiveTab('properties')}
        >
          Propriétés signalées ({reportedProperties.length})
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'comments' ? 'border-b-2 border-kama-vert text-kama-vert' : 'text-gray-500'}`}
          onClick={() => setActiveTab('comments')}
        >
          Commentaires signalés ({reportedComments.length})
        </button>
      </div>

      {loading && <div className="text-center py-4">Chargement...</div>}
      
      {activeTab === 'properties' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportedProperties.map(property => (
            <div key={property._id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="font-bold text-lg mb-2">
                <a href={`/offers/${property._id}`} target="_blank" rel="noopener noreferrer" className="text-kama-vert hover:underline">
                  {property.title}
                </a>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Par: {property.owner?.firstName} {property.owner?.lastName} ({property.owner?.email})
              </div>
              <div className="text-sm mb-2">
                <span className="font-medium">Ville:</span> {property.address?.city || 'Non spécifiée'}
              </div>
              <div className="text-sm mb-3">
                <span className="font-medium">Signalements:</span> {property.reports?.length || 0}
              </div>
              
              {/* Reports list */}
              <div className="mb-4">
                <h4 className="font-medium text-sm mb-2">Raisons des signalements:</h4>
                <ul className="text-xs space-y-1">
                  {property.reports?.slice(0, 3).map((report, index) => (
                    <li key={index} className="bg-gray-100 p-2 rounded">
                      <div className="font-medium">
                        Par: {report.reportedBy?.firstName} {report.reportedBy?.lastName}
                      </div>
                      <div className="text-gray-600">{report.reason}</div>
                      <div className="text-gray-400 text-xs">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </li>
                  ))}
                  {property.reports?.length > 3 && (
                    <li className="text-gray-500 text-xs">
                      + {property.reports.length - 3} signalement(s) supplémentaire(s)
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => openDeleteModal('property', property._id)} 
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Supprimer
                </button>
                <button 
                  onClick={() => openBanModal(property.owner?._id, `${property.owner?.firstName} ${property.owner?.lastName}`)} 
                  className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                >
                  Bannir utilisateur
                </button>
              </div>
            </div>
          ))}
          
          {reportedProperties.length === 0 && !loading && (
            <div className="col-span-full text-center py-8 text-gray-500">
              Aucune propriété signalée
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'comments' && (
        <div className="grid grid-cols-1 gap-4">
          {reportedComments.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="font-bold text-lg mb-2">
                Propriété: <a href={`/offers/${item.property?.id}`} target="_blank" rel="noopener noreferrer" className="text-kama-vert hover:underline">
                  {item.property?.title}
                </a>
              </div>
              <div className="mb-3 p-3 bg-gray-50 rounded">
                <div className="font-medium mb-1">
                  Commentaire par: {item.comment?.user?.firstName} {item.comment?.user?.lastName}
                </div>
                <div className="text-gray-700 mb-2">
                  "{item.comment?.text}"
                </div>
                <div className="text-sm text-gray-500">
                  Posté le: {new Date(item.comment?.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-sm mb-2">Raisons des signalements:</h4>
                <ul className="text-xs space-y-1">
                  {item.comment?.reports?.slice(0, 3).map((report, reportIndex) => (
                    <li key={reportIndex} className="bg-gray-100 p-2 rounded">
                      <div className="font-medium">
                        Par: {report.reportedBy?.firstName} {report.reportedBy?.lastName}
                      </div>
                      <div className="text-gray-600">{report.reason}</div>
                      <div className="text-gray-400 text-xs">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </li>
                  ))}
                  {item.comment?.reports?.length > 3 && (
                    <li className="text-gray-500 text-xs">
                      + {item.comment.reports.length - 3} signalement(s) supplémentaire(s)
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => openDeleteModal('comment', item.comment?.id, item.property?.id)} 
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Supprimer le commentaire
                </button>
                <button 
                  onClick={() => openBanModal(item.comment?.user?._id, `${item.comment?.user?.firstName} ${item.comment?.user?.lastName}`)} 
                  className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                >
                  Bannir utilisateur
                </button>
              </div>
            </div>
          ))}
          
          {reportedComments.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              Aucun commentaire signalé
            </div>
          )}
        </div>
      )}
    </div>
  )
}