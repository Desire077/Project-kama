import React, { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import propertyClient from '../api/propertyClient'
import userClient from '../api/userClient'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

// Create aliases for the functions to match the existing code
const { create: createProperty, getMyProperties, update: updateProperty, delete: deleteProperty, uploadImages: uploadPropertyImages } = propertyClient;

export default function EnhancedSellerDashboard(){
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
    totalContacts: 0,
    visibilityRate: 0,
    iaScore: 0
  })
  const [iaAdvice, setIaAdvice] = useState([])
  const [messages, setMessages] = useState([])
  const [notifications, setNotifications] = useState([])

  const [form, setForm] = useState({ title: '', description: '', type: 'location', price: '', surface: '', address: '' })

  // Colors for charts
  const COLORS = ['#1A3C40', '#D4AF37', '#F8F9FA', '#00BFA6', '#8884D8'];

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
      
      // Calculate visibility rate (simplified)
      const visibilityRate = totalProperties > 0 ? Math.min(100, Math.round((totalViews / totalProperties) / 10)) : 0
      
      // IA Score (simplified)
      const iaScore = Math.min(100, Math.round((visibilityRate + (totalContacts > 0 ? 20 : 0) + (totalFavorites > 0 ? 15 : 0)) / 3))
      
      setStats({
        totalProperties,
        totalViews,
        totalFavorites,
        avgPrice,
        topProperty,
        totalContacts,
        visibilityRate,
        iaScore
      })
      
      // Mock IA advice (in a real app, this would come from an API)
      setIaAdvice([
        "Les maisons à Akanda similaires à la vôtre se vendent 12 % moins cher.",
        "Les annonces avec 5 photos ou plus ont 3x plus de chances d'être vues.",
        "La demande sur les terrains à Owendo a augmenté de 18 % ce mois-ci.",
        "Votre offre performe bien, mais les photos pourraient être améliorées pour +15 % de visibilité."
      ])
      
      // Mock messages (in a real app, this would come from an API)
      setMessages([
        { id: 1, name: "Marie Dupont", message: "Je suis très intéressée par votre villa", time: "2h", unread: true },
        { id: 2, name: "Jean Martin", message: "Est-il possible de visiter samedi ?", time: "1j", unread: false },
        { id: 3, name: "Sophie Lambert", message: "Pouvez-vous m'envoyer plus de photos ?", time: "2j", unread: true }
      ])
      
      // Mock notifications
      setNotifications([
        { id: 1, type: "view", message: "Nouvelle vue sur votre annonce", time: "5m" },
        { id: 2, type: "message", message: "Nouveau message de Marie Dupont", time: "1h" },
        { id: 3, type: "ia", message: "IA: Améliorez vos photos pour +15% de visibilité", time: "3h" }
      ])
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
    <div className="min-h-screen bg-bg-light">
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
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-gray-100 text-[#1A3C40]">
                <i className="fas fa-bell text-xl"></i>
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>

            {/* User info */}
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#1A3C40] font-bold mr-3 font-poppins">
                {auth.user?.firstName?.charAt(0) || auth.user?.email?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block">
                <div className="font-semibold text-[#1A3C40] font-poppins">
                  {auth.user?.firstName || auth.user?.email}
                </div>
                <div className="text-xs text-gray-500 font-inter">
                  Vendeur vérifié
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
                  onClick={() => setActiveTab('ia-advice')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors font-inter ${
                    activeTab === 'ia-advice' 
                      ? 'bg-[#1A3C40] text-white' 
                      : 'text-[#1A3C40] hover:bg-gray-100'
                  }`}
                >
                  <i className="fas fa-brain mr-3"></i>
                  <span>Conseils IA</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('messages')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors font-inter ${
                    activeTab === 'messages' 
                      ? 'bg-[#1A3C40] text-white' 
                      : 'text-[#1A3C40] hover:bg-gray-100'
                  }`}
                >
                  <i className="fas fa-comments mr-3"></i>
                  <span>Messages</span>
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
                  <span>Premium / Boost</span>
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
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                      <i className="fas fa-calendar text-purple-600"></i>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-500 font-inter">+5%</div>
                      <div className="text-xs text-gray-500 font-inter">ce mois</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#1A3C40] mb-1 font-poppins">12</div>
                  <div className="text-sm text-gray-600 font-inter">Visites planifiées</div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                      <i className="fas fa-chart-line text-yellow-600"></i>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-500 font-inter">+3%</div>
                      <div className="text-xs text-gray-500 font-inter">ce mois</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#1A3C40] mb-1 font-poppins">{stats.visibilityRate}%</div>
                  <div className="text-sm text-gray-600 font-inter">Taux de visibilité</div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#1A3C40] flex items-center justify-center">
                      <i className="fas fa-brain text-[#D4AF37]"></i>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-500 font-inter">+5</div>
                      <div className="text-xs text-gray-500 font-inter">points</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#1A3C40] mb-1 font-poppins">{stats.iaScore}/100</div>
                  <div className="text-sm text-gray-600 font-inter">Score IA</div>
                </div>
              </section>

              {/* IA Performance Score */}
              <section className="bg-white rounded-2xl p-6 shadow-soft mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-[#1A3C40] mb-2 font-poppins">Performance IA de vos offres</h2>
                    <p className="text-gray-600 mb-4 font-inter">Votre score IA est calculé en fonction de plusieurs critères pour optimiser la visibilité de vos annonces.</p>
                    
                    <div className="flex items-center mb-4">
                      <div className="relative w-full">
                        <div className="overflow-hidden h-4 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-gradient-to-r from-[#1A3C40] to-[#00BFA6] rounded-full"
                            style={{ width: `${stats.iaScore}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1 font-inter">
                          <span>0</span>
                          <span>25</span>
                          <span>50</span>
                          <span>75</span>
                          <span>100</span>
                        </div>
                      </div>
                      <div className="ml-4 text-xl font-bold text-[#1A3C40] font-poppins">{stats.iaScore}/100</div>
                    </div>
                    
                    <div className="inline-flex items-center bg-[#F8F9FA] px-3 py-1 rounded-full text-sm font-inter">
                      <i className="fas fa-info-circle text-[#1A3C40] mr-2"></i>
                      <span>{stats.iaScore >= 80 ? "Excellent" : stats.iaScore >= 60 ? "Bon" : "À améliorer"}</span>
                    </div>
                  </div>
                  
                  <div className="bg-[#F8F9FA] rounded-xl p-4 w-full md:w-64">
                    <h3 className="font-semibold text-[#1A3C40] mb-3 font-poppins">Critères évalués</h3>
                    <ul className="space-y-2 text-sm font-inter">
                      <li className="flex items-center">
                        <i className={`fas fa-${stats.iaScore >= 70 ? 'check' : 'times'} mr-2 ${stats.iaScore >= 70 ? 'text-green-500' : 'text-red-500'}`}></i>
                        <span>Prix vs. marché local</span>
                      </li>
                      <li className="flex items-center">
                        <i className={`fas fa-${stats.iaScore >= 60 ? 'check' : 'times'} mr-2 ${stats.iaScore >= 60 ? 'text-green-500' : 'text-red-500'}`}></i>
                        <span>Photos de qualité</span>
                      </li>
                      <li className="flex items-center">
                        <i className={`fas fa-${stats.iaScore >= 50 ? 'check' : 'times'} mr-2 ${stats.iaScore >= 50 ? 'text-green-500' : 'text-red-500'}`}></i>
                        <span>Description détaillée</span>
                      </li>
                      <li className="flex items-center">
                        <i className={`fas fa-${stats.iaScore >= 40 ? 'check' : 'times'} mr-2 ${stats.iaScore >= 40 ? 'text-green-500' : 'text-red-500'}`}></i>
                        <span>Engagement des visiteurs</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* IA Advice */}
              <section className="bg-white rounded-2xl p-6 shadow-soft mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#1A3C40] font-poppins">Conseils IA personnalisés</h2>
                  <button 
                    onClick={() => setActiveTab('ia-advice')}
                    className="text-[#1A3C40] hover:text-[#D4AF37] font-inter"
                  >
                    Voir tous les conseils
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {iaAdvice.slice(0, 2).map((advice, index) => (
                    <div key={index} className="p-4 bg-[#F8F9FA] rounded-lg border-l-4 border-[#D4AF37]">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-[#1A3C40] flex items-center justify-center mr-3 flex-shrink-0">
                          <i className="fas fa-lightbulb text-[#D4AF37]"></i>
                        </div>
                        <p className="text-[#1A3C40] font-inter">{advice}</p>
                      </div>
                    </div>
                  ))}
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
                            <button 
                              onClick={() => startEdit(property)}
                              className="text-[#1A3C40] hover:text-[#D4AF37] flex items-center text-sm font-inter"
                            >
                              <i className="fas fa-edit mr-1"></i> Modifier
                            </button>
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

          {/* IA Advice */}
          {activeTab === 'ia-advice' && (
            <div className="animate-fade-in">
              <header className="mb-6">
                <h1 className="text-2xl font-poppins font-semibold text-[#1A3C40]">
                  Conseils IA et Analyse de Marché
                </h1>
                <p className="text-gray-600 font-inter">Recevez des conseils personnalisés basés sur les données</p>
              </header>

              <section className="bg-white rounded-2xl p-6 shadow-soft mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#1A3C40] flex items-center justify-center mr-4">
                    <i className="fas fa-brain text-[#D4AF37] text-xl"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#1A3C40] font-poppins">Analyse IA personnalisée</h2>
                    <p className="text-gray-600 font-inter">Basée sur vos annonces et le marché local</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-[#1A3C40] to-[#00BFA6] rounded-2xl p-6 text-white">
                    <h3 className="font-bold text-lg mb-3 font-poppins">Performance globale</h3>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-inter">Score IA actuel</span>
                      <span className="text-2xl font-bold font-poppins">{stats.iaScore}/100</span>
                    </div>
                    <div className="w-full bg-white bg-opacity-20 rounded-full h-2.5 mb-4">
                      <div 
                        className="bg-[#D4AF37] h-2.5 rounded-full" 
                        style={{ width: `${stats.iaScore}%` }}
                      ></div>
                    </div>
                    <p className="text-sm opacity-90 font-inter">
                      {stats.iaScore >= 80 
                        ? "Excellent travail ! Vos annonces sont très performantes." 
                        : stats.iaScore >= 60 
                          ? "Bon score, quelques améliorations possibles." 
                          : "Des opportunités d'amélioration importantes."}
                    </p>
                  </div>

                  <div className="bg-[#F8F9FA] rounded-2xl p-6">
                    <h3 className="font-bold text-lg text-[#1A3C40] mb-3 font-poppins">Recommandations prioritaires</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-[#1A3C40] flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <i className="fas fa-camera text-[#D4AF37] text-xs"></i>
                        </div>
                        <div>
                          <p className="font-medium text-[#1A3C40] font-inter">Améliorez vos photos</p>
                          <p className="text-sm text-gray-600 font-inter">Les annonces avec 5+ photos ont 3x plus de vues</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-[#1A3C40] flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <i className="fas fa-tag text-[#D4AF37] text-xs"></i>
                        </div>
                        <div>
                          <p className="font-medium text-[#1A3C40] font-inter">Ajustez vos prix</p>
                          <p className="text-sm text-gray-600 font-inter">Vos prix sont 8% au-dessus de la moyenne locale</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-[#1A3C40] flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <i className="fas fa-align-left text-[#D4AF37] text-xs"></i>
                        </div>
                        <div>
                          <p className="font-medium text-[#1A3C40] font-inter">Développez vos descriptions</p>
                          <p className="text-sm text-gray-600 font-inter">Les descriptions détaillées augmentent l'engagement de 40%</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="font-bold text-lg text-[#1A3C40] mb-4 font-poppins">Tendances du marché</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {iaAdvice.map((advice, index) => (
                      <div key={index} className="p-4 bg-[#F8F9FA] rounded-lg">
                        <div className="flex items-start">
                          <div className="w-8 h-8 rounded-full bg-[#1A3C40] flex items-center justify-center mr-3 flex-shrink-0">
                            <i className="fas fa-chart-line text-[#D4AF37]"></i>
                          </div>
                          <p className="text-[#1A3C40] font-inter">{advice}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Messages */}
          {activeTab === 'messages' && (
            <div className="animate-fade-in">
              <header className="mb-6">
                <h1 className="text-2xl font-poppins font-semibold text-[#1A3C40]">
                  Messages / Contacts acheteurs
                </h1>
                <p className="text-gray-600 font-inter">Gérez vos communications avec les acheteurs</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-soft p-6">
                  <h2 className="font-bold text-lg text-[#1A3C40] mb-4 font-poppins">Conversations</h2>
                  <div className="space-y-3">
                    {messages.map(message => (
                      <div 
                        key={message.id} 
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          message.unread ? 'bg-[#F8F9FA]' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-[#1A3C40] font-inter">{message.name}</h3>
                          <span className="text-xs text-gray-500 font-inter">{message.time}</span>
                        </div>
                        <p className={`text-sm mt-1 truncate ${
                          message.unread ? 'text-[#1A3C40] font-medium' : 'text-gray-600'
                        } font-inter`}>
                          {message.message}
                        </p>
                        {message.unread && (
                          <span className="inline-block w-2 h-2 bg-[#D4AF37] rounded-full mt-2"></span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-bold text-lg text-[#1A3C40] font-poppins">Marie Dupont</h2>
                    <button className="text-[#1A3C40] hover:text-[#D4AF37] font-inter">
                      <i className="fas fa-ellipsis-v"></i>
                    </button>
                  </div>

                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    <div className="flex">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-xs font-bold text-gray-600 font-inter">MD</span>
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 max-w-xs md:max-w-md">
                        <p className="text-[#1A3C40] font-inter">Bonjour, je suis très intéressée par votre villa. Est-il possible de programmer une visite ?</p>
                        <div className="text-xs text-gray-500 mt-2 font-inter">14:30</div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="bg-[#1A3C40] rounded-2xl rounded-tr-none p-4 max-w-xs md:max-w-md">
                        <p className="text-white font-inter">Bonjour Marie, merci pour votre intérêt. Bien sûr, nous pouvons programmer une visite. Quand seriez-vous disponible ?</p>
                        <div className="text-xs text-[#D4AF37] mt-2 font-inter">14:32</div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center ml-3 flex-shrink-0">
                        <span className="text-xs font-bold text-[#1A3C40] font-inter">{auth.user?.firstName?.charAt(0) || 'V'}</span>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-xs font-bold text-gray-600 font-inter">MD</span>
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 max-w-xs md:max-w-md">
                        <p className="text-[#1A3C40] font-inter">Je serais disponible samedi matin vers 10h si cela vous convient.</p>
                        <div className="text-xs text-gray-500 mt-2 font-inter">14:35</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex">
                    <input 
                      type="text" 
                      placeholder="Tapez votre message..." 
                      className="flex-1 border border-gray-300 rounded-l-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3C40] font-inter"
                    />
                    <button className="bg-[#1A3C40] text-white px-6 rounded-r-full font-inter">
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
              </div>
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

              {/* Views Over Time */}
              <section className="bg-white rounded-2xl p-6 shadow-soft mb-8">
                <h2 className="font-poppins font-semibold text-lg text-[#1A3C40] mb-4">Évolution des vues (30 derniers jours)</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { date: '1 Juin', views: 45, contacts: 8 },
                        { date: '8 Juin', views: 62, contacts: 12 },
                        { date: '15 Juin', views: 58, contacts: 10 },
                        { date: '22 Juin', views: 78, contacts: 15 },
                        { date: '29 Juin', views: 92, contacts: 18 },
                        { date: '6 Juil', views: 85, contacts: 16 },
                        { date: '13 Juil', views: 110, contacts: 22 },
                        { date: '20 Juil', views: 125, contacts: 25 },
                        { date: '27 Juil', views: 140, contacts: 28 },
                        { date: '3 Août', views: 135, contacts: 26 }
                      ]}
                      margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="views" stackId="1" stroke="#1A3C40" fill="#1A3C40" fillOpacity={0.6} name="Vues" />
                      <Area type="monotone" dataKey="contacts" stackId="2" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.6} name="Contacts" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          )}

          {/* Boost/Premium */}
          {activeTab === 'boost' && (
            <div className="animate-fade-in">
              <header className="mb-6">
                <h1 className="text-2xl font-poppins font-semibold text-[#1A3C40]">
                  Premium / Boost de Visibilité
                </h1>
                <p className="text-gray-600 font-inter">Augmentez la visibilité de vos annonces</p>
              </header>

              <section className="bg-white rounded-2xl p-6 shadow-soft mb-8">
                <h2 className="font-poppins font-semibold text-lg text-[#1A3C40] mb-4">Comment ça marche ?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="w-10 h-10 bg-[#1A3C40] text-white rounded-full flex items-center justify-center mb-3 font-poppins">1</div>
                    <h3 className="font-semibold mb-2 font-poppins">Sélectionnez une annonce</h3>
                    <p className="text-sm text-gray-600 font-inter">Choisissez l'annonce que vous souhaitez booster</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="w-10 h-10 bg-[#1A3C40] text-white rounded-full flex items-center justify-center mb-3 font-poppins">2</div>
                    <h3 className="font-semibold mb-2 font-poppins">Choisissez un plan</h3>
                    <p className="text-sm text-gray-600 font-inter">Sélectionnez la durée de boost qui vous convient</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="w-10 h-10 bg-[#1A3C40] text-white rounded-full flex items-center justify-center mb-3 font-poppins">3</div>
                    <h3 className="font-semibold mb-2 font-poppins">Boostez votre visibilité</h3>
                    <p className="text-sm text-gray-600 font-inter">Votre annonce apparaîtra en tête de liste</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#1A3C40] to-[#00BFA6] rounded-2xl p-6 text-white mb-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-bold mb-2 font-poppins">Offre spéciale de lancement !</h3>
                      <p className="opacity-90 font-inter">Profitez de 30% de réduction sur votre premier boost</p>
                    </div>
                    <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full font-inter">
                      <span className="line-through mr-2">3 000 FCFA</span>
                      <span className="font-bold">2 100 FCFA</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Boost Plans */}
                  <div className="border-2 border-[#1A3C40] rounded-2xl p-6 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#1A3C40] text-white px-4 py-1 rounded-full text-sm font-bold font-inter">
                      POPULAIRE
                    </div>
                    <h3 className="text-xl font-bold text-center text-[#1A3C40] mb-2 font-poppins">Boost Standard</h3>
                    <div className="text-center mb-4">
                      <span className="text-3xl font-bold text-[#1A3C40] font-poppins">3 000</span>
                      <span className="text-gray-600 font-inter"> FCFA</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        <span className="font-inter">7 jours de visibilité premium</span>
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        <span className="font-inter">Position en tête de liste</span>
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-times text-red-500 mr-2"></i>
                        <span className="text-gray-400 line-through font-inter">Rapport IA détaillé</span>
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-times text-red-500 mr-2"></i>
                        <span className="text-gray-400 line-through font-inter">Support prioritaire</span>
                      </li>
                    </ul>
                    <button className="w-full bg-[#1A3C40] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors font-inter">
                      Choisir ce plan
                    </button>
                  </div>

                  <div className="border-2 border-[#D4AF37] rounded-2xl p-6 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#D4AF37] text-[#1A3C40] px-4 py-1 rounded-full text-sm font-bold font-inter">
                      RECOMMANDÉ
                    </div>
                    <h3 className="text-xl font-bold text-center text-[#1A3C40] mb-2 font-poppins">Boost Premium</h3>
                    <div className="text-center mb-4">
                      <span className="text-3xl font-bold text-[#1A3C40] font-poppins">7 500</span>
                      <span className="text-gray-600 font-inter"> FCFA</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        <span className="font-inter">14 jours de visibilité premium</span>
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        <span className="font-inter">Position en tête de liste</span>
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        <span className="font-inter">Rapport IA détaillé</span>
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-times text-red-500 mr-2"></i>
                        <span className="text-gray-400 line-through font-inter">Support prioritaire</span>
                      </li>
                    </ul>
                    <button className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A3C40] py-3 rounded-lg font-bold hover:opacity-90 transition-opacity font-inter">
                      Choisir ce plan
                    </button>
                  </div>

                  <div className="border-2 border-gray-300 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-center text-[#1A3C40] mb-2 font-poppins">Boost Pro</h3>
                    <div className="text-center mb-4">
                      <span className="text-3xl font-bold text-[#1A3C40] font-poppins">15 000</span>
                      <span className="text-gray-600 font-inter"> FCFA</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        <span className="font-inter">30 jours de visibilité premium</span>
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        <span className="font-inter">Position en tête de liste</span>
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        <span className="font-inter">Rapport IA détaillé</span>
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        <span className="font-inter">Support prioritaire</span>
                      </li>
                    </ul>
                    <button className="w-full bg-gray-300 text-[#1A3C40] py-3 rounded-lg font-bold hover:bg-gray-400 transition-colors font-inter">
                      Choisir ce plan
                    </button>
                  </div>
                </div>

                {/* Scarcity Indicator */}
                <div className="mt-8 p-4 bg-[#F8F9FA] rounded-lg border-l-4 border-[#D4AF37]">
                  <div className="flex items-center">
                    <i className="fas fa-exclamation-triangle text-[#D4AF37] mr-3"></i>
                    <div>
                      <p className="font-bold text-[#1A3C40] font-inter">FOMO : Places Premium limitées !</p>
                      <p className="text-sm text-gray-600 font-inter">Plus que <span className="font-bold">3</span> emplacements Premium disponibles cette semaine</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div className="bg-[#D4AF37] h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in">
              <header className="mb-6">
                <h1 className="text-2xl font-poppins font-semibold text-[#1A3C40]">
                  Paramètres / Sécurité
                </h1>
                <p className="text-gray-600 font-inter">Gérez votre profil et vos préférences</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <section className="bg-white rounded-2xl p-6 shadow-soft mb-6">
                    <h2 className="font-poppins font-semibold text-lg text-[#1A3C40] mb-6">Informations personnelles</h2>
                    
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2 font-inter">Prénom</label>
                          <input
                            type="text"
                            defaultValue={auth.user?.firstName || ''}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3C40] font-medium font-inter"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2 font-inter">Nom</label>
                          <input
                            type="text"
                            defaultValue={auth.user?.lastName || ''}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3C40] font-medium font-inter"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2 font-inter">Email</label>
                          <input
                            type="email"
                            defaultValue={auth.user?.email || ''}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3C40] font-medium font-inter"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2 font-inter">Téléphone</label>
                          <input
                            type="tel"
                            defaultValue={auth.user?.phone || ''}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3C40] font-medium font-inter"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="bg-gradient-to-r from-[#1A3C40] to-[#00BFA6] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 font-inter"
                        >
                          Enregistrer les modifications
                        </button>
                      </div>
                    </form>
                  </section>

                  <section className="bg-white rounded-2xl p-6 shadow-soft mb-6">
                    <h2 className="font-poppins font-semibold text-lg text-[#1A3C40] mb-6">Sécurité</h2>
                    
                    <div className="space-y-6">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-medium text-[#1A3C40] mb-2 font-inter">Changer le mot de passe</h3>
                        <button
                          type="button"
                          onClick={() => navigate('/change-password')}
                          className="text-[#1A3C40] hover:underline font-inter"
                        >
                          Modifier le mot de passe
                        </button>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-medium text-[#1A3C40] mb-2 font-inter">Authentification à deux facteurs</h3>
                        <p className="text-sm text-gray-600 mb-3 font-inter">Ajoutez une couche de sécurité supplémentaire à votre compte</p>
                        <button
                          type="button"
                          className="bg-gray-100 text-[#1A3C40] px-4 py-2 rounded-lg font-medium font-inter"
                        >
                          Activer l'authentification
                        </button>
                      </div>
                      
                      <div className="p-4 border border-red-200 rounded-lg">
                        <h3 className="font-medium text-red-600 mb-2 font-inter">Validation d'identité</h3>
                        <p className="text-sm text-gray-600 mb-3 font-inter">Téléchargez vos documents d'identification pour valider votre compte</p>
                        <button
                          type="button"
                          onClick={() => navigate('/documents')}
                          className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium font-inter"
                        >
                          Télécharger des documents
                        </button>
                      </div>
                    </div>
                  </section>
                </div>

                <div>
                  <section className="bg-white rounded-2xl p-6 shadow-soft mb-6">
                    <h2 className="font-poppins font-semibold text-lg text-[#1A3C40] mb-6">Notifications</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-[#1A3C40] font-inter">Notifications par email</h4>
                          <p className="text-sm text-gray-600 font-inter">Recevoir des notifications par email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1A3C40]"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-[#1A3C40] font-inter">Notifications SMS</h4>
                          <p className="text-sm text-gray-600 font-inter">Recevoir des notifications par SMS</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1A3C40]"></div>
                        </label>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}