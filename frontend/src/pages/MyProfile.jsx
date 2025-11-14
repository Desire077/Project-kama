import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile } from '../store/slices/authSlice';
import propertyClient from '../api/propertyClient';
import userClient from '../api/userClient';

export default function MyProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth);
  const [userProperties, setUserProperties] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load user profile and related data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading profile data', { user, token });
        
        // If no token, redirect to login
        if (!token) {
          console.log('No token, redirecting to login');
          navigate('/login');
          return;
        }

        // Load user properties using getByUser with current user's ID
        try {
          console.log('Loading user properties for user:', user?._id);
          if (user && user._id) {
            console.log('Calling propertyClient.getByUser with user ID:', user._id);
            const propertiesResponse = await propertyClient.getByUser(user._id);
            console.log('Properties response received:', propertiesResponse);
            console.log('Properties response type:', typeof propertiesResponse);
            console.log('Properties response isArray:', Array.isArray(propertiesResponse));
            // The response should already be an array from the updated propertyClient
            const propertiesData = Array.isArray(propertiesResponse) ? propertiesResponse : [];
            console.log('Processed properties data:', propertiesData);
            console.log('Processed properties data length:', propertiesData.length);
            setUserProperties(propertiesData);
          } else {
            console.log('User or user._id is missing:', { user });
          }
        } catch (propertiesError) {
          console.error('Error loading user properties:', propertiesError);
          console.error('Error name:', propertiesError.name);
          console.error('Error message:', propertiesError.message);
          if (propertiesError.response) {
            console.error('Error response:', propertiesError.response);
          }
          setUserProperties([]);
        }
        
        // Load user comments
        try {
          console.log('Loading user comments for user:', user?._id);
          if (user && user._id) {
            const commentsResponse = await userClient.getUserComments(user._id);
            console.log('Comments response:', commentsResponse);
            // Handle different response formats
            let commentsData = [];
            if (Array.isArray(commentsResponse)) {
              commentsData = commentsResponse;
            } else if (commentsResponse && commentsResponse.data) {
              commentsData = commentsResponse.data;
            } else if (commentsResponse) {
              // If it's a direct object, wrap it in an array
              commentsData = Array.isArray(commentsResponse) ? commentsResponse : [commentsResponse];
            } else {
              commentsData = commentsResponse || [];
            }
            console.log('Processed comments data:', commentsData);
            setUserComments(commentsData);
          }
        } catch (commentsError) {
          console.error('Error loading user comments:', commentsError);
          setUserComments([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Erreur lors du chargement du profil');
        setLoading(false);
      }
    };

    loadData();
  }, [user, token, dispatch, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-light py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Erreur</h1>
            <p className="text-text-secondary mb-6">
              {error}
            </p>
            <Link 
              to="/" 
              className="premium-btn-primary px-6 py-3 rounded-lg font-medium"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-light py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Profil non disponible</h1>
            <p className="text-text-secondary mb-6">
              Impossible de charger le profil.
            </p>
            <Link 
              to="/" 
              className="premium-btn-primary px-6 py-3 rounded-lg font-medium"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate average rating
  const averageRating = userComments.length > 0 
    ? (userComments.reduce((sum, comment) => sum + comment.rating, 0) / userComments.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-bg-light py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary-dark to-accent-soft p-8 text-white">
            <div className="flex flex-col md:flex-row items-center">
              <div className="relative mb-4 md:mb-0 md:mr-6">
                <div className="w-24 h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-2xl font-bold">
                  {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
              </div>
              
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-white text-opacity-80 mb-4">
                  {user.role === 'vendeur' ? 'Vendeur' : 'Acheteur'} vérifié
                </p>
                {userComments.length > 0 && (
                  <div className="flex items-center justify-center md:justify-start mb-2">
                    <div className="flex items-center mr-4">
                      <i className="fas fa-star text-yellow-400 mr-1"></i>
                      <span className="font-bold">{averageRating}</span>
                      <span className="text-white text-opacity-80 ml-1">/5</span>
                    </div>
                    <div className="text-white text-opacity-80">
                      ({userComments.length} {userComments.length === 1 ? 'avis' : 'avis'})
                    </div>
                  </div>
                )}
                <p className="text-white text-opacity-80">
                  Membre depuis {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'Date non disponible'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - User Info */}
              <div className="lg:col-span-1">
                <div className="bg-bg-light rounded-xl p-6 mb-6">
                  <h2 className="text-xl font-bold text-text-primary mb-4">Informations</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                      <div className="text-text-primary">{user.email}</div>
                    </div>
                    
                    {user.whatsapp && (
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">WhatsApp</label>
                        <div className="text-text-primary">{user.whatsapp}</div>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Rôle</label>
                      <div className="text-text-primary">
                        {user.role === 'vendeur' ? 'Vendeur' : 'Acheteur'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Membre depuis</label>
                      <div className="text-text-primary">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'Date non disponible'}
                      </div>
                    </div>
                    
                    {/* Subscription info if user has premium subscription */}
                    {user.subscription && user.subscription.active && (
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Statut Premium</label>
                        <div className="text-text-primary">
                          Actif jusqu'au {user.subscription.expiresAt ? new Date(user.subscription.expiresAt).toLocaleDateString('fr-FR') : 'N/A'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Link 
                  to="/profile/edit"
                  className="block w-full bg-primary-dark text-white text-center py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                >
                  <i className="fas fa-edit mr-2"></i> Modifier le profil
                </Link>
              </div>

              {/* Right Column - Properties and Comments */}
              <div className="lg:col-span-2">
                {/* User Properties */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-primary">
                      Mes annonces ({userProperties.length})
                    </h2>
                    <Link 
                      to="/vendre" 
                      className="text-primary-dark hover:text-opacity-80"
                    >
                      <i className="fas fa-plus mr-1"></i> Ajouter une annonce
                    </Link>
                  </div>
                  
                  {userProperties.length === 0 ? (
                    <div className="bg-bg-light rounded-xl p-8 text-center">
                      <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
                        <i className="fas fa-home text-gray-500 text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-medium text-text-primary mb-2">
                        Aucune annonce pour l'instant
                      </h3>
                      <p className="text-text-secondary mb-4">
                        Publiez votre première annonce immobilière.
                      </p>
                      <Link 
                        to="/vendre" 
                        className="premium-btn-primary px-4 py-2 rounded-lg"
                      >
                        Créer une annonce
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userProperties.map(property => (
                        <div key={property._id} className="bg-bg-light rounded-xl overflow-hidden hover-lift transition-all duration-300">
                          <Link to={`/offers/${property._id}`}>
                            {property.images && property.images.length > 0 ? (
                              <img 
                                src={property.images[0].url} 
                                alt={property.title} 
                                className="w-full h-32 object-cover"
                              />
                            ) : (
                              <div className="bg-gray-200 border-2 border-dashed w-full h-32 flex items-center justify-center">
                                <i className="fas fa-image text-gray-500"></i>
                              </div>
                            )}
                            
                            <div className="p-3">
                              <h3 className="font-medium text-text-primary truncate">{property.title}</h3>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-primary-dark font-bold">
                                  {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: property.currency || 'XAF',
                                    minimumFractionDigits: 0
                                  }).format(property.price)}
                                </span>
                                <span className="text-xs text-text-secondary">
                                  <i className="fas fa-eye mr-1"></i> {property.views || 0}
                                </span>
                              </div>
                              {/* Property status and expiration info */}
                              <div className="mt-2">
                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                  property.status === 'online' ? 'bg-green-100 text-green-800' :
                                  property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  property.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {property.status === 'online' ? 'En ligne' :
                                   property.status === 'pending' ? 'En attente' :
                                   property.status === 'approved' ? 'Approuvé' :
                                   property.status}
                                </span>
                                {property.boostedUntil && new Date(property.boostedUntil) > new Date() && (
                                  <span className="inline-block ml-2 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                                    Boosté jusqu'au {new Date(property.boostedUntil).toLocaleDateString('fr-FR')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* User Comments */}
                <div>
                  <h2 className="text-xl font-bold text-text-primary mb-4">
                    Avis et Commentaires ({userComments.length})
                  </h2>
                  
                  {userComments.length === 0 ? (
                    <div className="bg-bg-light rounded-xl p-8 text-center">
                      <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
                        <i className="fas fa-comment text-gray-500 text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-medium text-text-primary mb-2">
                        Aucun avis pour l'instant
                      </h3>
                      <p className="text-text-secondary">
                        Vous n'avez pas encore reçu d'avis de la part d'autres utilisateurs.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userComments.map(comment => (
                        <div key={comment._id} className="bg-bg-light rounded-xl p-4">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 rounded-full bg-primary-dark flex items-center justify-center text-white font-bold mr-3">
                              {comment.user?.firstName?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="font-medium text-text-primary">
                                {comment.user?.firstName} {comment.user?.lastName}
                              </div>
                              <div className="flex items-center">
                                <div className="flex text-yellow-400 mr-2">
                                  {[...Array(5)].map((_, i) => (
                                    <i 
                                      key={i} 
                                      className={`fas fa-star ${i < comment.rating ? '' : 'text-gray-300'}`}
                                    ></i>
                                  ))}
                                </div>
                                <span className="text-sm text-text-secondary">
                                  {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-text-primary mb-3">{comment.comment}</p>
                          
                          {comment.responses && comment.responses.length > 0 && (
                            <div className="border-l-4 border-primary-dark pl-4 ml-2 mt-3">
                              {comment.responses.map(response => (
                                <div key={response._id}>
                                  <div className="flex items-center mb-2">
                                    <div className="w-8 h-8 rounded-full bg-gabon-gold flex items-center justify-center text-white text-xs font-bold mr-2">
                                      {response.owner?.firstName?.charAt(0) || 'V'}
                                    </div>
                                    <div className="font-medium text-text-primary text-sm">
                                      {response.owner?.firstName} {response.owner?.lastName}
                                    </div>
                                    <span className="text-xs text-text-secondary ml-2">
                                      {new Date(response.createdAt).toLocaleDateString('fr-FR')}
                                    </span>
                                  </div>
                                  <p className="text-text-primary text-sm">{response.responseText}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}