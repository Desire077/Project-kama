import React, { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import propertyClient from '../api/propertyClient'
import userClient from '../api/userClient'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { setUser } from '../store/slices/authSlice';
import { Link } from 'react-router-dom'

// Create aliases for the functions to match the existing code
const { create: createProperty, getMyProperties, update: updateProperty, delete: deleteProperty, uploadImages: uploadPropertyImages } = propertyClient;

export default function SimplifiedSellerDashboard(){
  const dispatch = useDispatch();
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
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0,
    totalFavorites: 0,
    avgPrice: 0,
    topProperty: null,
    totalContacts: 0
  })

  const [form, setForm] = useState({ title: '', description: '', type: 'location', price: '', surface: '', address: '' })

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    whatsapp: ''
  });

  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  // Colors for charts
  const COLORS = ['#1A3C40', '#D4AF37', '#F8F9FA', '#00BFA6', '#8884D8'];

  useEffect(()=>{ 
    if(auth.user) {
      load() 
      // Initialize settings form with user data
      setSettingsForm({
        firstName: auth.user.firstName || '',
        lastName: auth.user.lastName || '',
        email: auth.user.email || '',
        whatsapp: auth.user.whatsapp || ''
      });
    }
  }, [auth.user, page])

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
      // Handle both possible response structures
      const propertiesData = (res && res.data) ? res.data : (Array.isArray(res) ? res : [])
      setProperties(propertiesData)
      
      // Calculate statistics
      const totalProperties = propertiesData.length
      const totalViews = propertiesData.reduce((sum, prop) => sum + (prop.views || 0), 0)
      const totalFavorites = propertiesData.reduce((sum, prop) => sum + (prop.favorites || 0), 0)
      const totalContacts = propertiesData.reduce((sum, prop) => sum + (prop.contacts || 0), 0)
      const avgPrice = totalProperties > 0 
        ? Math.round(propertiesData.reduce((sum, prop) => sum + (prop.price || 0), 0) / totalProperties)
        : 0
      
      // Find top property by views
      const topProperty = propertiesData.reduce((top, prop) => 
        (prop.views || 0) > (top?.views || 0) ? prop : top, null)
      
      setStats({
        totalProperties,
        totalViews,
        totalFavorites,
        avgPrice,
        topProperty,
        totalContacts
      })
    }catch(e){ 
      console.error('Error loading properties:', e)
      setError('Impossible de charger vos annonces') 
    }
    setLoading(false)
  }

  const startEdit = (p)=>{
    setEditing(p._id)
    setForm({ 
      title: p.title || '', 
      description: p.description || '', 
      type: p.type || 'maison', 
      availability: p.availability || 'sale',
      price: p.price || '', 
      surface: p.surface || '', 
      rooms: p.rooms || '',
      bathrooms: p.bathrooms || '',
      kitchens: p.kitchens || '',
      livingRooms: p.livingRooms || '',
      terrace: p.terrace || false,
      pool: p.pool || false,
      parking: p.parking || false,
      address: p.address || { country: 'Gabon', city: '', district: '', street: '', postalCode: '' }
    })
  }

  const cancelEdit = ()=>{ setEditing(null); setForm({ title: '', description: '', type: 'location', price: '', surface: '', address: '' }) }

  const submitForm = async (e)=>{
    e.preventDefault()
    // client-side validation
    const errs = {}
    if(!form.title || form.title.trim().length < 3) errs.title = 'Titre trop court'
    if(!form.price || Number(form.price) <= 0) errs.price = 'Prix invalide'
    if(!form.surface || Number(form.surface) <= 0) errs.surface = 'Surface invalide'
    if(!form.address || !form.address.city || form.address.city.trim().length < 3) errs.address = 'Ville requise'
    setFieldErrors(errs)
    if(Object.keys(errs).length > 0) return
    try{
      setCreating(true)
      let created = null
      if(editing){
        // Convert form data to numbers where appropriate
        const data = {
          ...form,
          price: Number(form.price),
          surface: Number(form.surface),
          rooms: form.rooms ? Number(form.rooms) : undefined,
          bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
          kitchens: form.kitchens ? Number(form.kitchens) : undefined,
          livingRooms: form.livingRooms ? Number(form.livingRooms) : undefined
        };
        await updateProperty(editing, data)
        setSuccessMessage('Annonce mise à jour')
      }else{
        // Convert form data to numbers where appropriate
        const data = {
          ...form,
          price: Number(form.price),
          surface: Number(form.surface),
          rooms: form.rooms ? Number(form.rooms) : undefined,
          bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
          kitchens: form.kitchens ? Number(form.kitchens) : undefined,
          livingRooms: form.livingRooms ? Number(form.livingRooms) : undefined
        };
        const res = await createProperty(data)
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
    }catch(e){ 
      console.error('Error in submitForm:', e)
      setError('Erreur lors de la sauvegarde') 
    }
    finally{ setCreating(false) }
  }

  const handleDelete = async (id)=>{
    // Show confirmation modal instead of direct deletion
    const property = properties.find(p => p._id === id);
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  }

  const confirmDelete = async () => {
    if (!propertyToDelete) return;
    
    try {
      await deleteProperty(propertyToDelete._id);
      setShowDeleteModal(false);
      setPropertyToDelete(null);
      load();
      setSuccessMessage('Annonce supprimée avec succès');
    } catch (err) {
      setError('Erreur lors de la suppression de l\'annonce');
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPropertyToDelete(null);
  };

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

  // Handle settings form changes
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettingsForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save profile changes
  const saveProfileChanges = async (e) => {
    e.preventDefault();
    try {
      const response = await userClient.updateProfile(settingsForm);
      // Update user in Redux store
      dispatch(setUser(response.user));
      setSuccessMessage('Profil mis à jour avec succès');
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
      console.error('Error updating profile:', err);
    }
  };

  // Change password
  const changePassword = async (e) => {
    e.preventDefault();
    
    // Validate password form
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Tous les champs sont requis');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    try {
      // Add the change password endpoint to userClient
      await userClient.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSuccessMessage('Mot de passe modifié avec succès');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
      console.error('Error changing password:', err);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'online': { text: 'En ligne', class: 'bg-green-100 text-green-800' },
      'pending': { text: 'En attente', class: 'bg-yellow-100 text-yellow-800' },
      'negotiation': { text: 'En négociation', class: 'bg-blue-100 text-blue-800' },
      'sold': { text: 'Vendu', class: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status] || { text: status, class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.text}
      </span>
    );
  };

  if(!auth.user) return <div className="p-4">Connecte-toi pour accéder à ton tableau vendeur</div>

  return (
    <div> 
      {/* Enhanced Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <div className="flex items-center">
              <span className="bg-[#D4AF37] text-[#1A3C40] rounded-lg px-2 py-1 mr-2 font-bold text-lg">K</span>
              <span className="font-bold text-[#1A3C40] hidden sm:inline font-poppins">KAMA</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* User info */}
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#1A3C40] font-bold mr-3 font-poppins">
                {auth.user?.firstName?.charAt(0) || auth.user?.email?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block">
                <div className="font-semibold text-[#1A3C40] font-poppins">
                  {auth.user?.firstName || auth.user?.email}
                </div>
                <div className="text-xs text-gray-500 font-inter flex items-center">
                  Vendeur vérifié
                  {auth.user?.subscription?.active && (
                    <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">
                      Premium
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* New property button */}
            <button 
              onClick={() => navigate('/vendre')}
              className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-4 py-2 rounded-full shadow font-poppins font-semibold text-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              + Nouvelle annonce
            </button>
          </div>
        </div>
      </header>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <i className="fas fa-exclamation-triangle text-red-600"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Supprimer l'annonce</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
                </p>
                {propertyToDelete && (
                  <p className="text-sm font-medium text-gray-900 mt-2">
                    "{propertyToDelete.title}"
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-poppins font-semibold text-[#1A3C40]">Navigation</h2>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors font-inter ${
                    activeTab === 'overview' 
                      ? 'bg-[#1A3C40] text-white' 
                      : 'text-[#1A3C40] hover:bg-gray-100'
                  }`}
                >
                  <i className="fas fa-chart-line mr-3"></i>
                  <span>Vue d'ensemble</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('listings')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors font-inter ${
                    activeTab === 'listings' 
                      ? 'bg-[#1A3C40] text-white' 
                      : 'text-[#1A3C40] hover:bg-gray-100'
                  }`}
                >
                  <i className="fas fa-home mr-3"></i>
                  <span>Mes annonces</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('statistics')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors font-inter ${
                    activeTab === 'statistics' 
                      ? 'bg-[#1A3C40] text-white' 
                      : 'text-[#1A3C40] hover:bg-gray-100'
                  }`}
                >
                  <i className="fas fa-chart-bar mr-3"></i>
                  <span>Statistiques</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('boost')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors font-inter ${
                    activeTab === 'boost' 
                      ? 'bg-[#1A3C40] text-white' 
                      : 'text-[#1A3C40] hover:bg-gray-100'
                  }`}
                >
                  <i className="fas fa-rocket mr-3"></i>
                  <span>
                    Premium / Boost
                    {auth.user?.subscription?.active && (
                      <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">
                        Premium
                      </span>
                    )}
                  </span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors font-inter ${
                    activeTab === 'settings' 
                      ? 'bg-[#1A3C40] text-white' 
                      : 'text-[#1A3C40] hover:bg-gray-100'
                  }`}
                >
                  <i className="fas fa-cog mr-3"></i>
                  <span>Paramètres</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
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

          {/* Dashboard Overview */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in">
              <header className="mb-6">
                <h1 className="text-2xl font-poppins font-semibold text-[#1A3C40]">
                  Vue d'ensemble
                </h1>
                <p className="text-gray-600 font-inter">Voici les performances de vos annonces</p>
              </header>

              {/* Performance Metrics Overview */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <i className="fas fa-eye text-blue-600"></i>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-500 font-inter">+12%</div>
                      <div className="text-xs text-gray-500 font-inter">ce mois</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#1A3C40] mb-1 font-poppins">{stats.totalViews}</div>
                  <div className="text-sm text-gray-600 font-inter">Vues totales</div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <i className="fas fa-comment text-green-600"></i>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-500 font-inter">+8%</div>
                      <div className="text-xs text-gray-500 font-inter">ce mois</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#1A3C40] mb-1 font-poppins">{stats.totalContacts}</div>
                  <div className="text-sm text-gray-600 font-inter">Contacts reçus</div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <i className="fas fa-heart text-purple-600"></i>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-500 font-inter">+5%</div>
                      <div className="text-xs text-gray-500 font-inter">ce mois</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#1A3C40] mb-1 font-poppins">{stats.totalFavorites}</div>
                  <div className="text-sm text-gray-600 font-inter">Mises en favori</div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#1A3C40] flex items-center justify-center">
                      <i className="fas fa-home text-[#D4AF37]"></i>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-500 font-inter">+3%</div>
                      <div className="text-xs text-gray-500 font-inter">ce mois</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#1A3C40] mb-1 font-poppins">{stats.totalProperties}</div>
                  <div className="text-sm text-gray-600 font-inter">Annonces actives</div>
                </div>
              </section>
            </div>
          )}

          {/* Property Listings */}
          {activeTab === 'listings' && (
            <div className="animate-fade-in">
              <header className="mb-6">
                <h1 className="text-2xl font-poppins font-semibold text-[#1A3C40]">
                  Mes annonces
                </h1>
                <p className="text-gray-600 font-inter">Gérez toutes vos annonces immobilières</p>
              </header>

              <section className="bg-white rounded-2xl p-6 shadow-soft mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-poppins font-semibold text-lg text-[#1A3C40]">Toutes mes annonces</h2>
                  <button 
                    onClick={() => navigate('/vendre')}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-4 py-2 rounded-full shadow text-sm font-poppins font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    + Nouvelle annonce
                  </button>
                </div>
                
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                ) : properties.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
                      <i className="fas fa-home text-gray-500 text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-[#1A3C40] mb-2 font-poppins">Aucune annonce pour l'instant</h3>
                    <p className="text-gray-600 mb-6 font-inter">Publiez votre première annonce</p>
                    <button
                      onClick={() => navigate('/vendre')}
                      className="bg-gradient-to-r from-[#1A3C40] to-[#00BFA6] text-white px-6 py-3 rounded-lg font-medium font-poppins"
                    >
                      Créer une annonce
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map(property => (
                      <div 
                        key={property._id} 
                        className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transform transition duration-200 relative group"
                      >
                        {/* Property Image */}
                        <div className="relative h-44 overflow-hidden rounded-t-2xl">
                          {property.images && property.images.length > 0 ? (
                            <img 
                              src={property.images[0].url} 
                              alt={property.title} 
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="bg-gray-200 border-2 border-dashed rounded-t-2xl w-full h-full flex items-center justify-center">
                              <i className="fas fa-home text-gray-500 text-2xl"></i>
                            </div>
                          )}
                          
                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex gap-2">
                            {getStatusBadge(property.status)}
                            {property.boostedUntil && new Date(property.boostedUntil) > new Date() && (
                              <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold font-inter">
                                Boostée
                              </span>
                            )}
                            {auth.user?.subscription?.active && (
                              <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-2 py-1 rounded-full text-xs font-bold font-inter">
                                Premium
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Property Details */}
                        <div className="p-4">
                          <h3 className="font-poppins font-semibold text-[#1A3C40] truncate">{property.title}</h3>
                          <p className="text-sm text-gray-600 mt-1 truncate font-inter">
                            <i className="fas fa-map-marker-alt text-[#D4AF37] mr-1"></i>
                            {property.address?.district || property.address?.city || 'Gabon'}
                          </p>
                          
                          <div className="flex justify-between items-center mt-3">
                            <div className="font-poppins font-bold text-[#1A3C40]">
                              {formatPrice(property.price)}
                            </div>
                            <div className="flex gap-2 text-xs text-gray-600 font-inter">
                              <span className="flex items-center">
                                <i className="fas fa-eye text-[#D4AF37] mr-1"></i>
                                {property.views || 0}
                              </span>
                              <span className="flex items-center">
                                <i className="fas fa-comment text-[#D4AF37] mr-1"></i>
                                {property.messages || 0}
                              </span>
                            </div>
                          </div>
                          
                          {/* Quick Actions */}
                          <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                            <Link 
                              to={`/offers/${property._id}/edit`}
                              className="text-[#1A3C40] hover:text-[#D4AF37] flex items-center text-sm font-inter"
                            >
                              <i className="fas fa-edit mr-1"></i> Modifier
                            </Link>
                            <button 
                              onClick={() => handleBoost(property._id)}
                              className="text-purple-600 hover:text-purple-800 flex items-center text-sm font-inter"
                            >
                              <i className="fas fa-rocket mr-1"></i> Booster
                            </button>
                            <button 
                              onClick={() => handleDelete(property._id)}
                              className="text-red-600 hover:text-red-800 flex items-center text-sm font-inter"
                            >
                              <i className="fas fa-trash mr-1"></i> Supprimer
                            </button>
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Statistics */}
          {activeTab === 'statistics' && (
            <div className="animate-fade-in">
              <header className="mb-6">
                <h1 className="text-2xl font-poppins font-semibold text-[#1A3C40]">
                  Statistiques détaillées
                </h1>
                <p className="text-gray-600 font-inter">Analysez la performance de vos annonces</p>
              </header>

              {/* Performance Metrics */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                  <div className="text-sm text-gray-600 font-inter mb-2">Vues totales</div>
                  <div className="text-3xl font-bold text-[#1A3C40] font-poppins">{stats.totalViews}</div>
                  <div className="text-sm text-green-500 mt-1 font-inter">+{Math.round(stats.totalViews/10)} par annonce</div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                  <div className="text-sm text-gray-600 font-inter mb-2">Contacts reçus</div>
                  <div className="text-3xl font-bold text-[#1A3C40] font-poppins">{stats.totalContacts}</div>
                  <div className="text-sm text-green-500 mt-1 font-inter">+{Math.round(stats.totalContacts/5)} par annonce</div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                  <div className="text-sm text-gray-600 font-inter mb-2">Favoris</div>
                  <div className="text-3xl font-bold text-[#1A3C40] font-poppins">{stats.totalFavorites}</div>
                  <div className="text-sm text-green-500 mt-1 font-inter">Taux de conversion: {stats.totalViews > 0 ? Math.round((stats.totalContacts/stats.totalViews)*100) : 0}%</div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                  <div className="text-sm text-gray-600 font-inter mb-2">Annonces actives</div>
                  <div className="text-3xl font-bold text-[#1A3C40] font-poppins">{stats.totalProperties}</div>
                  <div className="text-sm text-gray-600 mt-1 font-inter">Toutes catégories</div>
                </div>
              </section>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Views by Property */}
                <section className="bg-white rounded-2xl p-6 shadow-soft">
                  <h2 className="font-poppins font-semibold text-lg text-[#1A3C40] mb-4">Vues par annonce</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={properties.slice(0, 5).map(property => ({
                          name: property.title.length > 15 ? property.title.substring(0, 15) + '...' : property.title,
                          views: property.views || 0,
                          favorites: property.favorites || 0,
                          contacts: property.contacts || 0
                        }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="views" fill="#1A3C40" name="Vues" />
                        <Bar dataKey="favorites" fill="#D4AF37" name="Favoris" />
                        <Bar dataKey="contacts" fill="#00BFA6" name="Contacts" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* Property Types Distribution */}
                <section className="bg-white rounded-2xl p-6 shadow-soft">
                  <h2 className="font-poppins font-semibold text-lg text-[#1A3C40] mb-4">Distribution par type d'annonce</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={properties.reduce((acc, property) => {
                            const existing = acc.find(item => item.name === property.type);
                            if (existing) {
                              existing.value += 1;
                            } else {
                              acc.push({ name: property.type, value: 1 });
                            }
                            return acc;
                          }, [])}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {properties.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* Boost Tab */}
          {activeTab === 'boost' && (
            <div className="animate-fade-in">
              <header className="mb-6">
                <h1 className="text-2xl font-poppins font-semibold text-[#1A3C40]">
                  Boostez vos annonces
                </h1>
                <p className="text-gray-600 font-inter">Augmentez la visibilité de vos annonces</p>
              </header>

              {auth.user?.subscription?.active ? (
                <div className="bg-gradient-to-br from-[#1A3C40] to-[#00BFA6] rounded-2xl p-6 text-white mb-6">
                  <h2 className="font-bold text-xl mb-4 font-poppins">Félicitations ! Vous êtes Premium</h2>
                  <p className="font-inter">Profitez de tous les avantages premium pour maximiser vos ventes</p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-[#1A3C40] to-[#00BFA6] rounded-2xl p-6 text-white mb-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4 flex-1">
                      <h2 className="text-xl font-bold font-poppins">Débloquez les avantages Premium</h2>
                      <p className="font-inter">Passez à l'offre premium pour des fonctionnalités avancées</p>
                    </div>
                    <button 
                      onClick={() => navigate('/premium')}
                      className="bg-white text-[#1A3C40] px-4 py-2 rounded-lg font-bold font-poppins hover:bg-gray-100 transition-colors"
                    >
                      Passer Premium
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <h2 className="font-poppins font-semibold text-lg text-[#1A3C40] mb-4">Comment ça marche ?</h2>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-[#1A3C40] flex items-center justify-center mr-4 flex-shrink-0">
                          <span className="text-[#D4AF37] font-bold">1</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#1A3C40] font-inter">Sélectionnez une annonce</h3>
                          <p className="text-gray-600 font-inter">Choisissez l'annonce que vous souhaitez booster</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-[#1A3C40] flex items-center justify-center mr-4 flex-shrink-0">
                          <span className="text-[#D4AF37] font-bold">2</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#1A3C40] font-inter">Choisissez une durée</h3>
                          <p className="text-gray-600 font-inter">7, 14 ou 30 jours de mise en avant</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-[#1A3C40] flex items-center justify-center mr-4 flex-shrink-0">
                          <span className="text-[#D4AF37] font-bold">3</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#1A3C40] font-inter">Payez et boostez</h3>
                          <p className="text-gray-600 font-inter">Votre annonce apparaîtra en tête des résultats</p>
                        </div>
                      </div>
                    </div>
                    
                    {auth.user?.subscription?.active && (
                      <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h3 className="font-bold text-purple-800 mb-2 font-poppins">Avantages Premium Débloqués</h3>
                        <ul className="space-y-2 text-purple-700 font-inter">
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Boost automatique pour toutes vos nouvelles annonces</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Analyses avancées et statistiques détaillées</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Support prioritaire et assistance dédiée</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1A3C40] to-[#00BFA6] rounded-2xl p-6 text-white">
                  <h2 className="font-bold text-xl mb-4 font-poppins">Avantages du Boost</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-[#D4AF37] mt-1 mr-3"></i>
                      <span className="font-inter">Visibilité maximale pendant la durée du boost</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-[#D4AF37] mt-1 mr-3"></i>
                      <span className="font-inter">Jusqu'à 5x plus de vues</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-[#D4AF37] mt-1 mr-3"></i>
                      <span className="font-inter">Priorité dans les résultats de recherche</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-[#D4AF37] mt-1 mr-3"></i>
                      <span className="font-inter">Badge "Boosté" sur votre annonce</span>
                    </li>
                  </ul>
                  <div className="mt-6 p-4 bg-white bg-opacity-10 rounded-lg">
                    <div className="text-sm font-inter">Tarif unique</div>
                    <div className="text-2xl font-bold font-poppins">5 000 FCFA</div>
                    <div className="text-sm font-inter">Pour 7 jours de boost</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in">
              <header className="mb-6">
                <h1 className="text-2xl font-poppins font-semibold text-[#1A3C40]">
                  Paramètres du compte
                </h1>
                <p className="text-gray-600 font-inter">Gérez vos préférences et informations personnelles</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <h2 className="font-poppins font-semibold text-lg text-[#1A3C40] mb-4">Informations du compte</h2>
                    <form onSubmit={saveProfileChanges} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">Nom complet</label>
                        <input 
                          type="text" 
                          name="firstName"
                          value={settingsForm.firstName}
                          onChange={handleSettingsChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C40] font-inter"
                          placeholder="Prénom"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">Nom de famille</label>
                        <input 
                          type="text" 
                          name="lastName"
                          value={settingsForm.lastName}
                          onChange={handleSettingsChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C40] font-inter"
                          placeholder="Nom de famille"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">Email</label>
                        <input 
                          type="email" 
                          name="email"
                          value={settingsForm.email}
                          onChange={handleSettingsChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C40] font-inter"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">Numéro WhatsApp</label>
                        <input 
                          type="text" 
                          name="whatsapp"
                          value={settingsForm.whatsapp}
                          onChange={handleSettingsChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C40] font-inter"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="bg-[#1A3C40] text-white px-6 py-2 rounded-lg font-inter hover:bg-[#0D2A2D] transition-colors"
                      >
                        Enregistrer les modifications
                      </button>
                    </form>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <h2 className="font-poppins font-semibold text-lg text-[#1A3C40] mb-4">Préférences</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-[#1A3C40] font-inter">Notifications par email</div>
                          <div className="text-sm text-gray-600 font-inter">Recevoir des notifications par email</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1A3C40]"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-[#1A3C40] font-inter">Notifications WhatsApp</div>
                          <div className="text-sm text-gray-600 font-inter">Recevoir des notifications par WhatsApp</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1A3C40]"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <h2 className="font-poppins font-semibold text-lg text-[#1A3C40] mb-4">Sécurité</h2>
                    <form onSubmit={changePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">Mot de passe actuel</label>
                        <input 
                          type="password" 
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C40] font-inter"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">Nouveau mot de passe</label>
                        <input 
                          type="password" 
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C40] font-inter"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">Confirmer le nouveau mot de passe</label>
                        <input 
                          type="password" 
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C40] font-inter"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full bg-[#1A3C40] text-white px-4 py-2 rounded-lg font-inter hover:bg-[#0D2A2D] transition-colors text-center"
                      >
                        Changer le mot de passe
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}