import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import propertyClient from '../api/propertyClient';

export default function Vendre() {
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'maison',
    availability: 'sale', // Add availability option
    price: '',
    currency: 'XAF',
    surface: '',
    rooms: '',
    bathrooms: '',
    kitchens: '',
    livingRooms: '',
    terrace: false,
    pool: false,
    parking: false,
    address: {
      country: 'Gabon',
      city: '',
      district: '',
      street: '',
      postalCode: ''
    }
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  // Add state for form progress
  const [formProgress, setFormProgress] = useState(0);

  // Handle access control
  if (!user) {
    // If not logged in, redirect to login with return URL
    navigate('/login?redirect=/vendre');
    return null;
  }

  if (user && user.role !== 'vendeur') {
    // If logged in as buyer, show upgrade modal
    // setShowUpgradeModal(true) will be triggered in the component render
  }

  // Calculate form progress
  const calculateProgress = (data) => {
    let completedFields = 0;
    const totalFields = 15; // Approximate number of key fields
    
    if (data.title) completedFields++;
    if (data.description) completedFields++;
    if (data.price) completedFields++;
    if (data.surface) completedFields++;
    if (data.address.city) completedFields++;
    if (data.rooms) completedFields++;
    if (data.bathrooms) completedFields++;
    if (data.kitchens) completedFields++;
    if (data.livingRooms) completedFields++;
    if (imagePreviews.length > 0) completedFields++;
    if (data.terrace) completedFields++;
    if (data.pool) completedFields++;
    if (data.parking) completedFields++;
    if (data.address.district) completedFields++;
    if (data.address.street) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let updatedData;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      updatedData = {
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      };
    } else {
      updatedData = {
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      };
    }
    
    setFormData(updatedData);
    setFormProgress(calculateProgress(updatedData));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
    
    // Update progress
    setFormProgress(calculateProgress({...formData, images: files}));
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    
    // Update progress
    setFormProgress(calculateProgress({...formData, images: images.filter((_, i) => i !== index)}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Convert form data to numbers where appropriate
      const data = {
        ...formData,
        price: Number(formData.price),
        surface: Number(formData.surface),
        rooms: Number(formData.rooms),
        bathrooms: Number(formData.bathrooms),
        kitchens: Number(formData.kitchens),
        livingRooms: Number(formData.livingRooms)
      };
      
      // Create property using propertyClient
      const response = await propertyClient.create(data);
      const property = response.property || response;
      
      console.log('Property created:', property);
      
      // Upload images if any
      if (images.length > 0 && property._id) {
        const formDataImages = new FormData();
        images.forEach(image => {
          formDataImages.append('images', image);
        });
        
        console.log('Uploading images for property:', property._id);
        const uploadResponse = await propertyClient.uploadImages(property._id, formDataImages);
        console.log('Upload response:', uploadResponse);
        
        // Show success message with the updated property info
        if (uploadResponse && uploadResponse.property) {
          console.log('Property with images:', uploadResponse.property);
        }
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard/seller');
      }, 2000);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'annonce');
    } finally {
      setLoading(false);
    }
  };

  // Handle upgrade to seller account
  const handleUpgradeToSeller = () => {
    // Navigate to register page with user data pre-filled
    navigate('/register', { 
      state: { 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: 'vendeur'
      } 
    });
  };

  // If user is a buyer, show the upgrade modal
  if (user && user.role !== 'vendeur') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gabon-beige to-white py-8">
        {/* Upgrade Modal */}
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                <i className="fas fa-exclamation-triangle text-yellow-600"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Compte acheteur détecté</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Vous possédez actuellement un compte acheteur. Pour publier une annonce, vous devez créer un compte vendeur.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard/client')}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Retour à mon compte
              </button>
              <button
                type="button"
                onClick={handleUpgradeToSeller}
                className="inline-flex justify-center rounded-md border border-transparent bg-gabon-green px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-dark-forest"
              >
                Créer un compte vendeur
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gabon-beige to-white py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link to="/dashboard/seller" className="text-gabon-green hover:text-dark-forest flex items-center mb-4">
            <i className="fas fa-arrow-left mr-2"></i> Retour au tableau de bord
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Créer une annonce</h1>
              <p className="text-gray-600 mt-2">
                Remplissez les détails de votre propriété pour la publier
              </p>
              
              {/* Reciprocity Element - Free Estimation Offer */}
              <div className="mt-4 p-3 bg-gabon-gold bg-opacity-10 rounded-lg border border-gabon-gold inline-flex items-center hover-glow">
                <i className="fas fa-gift text-gabon-gold mr-2"></i>
                <span className="text-sm text-gray-700">Estimez gratuitement votre bien avec notre outil d'évaluation</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="gabon-btn-primary px-6 py-3 rounded-lg font-bold shadow-lg flex items-center disabled:opacity-50 hover-glow"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Publication en cours...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i> Publier l'annonce
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="gabon-card rounded-2xl overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <i className="fas fa-exclamation-circle text-red-500"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <i className="fas fa-check-circle text-green-500"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">Annonce créée avec succès ! Redirection...</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6">
            {/* Enhanced Progress Indicator with Engagement Elements */}
            <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover-glow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">Progression de votre annonce</h3>
                <span className="text-sm font-bold text-gabon-green">{formProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gabon-green h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                  style={{width: `${formProgress}%`}}
                ></div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {formProgress < 30 && "Commencez par remplir les informations de base"}
                {formProgress >= 30 && formProgress < 70 && "Continuez, vous êtes sur la bonne voie !"}
                {formProgress >= 70 && formProgress < 100 && "Presque terminé ! Ajoutez quelques images"}
                {formProgress === 100 && "Parfait ! Vous pouvez publier votre annonce"}
              </div>
            </div>

            {/* Urgency Element */}
            <div className="mb-6 p-3 bg-gabon-gold bg-opacity-10 rounded-lg border border-gabon-gold flex items-center hover-glow">
              <i className="fas fa-bolt text-gabon-gold mr-2"></i>
              <span className="text-sm text-gray-700">Les annonces complètes sont vues 5x plus souvent. Terminez votre annonce maintenant !</span>
            </div>

            {/* Basic Information with Engagement Improvements */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <i className="fas fa-info-circle text-gabon-green mr-2"></i> Informations de base
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'annonce *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition"
                    placeholder="Ex: Belle maison avec piscine et jardin"
                  />
                  {/* Engagement Element - Tip */}
                  <div className="mt-1 text-xs text-gray-500 flex items-center">
                    <i className="fas fa-lightbulb text-gabon-gold mr-1"></i>
                    Utilisez un titre accrocheur avec des mots-clés pertinents
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de propriété *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition"
                  >
                    <option value="maison">Maison</option>
                    <option value="appartement">Appartement</option>
                    <option value="terrain">Terrain</option>
                    <option value="vacances">Vacances</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilité</label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition"
                  >
                    <option value="sale">À vendre</option>
                    <option value="rent">À louer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition"
                  >
                    <option value="XAF">Franc CFA (XAF)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition"
                    placeholder="Ex: 15000000"
                  />
                  {/* Authority Element - Market Insight */}
                  <div className="mt-1 text-xs text-gray-500 flex items-center">
                    <i className="fas fa-chart-line text-gabon-green mr-1"></i>
                    Prix moyen dans cette catégorie: 12.000.000 XAF
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²) *</label>
                  <input
                    type="number"
                    name="surface"
                    value={formData.surface}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition"
                    placeholder="Ex: 120"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description détaillée *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition"
                  placeholder="Décrivez votre propriété en détail : quartier, commodités à proximité, état du bien, etc."
                />
                {/* Engagement Element - Character Counter */}
                <div className="mt-1 text-xs text-gray-500 flex justify-between">
                  <div className="flex items-center">
                    <i className="fas fa-pen text-gabon-gold mr-1"></i>
                    Décrivez les atouts uniques de votre bien
                  </div>
                  <span>{formData.description.length}/500 caractères</span>
                </div>
              </div>
            </div>

            {/* Rooms */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <i className="fas fa-door-open text-gabon-green mr-2"></i> Pièces et aménagements
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="hover-glow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chambres</label>
                  <input
                    type="number"
                    name="rooms"
                    value={formData.rooms}
                    onChange={handleChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition"
                    placeholder="0"
                  />
                </div>
                
                <div className="hover-glow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salles de bain</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition"
                    placeholder="0"
                  />
                </div>
                
                <div className="hover-glow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cuisines</label>
                  <input
                    type="number"
                    name="kitchens"
                    value={formData.kitchens}
                    onChange={handleChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition"
                    placeholder="0"
                  />
                </div>
                
                <div className="hover-glow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salons</label>
                  <input
                    type="number"
                    name="livingRooms"
                    value={formData.livingRooms}
                    onChange={handleChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover-glow smooth-transition">
                  <input
                    type="checkbox"
                    name="terrace"
                    checked={formData.terrace}
                    onChange={handleChange}
                    className="h-5 w-5 text-gabon-green rounded focus:ring-gabon-green"
                  />
                  <label className="ml-3 block text-sm font-medium text-gray-700">
                    <i className="fas fa-umbrella-beach text-blue-500 mr-2"></i> Terrasse
                  </label>
                </div>
                
                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover-glow smooth-transition">
                  <input
                    type="checkbox"
                    name="pool"
                    checked={formData.pool}
                    onChange={handleChange}
                    className="h-5 w-5 text-gabon-green rounded focus:ring-gabon-green"
                  />
                  <label className="ml-3 block text-sm font-medium text-gray-700">
                    <i className="fas fa-swimming-pool text-blue-500 mr-2"></i> Piscine
                  </label>
                </div>
                
                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover-glow smooth-transition">
                  <input
                    type="checkbox"
                    name="parking"
                    checked={formData.parking}
                    onChange={handleChange}
                    className="h-5 w-5 text-gabon-green rounded focus:ring-gabon-green"
                  />
                  <label className="ml-3 block text-sm font-medium text-gray-700">
                    <i className="fas fa-parking text-blue-500 mr-2"></i> Parking
                  </label>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <i className="fas fa-map-marker-alt text-gabon-green mr-2"></i> Adresse
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="hover-glow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition"
                    placeholder="Ex: Gabon"
                  />
                </div>
                
                <div className="hover-glow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition"
                    placeholder="Ex: Libreville"
                  />
                  {/* Social Proof Element */}
                  <div className="mt-1 text-xs text-gray-500 flex items-center">
                    <i className="fas fa-map-pin text-gabon-green mr-1"></i>
                    Libreville est la ville la plus recherchée
                  </div>
                </div>
                
                <div className="hover-glow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
                  <input
                    type="text"
                    name="address.district"
                    value={formData.address.district}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition"
                    placeholder="Ex: Akanda"
                  />
                </div>
                
                <div className="hover-glow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rue</label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition"
                    placeholder="Ex: Rue de la Paix"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <i className="fas fa-images text-gabon-green mr-2"></i> Images
              </h2>
              
              {/* Social Proof Element */}
              <div className="mb-4 p-3 bg-gabon-beige rounded-lg border border-gray-200 hover-glow">
                <div className="flex items-center">
                  <i className="fas fa-lightbulb text-gabon-gold mr-2"></i>
                  <span className="text-sm text-gray-700">Les annonces avec des photos de qualité attirent 3x plus de visiteurs</span>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sélectionnez des images</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover-glow smooth-transition">
                  <div className="space-y-1 text-center">
                    <i className="fas fa-cloud-upload-alt text-gray-400 text-3xl mx-auto"></i>
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-gabon-green hover:text-dark-forest">
                        <span>Sélectionnez des fichiers</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">ou glissez-déposez</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Vous pouvez sélectionner jusqu'à 10 images</p>
              </div>
              
              {imagePreviews.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Aperçu des images</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group hover-glow">
                        <img
                          src={preview}
                          alt={`Preview ${index}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Final CTA with Psychological Elements */}
            <div className="mb-6 p-4 bg-gradient-to-r from-gabon-green to-dark-forest rounded-lg text-white hover-glow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="font-bold text-lg">Prêt à publier votre annonce ?</h3>
                  <p className="text-blue-100 text-sm">
                    {formProgress < 100 
                      ? "Complétez votre annonce pour maximiser votre visibilité"
                      : "Votre annonce est complète et prête à attirer des acheteurs !"}
                  </p>
                </div>
                <div className="flex items-center">
                  {formProgress < 100 && (
                    <div className="mr-4 text-sm bg-black bg-opacity-20 px-3 py-1 rounded-full">
                      <i className="fas fa-exclamation-circle mr-1"></i> {100 - formProgress}% restant
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="gabon-btn-secondary px-6 py-3 rounded-lg font-bold disabled:opacity-50 flex items-center"
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i> Publication...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2"></i> Publier maintenant
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard/seller')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium smooth-transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="gabon-btn-primary px-6 py-3 rounded-lg font-bold disabled:opacity-50 shadow-lg flex items-center hover-glow"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Publication en cours...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i> Publier l'annonce
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}