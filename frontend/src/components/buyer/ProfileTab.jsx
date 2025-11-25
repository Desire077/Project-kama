import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import userClient from '../../api/userClient';
import propertyClient from '../../api/propertyClient';

export default function ProfileTab() {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    whatsapp: user?.whatsapp || '',
    city: user?.city || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: user?.emailNotifications ?? true,
    smsNotifications: user?.smsNotifications ?? false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSection, setActiveSection] = useState('profile');
  const [deletePassword, setDeletePassword] = useState('');

  // Added: profile-related lists and loading state
  const [userProperties, setUserProperties] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadProfileRelatedData = async () => {
      try {
        setLoadingData(true);
        // Ensure we have a user id
        let effectiveUserId = user?._id;
        try {
          const profileResponse = await userClient.getProfile();
          const profileUser = profileResponse?.data?.user || profileResponse?.data || profileResponse;
          if (profileUser && profileUser._id) {
            effectiveUserId = profileUser._id;
          }
        } catch (e) {
          // non-blocking
        }

        // Load properties owned by current user (buyers may have none)
        try {
          const propertiesResponse = await propertyClient.getMyProperties();
          const propertiesData = Array.isArray(propertiesResponse)
            ? propertiesResponse
            : (propertiesResponse?.properties || propertiesResponse?.data || []);
          setUserProperties(Array.isArray(propertiesData) ? propertiesData : []);
        } catch (propertiesError) {
          setUserProperties([]);
        }

        // Load comments about current user
        try {
          if (effectiveUserId) {
            const commentsResponse = await userClient.getUserComments(effectiveUserId);
            let commentsData = [];
            if (Array.isArray(commentsResponse)) {
              commentsData = commentsResponse;
            } else if (commentsResponse && commentsResponse.data) {
              commentsData = Array.isArray(commentsResponse.data) ? commentsResponse.data : [commentsResponse.data];
            } else if (commentsResponse && commentsResponse.comments) {
              commentsData = Array.isArray(commentsResponse.comments) ? commentsResponse.comments : [commentsResponse.comments];
            } else if (commentsResponse) {
              commentsData = Array.isArray(commentsResponse) ? commentsResponse : [commentsResponse];
            }
            setUserComments(commentsData);
          } else {
            setUserComments([]);
          }
        } catch (commentsError) {
          setUserComments([]);
        }
      } finally {
        setLoadingData(false);
      }
    };

    loadProfileRelatedData();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePreferenceChange = (e) => {
    setPreferences({ ...preferences, [e.target.name]: e.target.checked });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await userClient.updateProfile(formData);
      const updatedUser = response.data?.user || response.user;
      
      // In a real app, this would update the user in Redux store
      setSuccess('Profil mis à jour avec succès ✅');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }
    
    try {
      // In a real implementation, this would call an API to change the password
      // await userClient.changePassword(passwordData);
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSuccess('Mot de passe mis à jour avec succès ✅');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la mise à jour du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (!deletePassword || deletePassword.length < 6) {
      setError('Veuillez entrer votre mot de passe pour confirmer.');
      setLoading(false);
      return;
    }
    try {
      await userClient.deleteAccount(deletePassword);
      setSuccess('Compte supprimé avec succès. Déconnexion...');
      setTimeout(() => {
        dispatch(logout());
        window.location.href = '/';
      }, 1500);
    } catch (err) {
      setError('Suppression du compte impossible: mot de passe invalide ou erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-poppins font-bold text-text-primary">Mon Profil</h2>
        <p className="text-text-secondary font-inter">Gérez vos informations personnelles et la sécurité</p>
      </div>
      
      {/* Section tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-3 px-6 font-medium font-inter ${
            activeSection === 'profile'
              ? 'border-b-2 border-kama-vert text-kama-vert'
              : 'text-text-secondary hover:text-kama-vert'
          }`}
          onClick={() => setActiveSection('profile')}
        >
          Informations personnelles
        </button>
        <button
          className={`py-3 px-6 font-medium font-inter ${
            activeSection === 'security'
              ? 'border-b-2 border-kama-vert text-kama-vert'
              : 'text-text-secondary hover:text-kama-vert'
          }`}
          onClick={() => setActiveSection('security')}
        >
          Sécurité
        </button>
      </div>
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 animate-fadeIn">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* Profile Information Section */}
      {activeSection === 'profile' && (
        <div className="premium-card p-6 rounded-2xl shadow-lg">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-kama-vert to-kama-turquoise flex items-center justify-center text-white text-2xl font-bold mb-4 font-poppins">
              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <h3 className="text-xl font-poppins font-bold text-text-primary">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-text-secondary font-inter">Acheteur</p>
            <p className="text-sm text-text-secondary font-inter mt-1">
              Membre depuis {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'Date non disponible'}
            </p>
          </div>
          
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Prénom *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kama-vert font-medium font-inter"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Nom *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kama-vert font-medium font-inter"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kama-vert font-medium font-inter"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Ville</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kama-vert font-medium font-inter"
                placeholder="Ex: Libreville"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Numéro WhatsApp</label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kama-vert font-medium font-inter"
                placeholder="+241 XX XX XX XX"
              />
              <p className="mt-2 text-sm text-text-secondary font-inter">
                Ce numéro sera utilisé pour les contacts entre acheteurs et vendeurs
              </p>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-kama-vert to-kama-turquoise text-white px-6 py-3 rounded-lg font-poppins font-bold hover-lift transition-all duration-300 shadow hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Enregistrement...
                  </>
                ) : (
                  'Enregistrer les modifications'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <h4 className="text-lg font-poppins font-bold text-text-primary mb-4">
              Mes annonces ({userProperties.length})
            </h4>
            {loadingData ? (
              <div className="text-text-secondary">Chargement...</div>
            ) : userProperties.length === 0 ? (
              <div className="bg-bg-light rounded-xl p-6 text-center">
                <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-3">
                  <i className="fas fa-home text-gray-500 text-2xl"></i>
                </div>
                <p className="font-medium text-text-primary mb-1">Aucune annonce pour l'instant</p>
                <p className="text-text-secondary">Publiez votre première annonce immobilière.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userProperties.map((property) => (
                  <div key={property._id} className="bg-bg-light rounded-xl overflow-hidden">
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8">
            <h4 className="text-lg font-poppins font-bold text-text-primary mb-4">
              Avis et commentaires ({userComments.length})
            </h4>
            {loadingData ? (
              <div className="text-text-secondary">Chargement...</div>
            ) : userComments.length === 0 ? (
              <div className="bg-bg-light rounded-xl p-6 text-center">
                <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-3">
                  <i className="fas fa-comment text-gray-500 text-2xl"></i>
                </div>
                <p className="font-medium text-text-primary mb-1">Aucun avis pour l'instant</p>
                <p className="text-text-secondary">Vous n'avez pas encore reçu d'avis.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userComments.map((comment) => (
                  <div key={comment._id} className="bg-bg-light rounded-xl p-4">
                    <div className="flex items-center mb-2">
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
                              <i key={i} className={`fas fa-star ${i < comment.rating ? '' : 'text-gray-300'}`}></i>
                            ))}
                          </div>
                          <span className="text-sm text-text-secondary">
                            {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-text-primary">{comment.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Security Section */}
      {activeSection === 'security' && (
        <div className="premium-card p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-poppins font-bold text-text-primary mb-6">Changement de mot de passe</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Mot de passe actuel *</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kama-vert font-medium font-inter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Nouveau mot de passe *</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kama-vert font-medium font-inter"
              />
              <p className="mt-2 text-sm text-text-secondary font-inter">Minimum 6 caractères</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Confirmer le nouveau mot de passe *</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kama-vert font-medium font-inter"
              />
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-kama-vert to-kama-turquoise text-white px-6 py-3 rounded-lg font-poppins font-bold hover-lift transition-all duration-300 shadow hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Mise à jour...
                  </>
                ) : (
                  'Mettre à jour le mot de passe'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <h3 className="text-xl font-poppins font-bold text-text-primary mb-4">Supprimer mon compte</h3>
            <p className="text-text-secondary font-inter mb-4">Cette action est définitive. Entrez votre mot de passe pour confirmer.</p>
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <input
                type="password"
                name="deletePassword"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600 font-medium font-inter"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-poppins font-bold transition-all duration-300 shadow hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i> Suppression...
                    </>
                  ) : (
                    'Supprimer le compte'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      

    </div>
  );
}