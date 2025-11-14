import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import propertyClient from '../api/propertyClient';

export default function DocumentSubmission() {
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [documents, setDocuments] = useState([]);
  const [documentPreviews, setDocumentPreviews] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyClient.getMyProperties();
      setProperties(response.data || response);
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Erreur lors du chargement de vos annonces');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files) return;
    
    const arr = [];
    const fileList = [];
    
    for(let i = 0; i < files.length; i++){
      arr.push({
        name: files[i].name,
        type: files[i].type,
        size: files[i].size,
        url: URL.createObjectURL(files[i])
      });
      fileList.push(files[i]);
    }
    
    setDocumentPreviews(arr);
    setDocuments(fileList);
  };

  const removeDocument = (index) => {
    const newPreviews = [...documentPreviews];
    newPreviews.splice(index, 1);
    setDocumentPreviews(newPreviews);
    
    const newDocuments = [...documents];
    newDocuments.splice(index, 1);
    setDocuments(newDocuments);
    
    // Reset file input
    if (fileInputRef.current && newDocuments.length === 0) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedProperty) {
      setError('Veuillez sélectionner une annonce');
      return;
    }
    
    if (documents.length === 0) {
      setError('Veuillez sélectionner au moins un document');
      return;
    }
    
    // Check file sizes (max 10MB each)
    const oversizedFiles = documents.filter(doc => doc.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Certains fichiers dépassent la taille maximale de 10 Mo');
      return;
    }
    
    setUploading(true);
    setError('');
    setSuccess('');
    
    try {
      const formData = new FormData();
      documents.forEach(doc => {
        formData.append('documents', doc);
      });
      
      const response = await propertyClient.uploadDocuments(selectedProperty, formData);
      setSuccess('Documents uploadés avec succès!');
      
      // Clear form
      setDocumentPreviews([]);
      setDocuments([]);
      setSelectedProperty('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Reload properties to show updated documents
      loadProperties();
    } catch (err) {
      console.error('Error uploading documents:', err);
      setError('Erreur lors de l\'upload des documents: ' + (err.response?.data?.message || 'Veuillez réessayer'));
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Accès refusé</h2>
            <p className="text-gray-600 mb-6">Vous devez être connecté en tant que vendeur pour accéder à cette page.</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-indigo-800 transition"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="mb-8">
              <button 
                onClick={() => navigate(-1)}
                className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
              >
                <i className="fas fa-arrow-left mr-2"></i> Retour
              </button>
              
              <div className="flex items-center mb-2">
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                  <i className="fas fa-file-contract text-xl"></i>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Soumission de documents</h1>
                  <p className="text-gray-600">Ajoutez les documents prouvant que le bien vous appartient</p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-info-circle text-blue-500"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Important:</strong> Votre annonce ne sera visible qu'après vérification manuelle par notre équipe. 
                      Ces documents ne seront jamais partagés publiquement.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="ml-3">
                    <p>{success}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-exclamation-circle"></i>
                  </div>
                  <div className="ml-3">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-8">
              {/* Property Selection */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <i className="fas fa-home text-green-600 mr-2"></i> Sélectionnez une annonce
                </h2>
                
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : properties.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-home text-gray-300 text-3xl mb-3"></i>
                    <p className="text-gray-600">Vous n'avez pas encore d'annonces</p>
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard/seller/new')}
                      className="mt-3 text-green-600 hover:text-green-800 font-medium"
                    >
                      Créer une annonce
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Annonce concernée *</label>
                    <select
                      value={selectedProperty}
                      onChange={(e) => setSelectedProperty(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Sélectionnez une annonce</option>
                      {properties.map(property => (
                        <option key={property._id} value={property._id}>
                          {property.title} - {property.address?.city || 'Adresse non spécifiée'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Document Upload */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <i className="fas fa-cloud-upload-alt text-green-600 mr-2"></i> Ajoutez vos documents
                </h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Documents requis *
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium flex items-center">
                          <i className="fas fa-file-alt text-gray-500 mr-2"></i>
                          Titre de propriété ou acte notarié
                        </h3>
                        <span className="text-red-500 text-sm">Requis</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Document officiel prouvant votre propriété
                      </p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium flex items-center">
                          <i className="fas fa-file-invoice text-gray-500 mr-2"></i>
                          Document complémentaire
                        </h3>
                        <span className="text-gray-500 text-sm">Facultatif</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Pièce d'identité, facture récente, etc.
                      </p>
                    </div>
                  </div>
                  
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-400 transition"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <i className="fas fa-cloud-upload-alt text-3xl text-green-500 mb-3"></i>
                    <p className="font-medium mb-2">Glissez-déposez vos documents ici</p>
                    <p className="text-gray-500 text-sm mb-3">ou</p>
                    <button 
                      type="button"
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
                    >
                      Sélectionner des fichiers
                    </button>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      multiple 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <p className="text-gray-500 text-xs mt-3">
                      Formats acceptés: PDF, JPG, PNG | Taille max: 10 Mo par fichier
                    </p>
                  </div>
                </div>
                
                {documentPreviews.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Documents sélectionnés:</h3>
                    <div className="space-y-3">
                      {documentPreviews.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center">
                            <div className="bg-white border border-gray-200 rounded-lg w-10 h-10 flex items-center justify-center mr-3">
                              <i className={`fas ${doc.type === 'application/pdf' ? 'fa-file-pdf text-red-500' : 'fa-file-image text-blue-500'} text-lg`}></i>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{doc.name}</div>
                              <div className="text-xs text-gray-500">{formatFileSize(doc.size)}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Verification Checkbox */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <i className="fas fa-shield-alt text-green-600 mr-2"></i> Clause de vérification
                </h2>
                
                <div className="flex items-start p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <input 
                    type="checkbox" 
                    id="verification" 
                    required
                    className="mt-1 mr-3 h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="verification" className="text-gray-800">
                    Je certifie sur l'honneur que les documents fournis sont authentiques, 
                    et que le bien appartient bien au propriétaire déclaré à l'étape précédente.
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={uploading || loading}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-800 disabled:opacity-50 flex items-center"
                >
                  {uploading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i> Envoi en cours...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-2"></i> Soumettre les documents
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}