import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import propertyClient from '../api/propertyClient';

export default function EditOffer() {
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'maison',
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
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Redirect if not a seller
  if (user && user.role !== 'vendeur') {
    navigate('/dashboard/client');
  }

  if (!user) {
    navigate('/login');
  }

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      const response = await propertyClient.getById(id);
      const property = response.property || response.data || response;
      
      console.log('Property loaded for editing:', property);
      
      // Remplir le formulaire avec les données de la propriété
      setFormData({
        title: property.title || '',
        description: property.description || '',
        type: property.type || 'maison',
        price: property.price || '',
        currency: property.currency || 'XAF',
        surface: property.surface || '',
        rooms: property.rooms || '',
        bathrooms: property.bathrooms || '',
        kitchens: property.kitchens || '',
        livingRooms: property.livingRooms || '',
        terrace: property.terrace || false,
        pool: property.pool || false,
        parking: property.parking || false,
        status: property.status || 'pending', // Add status field
        address: {
          country: property.address?.country || 'Gabon',
          city: property.address?.city || '',
          district: property.address?.district || '',
          street: property.address?.street || '',
          postalCode: property.address?.postalCode || ''
        }
      });
      
      // Set existing images for display
      setExistingImages(property.images || []);
    } catch (err) {
      console.error('Error loading property:', err);
      // Show more detailed error message
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Erreur lors du chargement de l'annonce: ${err.response.data.message}`);
      } else {
        setError('Erreur lors du chargement de l\'annonce. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files) return;
    
    const newPreviewFiles = [];
    for (let i = 0; i < files.length; i++) {
      newPreviewFiles.push({
        file: files[i],
        url: URL.createObjectURL(files[i]),
        id: Date.now() + i // Unique ID for each file
      });
    }
    
    setPreviewFiles(prev => [...prev, ...newPreviewFiles]);
  };

  const removePreviewImage = (imageId) => {
    setPreviewFiles(prev => prev.filter(img => img.id !== imageId));
  };

  const removeExistingImage = (imageIndex) => {
    setImagesToRemove(prev => [...prev, imageIndex]);
  };

  // Update this function to handle actual image removal
  const handleImageRemoval = async (propertyId) => {
    if (imagesToRemove.length === 0) return;
    
    try {
      // Remove images from the backend
      for (const imageIndex of imagesToRemove) {
        const imageToRemove = existingImages[imageIndex];
        if (imageToRemove && imageToRemove.public_id) {
          try {
            await propertyClient.removeImage(propertyId, imageToRemove.public_id);
            console.log('Image removed successfully:', imageToRemove.public_id);
          } catch (err) {
            console.error('Error removing image:', err);
            // Continue with other images even if one fails
          }
        }
      }
      
      // Update the existingImages state to remove the images
      setExistingImages(prev => prev.filter((_, index) => !imagesToRemove.includes(index)));
      setImagesToRemove([]);
    } catch (err) {
      console.error('Error removing images:', err);
      setError('Erreur lors de la suppression des images');
    }
  };

  const handleImageUpload = async (propertyId) => {
    if (previewFiles.length === 0) return;
    
    const formData = new FormData();
    previewFiles.forEach(img => {
      formData.append('images', img.file);
    });
    
    try {
      await propertyClient.uploadImages(propertyId, formData);
      setPreviewFiles([]);
      // Reload property to get updated images
      loadProperty();
    } catch (err) {
      console.error('Error uploading images:', err);
      setError('Erreur lors de l\'upload des images');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    // Client-side validation
    const errors = {};
    if (!formData.title || formData.title.trim().length < 3) {
      errors.title = 'Le titre doit contenir au moins 3 caractères';
    }
    if (!formData.price || Number(formData.price) <= 0) {
      errors.price = 'Le prix doit être un nombre positif';
    }
    if (!formData.surface || Number(formData.surface) <= 0) {
      errors.surface = 'La surface doit être un nombre positif';
    }
    if (!formData.address.city || formData.address.city.trim().length < 2) {
      errors.city = 'La ville est requise';
    }
    
    if (Object.keys(errors).length > 0) {
      setError('Veuillez corriger les erreurs dans le formulaire');
      setSubmitting(false);
      return;
    }
    
    try {
      // Convert form data to numbers where appropriate
      const data = {
        ...formData,
        price: Number(formData.price),
        surface: Number(formData.surface),
        rooms: Number(formData.rooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        kitchens: Number(formData.kitchens) || 0,
        livingRooms: Number(formData.livingRooms) || 0
      };
      
      console.log('Updating property with data:', data);
      
      // Update property using propertyClient
      const response = await propertyClient.update(id, data);
      console.log('Update response:', response);
      
      // Remove images if any are marked for removal
      if (imagesToRemove.length > 0) {
        await handleImageRemoval(id);
      }
      
      // Upload new images if any
      if (previewFiles.length > 0) {
        await handleImageUpload(id);
      }
      
      setSuccess(true);
      // Redirect to the offer detail page after a short delay
      setTimeout(() => {
        navigate(`/offers/${id}`);
      }, 2000);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      // Show more detailed error message
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Erreur lors de la mise à jour de l'annonce: ${err.response.data.message}`);
      } else if (err.response) {
        setError(`Erreur ${err.response.status}: ${err.response.statusText}`);
      } else {
        setError('Erreur lors de la mise à jour de l\'annonce. Veuillez réessayer.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link to={`/offers/${id}`} className="text-blue-600 hover:text-blue-800 flex items-center mb-4">
            <i className="fas fa-arrow-left mr-2"></i> Retour à l'annonce
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Modifier l'annonce</h1>
              <p className="text-gray-600 mt-2">
                Mettez à jour les détails de votre propriété
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-indigo-800 transition shadow-lg flex items-center disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Mise à jour en cours...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i> Mettre à jour l'annonce
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
                  <p className="text-sm text-green-700">Annonce mise à jour avec succès ! Redirection...</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6">
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Images existantes</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150/cccccc/000000?text=Image+Indisponible';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Supprimer cette image"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Preview */}
            {previewFiles.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Nouvelles images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {previewFiles.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePreviewImage(image.id)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        title="Supprimer cette image"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ajouter des images</label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>

            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <i className="fas fa-info-circle text-blue-600 mr-2"></i> Informations de base
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Belle maison avec piscine et jardin"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de propriété *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="maison">Maison</option>
                    <option value="appartement">Appartement</option>
                    <option value="terrain">Terrain</option>
                    <option value="vacances">Vacances</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut de l'annonce</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">En attente</option>
                    <option value="online">En ligne</option>
                    <option value="negotiation">En négociation</option>
                    <option value="sold">Vendu</option>
                    <option value="removed">Retiré</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 15000000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²) *</label>
                  <input
                    type="number"
                    name="surface"
                    value={formData.surface}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Décrivez votre propriété en détail : quartier, commodités à proximité, état du bien, etc."
                />
              </div>
            </div>

            {/* Rooms */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <i className="fas fa-door-open text-blue-600 mr-2"></i> Pièces et aménagements
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chambres</label>
                  <input
                    type="number"
                    name="rooms"
                    value={formData.rooms}
                    onChange={handleChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salles de bain</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cuisines</label>
                  <input
                    type="number"
                    name="kitchens"
                    value={formData.kitchens}
                    onChange={handleChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salons</label>
                  <input
                    type="number"
                    name="livingRooms"
                    value={formData.livingRooms}
                    onChange={handleChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    name="terrace"
                    checked={formData.terrace}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label className="ml-3 block text-sm font-medium text-gray-700">
                    <i className="fas fa-umbrella-beach text-blue-500 mr-2"></i> Terrasse
                  </label>
                </div>
                
                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    name="pool"
                    checked={formData.pool}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label className="ml-3 block text-sm font-medium text-gray-700">
                    <i className="fas fa-swimming-pool text-blue-500 mr-2"></i> Piscine
                  </label>
                </div>
                
                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    name="parking"
                    checked={formData.parking}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
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
                <i className="fas fa-map-marker-alt text-blue-600 mr-2"></i> Adresse
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Gabon"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Libreville"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
                  <input
                    type="text"
                    name="address.district"
                    value={formData.address.district}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Akanda"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rue</label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Rue de la Paix"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Link
                to={`/offers/${id}`}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 shadow-lg flex items-center"
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Mise à jour en cours...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i> Mettre à jour l'annonce
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