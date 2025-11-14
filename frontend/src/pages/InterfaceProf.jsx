import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import propertyClient from '../api/propertyClient';

export default function InterfaceProf() {
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('properties');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (!user) {
    return <div className="p-4">Veuillez vous connecter pour accéder à votre espace vendeur.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                className={`py-5 px-6 text-center whitespace-nowrap ${activeTab === 'properties' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setActiveTab('properties')}
              >
                <i className="fas fa-home mr-2"></i>Mes Annonces
              </button>
              <button
                className={`py-5 px-6 text-center whitespace-nowrap ${activeTab === 'documents' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setActiveTab('documents')}
              >
                <i className="fas fa-file-contract mr-2"></i>Documents
              </button>
              <button
                className={`py-5 px-6 text-center whitespace-nowrap ${activeTab === 'payments' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setActiveTab('payments')}
              >
                <i className="fas fa-credit-card mr-2"></i>Paiements
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Espace Vendeur</h1>
              <p className="text-gray-600">Gérez vos annonces immobilières et vos documents</p>
            </div>

            {activeTab === 'properties' && <PropertiesTab properties={properties} loading={loading} error={error} formatPrice={formatPrice} />}
            {activeTab === 'documents' && <DocumentsTab properties={properties} loading={loading} error={error} navigate={navigate} />}
            {activeTab === 'payments' && <PaymentsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertiesTab({ properties, loading, error, formatPrice }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
        {error}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Mes Annonces</h2>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
          <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
            <i className="fas fa-home text-gray-500 text-2xl"></i>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Vous n'avez pas encore d'annonces</h3>
          <p className="text-gray-600 mb-6">Créez votre première annonce immobilière</p>
          <Link 
            to="/dashboard/seller/new" 
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-indigo-800 transition shadow-lg"
          >
            <i className="fas fa-plus mr-2"></i> Créer une annonce
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Mes Annonces</h2>
        <Link 
          to="/dashboard/seller/new" 
          className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg font-bold hover:from-blue-700 hover:to-indigo-800 transition"
        >
          <i className="fas fa-plus mr-2"></i> Nouvelle annonce
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(property => (
          <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <Link to={`/offers/${property._id}`}>
              {property.images && property.images.length > 0 ? (
                <div className="relative">
                  <img
                    src={property.images[0].url}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/600x400/cccccc/000000?text=Image+Indisponible';
                      e.target.onerror = null;
                    }}
                  />
                  {property.images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      +{property.images.length - 1}
                    </div>
                  )}
                  <div className={`absolute top-2 left-2 ${property.status === 'online' ? 'bg-green-500' : property.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'} text-white text-xs px-2 py-1 rounded-full font-bold`}>
                    {property.status === 'online' ? 'En ligne' : property.status === 'pending' ? 'En attente' : 'Retirée'}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 flex items-center justify-center">
                  <span className="text-gray-500">Pas d'image</span>
                </div>
              )}
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{property.title}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {property.type}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">
                  <i className="fas fa-map-marker-alt text-blue-500 mr-1"></i>
                  {property.address?.city}, {property.address?.district || ''}
                </p>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xl font-bold text-blue-600">
                    {formatPrice(property.price, property.currency)}
                  </span>
                  <span className="text-sm text-gray-500">
                    <i className="fas fa-ruler-combined mr-1"></i>
                    {property.surface} m²
                  </span>
                </div>
                
                <div className="flex justify-between border-t border-gray-100 pt-3">
                  <div className="flex text-sm text-gray-600">
                    <span className="mr-3 flex items-center">
                      <i className="fas fa-bed mr-1 text-blue-500"></i> {property.rooms || 0}
                    </span>
                    <span className="mr-3 flex items-center">
                      <i className="fas fa-bath mr-1 text-blue-500"></i> {property.bathrooms || 0}
                    </span>
                    <span className="flex items-center">
                      <i className="fas fa-car mr-1 text-blue-500"></i> {property.parking ? 'Oui' : 'Non'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    <i className="fas fa-file-alt mr-1"></i>
                    {property.documents?.length || 0} document{property.documents?.length !== 1 ? 's' : ''}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/dashboard/seller/documents`);
                    }}
                    className="text-xs text-green-600 hover:text-green-800 font-medium"
                  >
                    Gérer les documents
                  </button>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocumentsTab({ properties, loading, error, navigate }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Documents</h2>
      
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 text-center border border-green-200 mb-8">
        <div className="mx-auto bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-file-contract text-2xl"></i>
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">Soumission de documents</h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Ajoutez les documents prouvant que le bien vous appartient. Votre annonce ne sera visible qu'après 
          vérification manuelle par notre équipe. Ces documents ne seront jamais partagés publiquement.
        </p>
        <button
          onClick={() => navigate('/dashboard/seller/documents')}
          className="inline-flex items-center bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-3 rounded-lg font-bold hover:from-green-700 hover:to-emerald-800 transition shadow-lg"
        >
          <i className="fas fa-upload mr-2"></i> Soumettre des documents
        </button>
      </div>
      
      {properties.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Mes annonces avec documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {properties.map(property => (
              <div key={property._id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{property.title}</h4>
                    <p className="text-sm text-gray-600">{property.address?.city || 'Adresse non spécifiée'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${property.status === 'online' ? 'bg-green-100 text-green-800' : property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {property.status === 'online' ? 'En ligne' : property.status === 'pending' ? 'En attente' : 'Retirée'}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <i className="fas fa-file-alt text-gray-500 mr-2"></i>
                    <span>{property.documents?.length || 0} document{property.documents?.length > 1 ? 's' : ''} associé{property.documents?.length > 1 ? 's' : ''}</span>
                  </div>
                  
                  {property.documents && property.documents.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {property.documents.map((doc, index) => (
                        <a 
                          key={index} 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded hover:bg-blue-100"
                        >
                          <i className="fas fa-file-pdf mr-1"></i> Document {index + 1}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">Aucun document associé</div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <button 
                    onClick={() => navigate('/dashboard/seller/documents')}
                    className="text-sm text-green-600 hover:text-green-800 font-medium"
                  >
                    <i className="fas fa-plus mr-1"></i> Ajouter des documents
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentsTab() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Historique des Paiements</h2>
      <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
        <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
          <i className="fas fa-credit-card text-gray-500 text-2xl"></i>
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun paiement effectué</h3>
        <p className="text-gray-600 mb-6">Boostez vos annonces pour augmenter leur visibilité</p>
        <button className="inline-flex items-center bg-gradient-to-r from-purple-600 to-violet-700 text-white px-6 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-violet-800 transition shadow-lg">
          <i className="fas fa-rocket mr-2"></i> Booster une annonce
        </button>
      </div>
    </div>
  );
}