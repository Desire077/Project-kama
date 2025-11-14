import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import propertyClient from '../api/propertyClient';

export default function PropertyManager() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  useEffect(() => {
    if (id) {
      loadProperty();
    }
  }, [id]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const response = await propertyClient.getById(id);
      const propertyData = response.property || response.data || response;
      setProperty(propertyData);
      
      // Fill form with property data
      setFormData({
        title: propertyData.title || '',
        description: propertyData.description || '',
        type: propertyData.type || 'maison',
        price: propertyData.price || '',
        currency: propertyData.currency || 'XAF',
        surface: propertyData.surface || '',
        rooms: propertyData.rooms || '',
        bathrooms: propertyData.bathrooms || '',
        kitchens: propertyData.kitchens || '',
        livingRooms: propertyData.livingRooms || '',
        terrace: propertyData.terrace || false,
        pool: propertyData.pool || false,
        parking: propertyData.parking || false,
        address: {
          country: propertyData.address?.country || 'Gabon',
          city: propertyData.address?.city || '',
          district: propertyData.address?.district || '',
          street: propertyData.address?.street || '',
          postalCode: propertyData.address?.postalCode || ''
        }
      });
    } catch (err) {
      console.error('Error loading property:', err);
      setError('Erreur lors du chargement de l\'annonce');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.title || formData.title.trim().length < 3) {
      setError('Le titre doit contenir au moins 3 caractères');
      setSubmitting(false);
      return;
    }
    
    if (!formData.price || Number(formData.price) <= 0) {
      setError('Le prix doit être un nombre positif');
      setSubmitting(false);
      return;
    }
    
    if (!formData.surface || Number(formData.surface) <= 0) {
      setError('La surface doit être un nombre positif');
      setSubmitting(false);
      return;
    }
    
    if (!formData.address.city || formData.address.city.trim().length < 2) {
      setError('La ville est requise');
      setSubmitting(false);
      return;
    }
    
    try {
      // Prepare data for update
      const data = {
        ...formData,
        price: Number(formData.price),
        surface: Number(formData.surface),
        rooms: Number(formData.rooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        kitchens: Number(formData.kitchens) || 0,
        livingRooms: Number(formData.livingRooms) || 0
      };
      
      const response = await propertyClient.update(id, data);
      setSuccess('Annonce mise à jour avec succès!');
      
      // Reload property data
      setTimeout(() => {
        loadProperty();
      }, 1000);
    } catch (err) {
      console.error('Error updating property:', err);
      if (err.response?.data?.message) {
        setError(`Erreur: ${err.response.data.message}`);
      } else {
        setError('Erreur lors de la mise à jour de l\'annonce');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      return;
    }
    
    setDeleting(true);
    setError('');
    
    try {
      await propertyClient.delete(id);
      setSuccess('Annonce supprimée avec succès!');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard/seller');
      }, 2000);
    } catch (err) {
      console.error('Error deleting property:', err);
      if (err.response?.data?.message) {
        setError(`Erreur: ${err.response.data.message}`);
      } else {
        setError('Erreur lors de la suppression de l\'annonce');
      }
    } finally {
      setDeleting(false);
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
          <button 
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
          >
            <i className="fas fa-arrow-left mr-2"></i> Retour
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {id ? 'Modifier l\'annonce' : 'Créer une annonce'}
              </h1>
              <p className="text-gray-600 mt-2">
                {id ? 'Mettez à jour les détails de votre propriété' : 'Créez une nouvelle annonce immobilière'}
              </p>
            </div>
            {id && (
              <div className="mt-4 md:mt-0 flex space-x-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i> Suppression...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash mr-2"></i> Supprimer
                    </>
                  )}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i> Mise à jour...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i> Enregistrer
                    </>
                  )}
                </button>
              </div>
            )}
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
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6">
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
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 shadow-lg flex items-center"
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> {id ? 'Mise à jour...' : 'Création...'}
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i> {id ? 'Mettre à jour' : 'Créer l\'annonce'}
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