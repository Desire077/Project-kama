import React, { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import propertyClient from '../api/propertyClient'
import { useNavigate } from 'react-router-dom'

// Create aliases for the functions to match the existing code
const { create: createProperty, getMyProperties, update: updateProperty, delete: deleteProperty, uploadImages: uploadPropertyImages } = propertyClient;

export default function SellerDashboard(){
  const auth = useSelector(s=>s.auth)
  const [properties, setProperties] = useState([])
  const [previewFiles, setPreviewFiles] = useState([])
  const createFileRef = useRef()
  const [creating, setCreating] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [editing, setEditing] = useState(null)
  const fileRef = useRef()
  const navigate = useNavigate()

  const [form, setForm] = useState({ title: '', description: '', type: 'location', price: '', surface: '', address: '' })

  useEffect(()=>{ if(auth.user) load() }, [auth.user, page])

  // auto-dismiss messages
  useEffect(()=>{
    if(successMessage){
      const t = setTimeout(()=>setSuccessMessage(null), 4000)
      return ()=>clearTimeout(t)
    }
  }, [successMessage])
  useEffect(()=>{
    if(error){
      const t = setTimeout(()=>setError(null), 4000)
      return ()=>clearTimeout(t)
    }
  }, [error])

  const load = async ()=>{
    setLoading(true)
    try{
      const res = await getMyProperties()
      const propertiesData = res.data || []
      setProperties(propertiesData)
    }catch(e){ setError('Impossible de charger vos annonces') }
    setLoading(false)
  }

  const startEdit = (p)=>{
    setEditing(p._id)
    setForm({ title: p.title, description: p.description, type: p.type, price: p.price, surface: p.surface, address: p.address })
  }

  const cancelEdit = ()=>{ setEditing(null); setForm({ title: '', description: '', type: 'location', price: '', surface: '', address: '' }) }

  const submitForm = async (e)=>{
    e.preventDefault()
    // client-side validation
    const errs = {}
    if(!form.title || form.title.trim().length < 3) errs.title = 'Titre trop court'
    if(!form.price || Number(form.price) <= 0) errs.price = 'Prix invalide'
    if(!form.surface || Number(form.surface) <= 0) errs.surface = 'Surface invalide'
    if(!form.address || form.address.trim().length < 3) errs.address = 'Adresse requise'
    setFieldErrors(errs)
    if(Object.keys(errs).length > 0) return
    try{
      setCreating(true)
      let created = null
      if(editing){
        await updateProperty(editing, form)
        setSuccessMessage('Annonce mise à jour')
      }else{
        const res = await createProperty(form)
        setSuccessMessage('Annonce créée')
        created = res.data.property || res.data
      }

      // If images were selected during creation, upload them
      const files = createFileRef.current?.files
      if(!editing && created && files && files.length > 0){
        const fd = new FormData()
        for (let i=0;i<files.length;i++) fd.append('images', files[i])
        await uploadPropertyImages(created._id || created.id || created, fd)
      }

      cancelEdit()
      load()
      // clear previews
      setPreviewFiles([])
    }catch(e){ setError('Erreur lors de la sauvegarde') }
    finally{ setCreating(false) }
  }

  const handleDelete = async (id)=>{
    if(!window.confirm('Supprimer cette annonce ?')) return
    await deleteProperty(id)
    load()
  }

  const handleUpload = async (id)=>{
    const files = fileRef.current?.files
    if(!files || files.length === 0) return alert('Choisir des images')
    const fd = new FormData()
    for (let i=0;i<files.length;i++) fd.append('images', files[i])
    await uploadPropertyImages(id, fd)
    fileRef.current.value = null
    load()
  }

  const handleFileSelect = (e)=>{
    const files = e.target.files
    if(!files) return
    const arr = []
    for(let i=0;i<files.length;i++){
      arr.push(URL.createObjectURL(files[i]))
    }
    setPreviewFiles(arr)
  }

  const handleBoost = async (id)=>{
    // Redirect to checkout route which will call create-payment-intent and initialize Stripe
    navigate(`/seller/pay?propertyId=${id}`)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  if(!auth.user) return <div className="p-4">Connecte-toi pour accéder à ton tableau vendeur</div>

  return (
    <div className="min-h-screen bg-bg-light py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Mes annonces</h1>
          <p className="text-text-secondary">Gérez vos annonces immobilières</p>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Property creation form */}
        <div className="premium-card rounded-2xl shadow-lg mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">
              {editing ? 'Modifier une annonce' : 'Publier une nouvelle annonce'}
            </h2>
            
            <form onSubmit={submitForm}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Titre de l'annonce *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark ${
                      fieldErrors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Belle villa avec piscine"
                  />
                  {fieldErrors.title && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.title}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Type de bien *
                  </label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                  >
                    <option value="maison">Maison</option>
                    <option value="appartement">Appartement</option>
                    <option value="terrain">Terrain</option>
                    <option value="bureau">Bureau</option>
                    <option value="commerce">Commerce</option>
                    <option value="vacances">Location de vacances</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Prix (XAF) *
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark ${
                      fieldErrors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: 50000000"
                  />
                  {fieldErrors.price && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.price}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Surface (m²) *
                  </label>
                  <input
                    type="number"
                    value={form.surface}
                    onChange={e => setForm(f => ({ ...f, surface: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark ${
                      fieldErrors.surface ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: 150"
                  />
                  {fieldErrors.surface && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.surface}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark ${
                      fieldErrors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: 123 Avenue des Palmiers, Libreville"
                  />
                  {fieldErrors.address && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.address}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                    placeholder="Décrivez votre bien en détail..."
                  ></textarea>
                </div>
              </div>
              
              {/* Image upload preview */}
              {previewFiles.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-text-primary mb-2">Aperçu des images</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {previewFiles.map((src, idx) => (
                      <div key={idx} className="relative">
                        <img 
                          src={src} 
                          alt={`Preview ${idx + 1}`} 
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-4">
                <input
                  type="file"
                  ref={createFileRef}
                  onChange={handleFileSelect}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => createFileRef.current?.click()}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-text-primary hover:bg-gray-50"
                >
                  <i className="fas fa-image mr-2"></i>
                  Ajouter des images
                </button>
                
                <div className="flex gap-3 ml-auto">
                  {editing && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-text-primary hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={creating}
                    className="premium-btn-primary px-6 py-2 rounded-lg font-bold disabled:opacity-50"
                  >
                    {creating ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        {editing ? 'Modification...' : 'Publication...'}
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i>
                        {editing ? 'Modifier' : 'Publier'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Properties list */}
        <div className="premium-card rounded-2xl shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Mes annonces ({properties.length})</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark"></div>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
                  <i className="fas fa-home text-gray-500 text-2xl"></i>
                </div>
                <h3 className="text-xl font-medium text-text-primary mb-2">Aucune annonce</h3>
                <p className="text-text-secondary mb-6">Vous n'avez pas encore publié d'annonce</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-text-primary">Annonce</th>
                      <th className="text-left py-3 px-4 font-medium text-text-primary">Prix</th>
                      <th className="text-left py-3 px-4 font-medium text-text-primary">Statut</th>
                      <th className="text-left py-3 px-4 font-medium text-text-primary">Vues</th>
                      <th className="text-left py-3 px-4 font-medium text-text-primary">Commentaires</th>
                      <th className="text-left py-3 px-4 font-medium text-text-primary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map(property => (
                      <tr key={property._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            {property.images && property.images.length > 0 ? (
                              <img 
                                src={property.images[0].url} 
                                alt={property.title} 
                                className="w-12 h-12 object-cover rounded-lg mr-3"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/600x400/cccccc/000000?text=Image';
                                  e.target.onerror = null;
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 border-2 border-dashed rounded-lg mr-3 flex items-center justify-center">
                                <i className="fas fa-image text-gray-500"></i>
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-text-primary">{property.title}</div>
                              <div className="text-sm text-text-secondary">{property.type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-medium text-text-primary">
                          {formatPrice(property.price)}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            property.status === 'online' ? 'bg-green-100 text-green-800' :
                            property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            property.status === 'negotiation' ? 'bg-blue-100 text-blue-800' :
                            property.status === 'sold' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {property.status === 'online' ? 'En ligne' :
                             property.status === 'pending' ? 'En attente' :
                             property.status === 'negotiation' ? 'En négociation' :
                             property.status === 'sold' ? 'Vendu' : 'Retiré'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-text-primary">
                          <div className="flex items-center">
                            <i className="fas fa-eye text-accent-turquoise mr-1"></i>
                            {property.views || 0}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-text-primary">
                          <div className="flex items-center">
                            <i className="fas fa-comment text-accent-turquoise mr-1"></i>
                            {property.reviewCount || 0}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(property)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Modifier"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => handleBoost(property._id || property.id)}
                              className="text-yellow-600 hover:text-yellow-800"
                              title="Booster"
                            >
                              <i className="fas fa-rocket"></i>
                            </button>
                            <input
                              type="file"
                              ref={fileRef}
                              onChange={() => handleUpload(property._id || property.id)}
                              multiple
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              onClick={() => fileRef.current?.click()}
                              className="text-green-600 hover:text-green-800"
                              title="Ajouter des images"
                            >
                              <i className="fas fa-image"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(property._id || property.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Supprimer"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}