import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import propertyClient from '../api/propertyClient';
import userClient from '../api/userClient';
import { SEO } from '../components/SEO';

export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Add review states
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  // Add response states
  const [responses, setResponses] = useState({});
  const [newResponses, setNewResponses] = useState({});
  // Add state for report modal near other state declarations
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  // Add state for comment report modal near other state declarations
  const [showCommentReportModal, setShowCommentReportModal] = useState(false);
  const [currentReportingComment, setCurrentReportingComment] = useState(null);
  const [commentReportReason, setCommentReportReason] = useState('');
  const [commentReportLoading, setCommentReportLoading] = useState(false);
  // Add state for success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  // Fallback suggestions states when offer is missing
  const [fallbackOffers, setFallbackOffers] = useState([]);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [fallbackError, setFallbackError] = useState('');

  // Add report functions inside the component
  const handleReportSubmit = async () => {
    if (!reportReason.trim()) {
      alert('Veuillez fournir une raison pour le signalement.');
      return;
    }

    setReportLoading(true);
    try {
      await propertyClient.reportProperty(id, { reason: reportReason });
      // Show success modal
      setSuccessMessage('Signalement envoyé avec succès.');
      setShowSuccessModal(true);
      setShowReportModal(false);
      setReportReason('');
    } catch (err) {
      console.error('Error reporting property:', err);
      alert('Erreur lors de l\'envoi du signalement.');
    } finally {
      setReportLoading(false);
    }
  };

  // Add comment report function inside the component
  const handleCommentReportSubmit = async () => {
    if (!commentReportReason.trim()) {
      alert('Veuillez fournir une raison pour le signalement.');
      return;
    }

    if (!currentReportingComment) return;

    setCommentReportLoading(true);
    try {
      await propertyClient.reportComment(
        currentReportingComment.propertyId, 
        currentReportingComment.reviewId, 
        { reason: commentReportReason }
      );
      // Show success modal
      setSuccessMessage('Signalement du commentaire envoyé avec succès.');
      setShowSuccessModal(true);
      setShowCommentReportModal(false);
      setCommentReportReason('');
      setCurrentReportingComment(null);
    } catch (err) {
      console.error('Error reporting comment:', err);
      alert('Erreur lors de l\'envoi du signalement du commentaire.');
    } finally {
      setCommentReportLoading(false);
    }
  };

  const loadOffer = async (abortSignal) => {
    // Validate ID before making API call
    if (!id || id === 'undefined' || id === 'null') {
      setError('ID d\'offre invalide');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError('');
    
    let timeoutId;
    
    // Add a timeout to ensure loading is reset even if the API call hangs
    timeoutId = setTimeout(() => {
      if (!abortSignal?.aborted) {
        setLoading(false);
        setError('Le chargement de l\'offre prend trop de temps. Veuillez réessayer.');
      }
    }, 30000); // 30 second timeout (increased from 10)
    
    try {
      const response = await propertyClient.getById(id);
      
      if (abortSignal?.aborted) {
        clearTimeout(timeoutId);
        return; // Request was cancelled
      }
      
      // Handle both possible response formats
      const property = response.property || response.data || response;
      
      if (!property || !property._id) {
        if (!abortSignal?.aborted) {
          setError('Offre non trouvée');
          setLoading(false);
        }
        clearTimeout(timeoutId);
        return;
      }
      
      if (!abortSignal?.aborted) {
        setOffer(property);
        
        // Check if property is in favorites
        if (user) {
          try {
            const favoritesResponse = await userClient.getFavorites();
            const favorites = favoritesResponse.data || favoritesResponse;
            const isFav = favorites.some(fav => fav._id === property._id);
            setIsFavorite(isFav);
          } catch (err) {
            console.error('Error checking favorites:', err);
          }
        }
        
        setLoading(false);
      }
      clearTimeout(timeoutId);
    } catch (err) {
      if (abortSignal?.aborted) {
        clearTimeout(timeoutId);
        return; // Request was cancelled
      }
      
      console.error('Error loading offer:', err);

      // Si l'utilisateur n'est pas autorisé (401), on le renvoie vers la connexion
      if (err.response && err.response.status === 401) {
        navigate(`/login?redirect=/offers/${id}`);
        clearTimeout(timeoutId);
        return;
      }
      
      // Show more detailed error message
      if (err.response && err.response.status === 404) {
        setError('Offre non trouvée');
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(`Erreur lors du chargement de l'offre: ${err.response.data.message}`);
      } else {
        setError('Erreur lors du chargement de l\'offre. Veuillez réessayer.');
      }
      
      setLoading(false);
      clearTimeout(timeoutId);
    }
  };

  const loadReviews = async () => {
    // Validate ID before making API call
    if (!id || id === 'undefined' || id === 'null') {
      console.warn('Invalid ID, skipping reviews load');
      return;
    }
    
    // Add a timeout to ensure the function doesn't hang
    const timeoutId = setTimeout(() => {
      console.log('Reviews loading timeout reached');
    }, 5000); // 5 second timeout
    
    try {
      const response = await propertyClient.getPropertyReviews(id);
      setReviews(response.reviews || []);
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      clearTimeout(timeoutId); // Clear the timeout when the API call completes
    }
  };

  // Load property and reviews when component mounts or id changes
  useEffect(() => {
    const abortController = new AbortController();
    
    loadOffer(abortController.signal);
    loadReviews();
    
    return () => {
      abortController.abort();
    };
  }, [id]);
  
  // Load fallback suggestions when the offer is not found or an error occurred
  useEffect(() => {
    const controller = new AbortController();
    const fetchFallback = async () => {
      if (!error) return;
      setFallbackLoading(true);
      setFallbackError('');
      try {
        const res = await propertyClient.getAll({ limit: 6, status: 'approved' });
        const properties = res.properties || res.data?.properties || [];
        // Pick 3 random suggestions to avoid overload
        const shuffled = properties.sort(() => 0.5 - Math.random());
        setFallbackOffers(shuffled.slice(0, 3));
      } catch (e) {
        console.error('Error loading fallback offers:', e);
        setFallbackError("Impossible de charger des suggestions pour le moment.");
      } finally {
        setFallbackLoading(false);
      }
    };
    fetchFallback();
    return () => controller.abort();
  }, [error]);

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleContactSeller = async () => {
    if (!user) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/offers/${id}`);
      return;
    }
    
    try {
      const response = await propertyClient.getContact(id);
      // Handle both possible response formats
      const contactInfo = response.data || response;
      
      // Vérifier que le vendeur a un numéro WhatsApp
      const whatsappNumber = contactInfo.owner?.whatsapp || contactInfo.whatsapp;
      if (!whatsappNumber) {
        alert('Le vendeur n\'a pas encore configuré son numéro WhatsApp.');
        return;
      }
      
      // Format phone number for WhatsApp (remove spaces, dashes, etc.)
      const formattedPhone = whatsappNumber.replace(/\D/g, '');
      
      // Rediriger vers WhatsApp
      window.open(`https://wa.me/${formattedPhone}?text=Bonjour, je suis intéressé par votre annonce sur Kama.`, '_blank');
    } catch (err) {
      console.error('Error getting contact info:', err);
      alert('Impossible de récupérer le numéro du vendeur. Veuillez réessayer plus tard.');
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/offers/${id}`);
      return;
    }
    
    try {
      if (isFavorite) {
        await userClient.removeFromFavorites(id);
      } else {
        await userClient.addToFavorites(id);
      }
      setIsFavorite(!isFavorite);
      
      // Update the offer's favorites count in the UI
      setOffer(prevOffer => ({
        ...prevOffer,
        favorites: isFavorite ? Math.max(0, (prevOffer.favorites || 1) - 1) : (prevOffer.favorites || 0) + 1
      }));
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Erreur lors de l\'ajout/retir de vos favoris');
    }
  };

  const handleDelete = async () => {
    if (!user) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/offers/${id}`);
      return;
    }
    
    // Show confirmation modal instead of browser confirm
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      // Call the delete API endpoint
      const response = await propertyClient.delete(id);
      console.log('Delete response:', response);
      
      // Close modal and show success message
      setShowDeleteModal(false);
      
      // Show success message
      alert('Annonce supprimée avec succès!');
      
      // Redirect to seller dashboard after deletion
      navigate('/dashboard/seller');
    } catch (err) {
      console.error('Error deleting property:', err);
      // Close modal
      setShowDeleteModal(false);
      // Show more detailed error message
      if (err.response && err.response.data && err.response.data.message) {
        alert(`Erreur lors de la suppression de l'annonce: ${err.response.data.message}`);
      } else if (err.response) {
        alert(`Erreur ${err.response.status}: ${err.response.statusText}`);
      } else {
        alert('Erreur lors de la suppression de l\'annonce. Veuillez réessayer.');
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const isOwner = user && offer && (user._id === (offer.owner._id || offer.owner) || user.id === (offer.owner._id || offer.owner));
  
  // Debug logs
  console.log('User:', user);
  console.log('Offer:', offer);
  console.log('User ID (_id):', user ? user._id : 'No user');
  console.log('User ID (id):', user ? user.id : 'No user');
  console.log('Offer owner ID:', offer ? (offer.owner._id || offer.owner) : 'No offer');
  console.log('Is Owner:', isOwner);

  const nextImage = () => {
    if (offer && offer.images && offer.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === offer.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (offer && offer.images && offer.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? offer.images.length - 1 : prevIndex - 1
      );
    }
  };

  // Review functions
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setReviewLoading(true);
    setReviewError('');
    
    try {
      const response = await propertyClient.addReview(id, newReview);
      setReviews(prev => [...prev, response.review]);
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
    } catch (err) {
      console.error('Error submitting review:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setReviewError(err.response.data.message);
      } else {
        setReviewError('Erreur lors de l\'ajout de l\'avis. Veuillez réessayer.');
      }
    } finally {
      setReviewLoading(false);
    }
  };

  const handleResponseChange = (reviewId, value) => {
    setNewResponses(prev => ({
      ...prev,
      [reviewId]: value
    }));
  };

  const handleResponseSubmit = async (reviewId) => {
    if (!user || !isOwner) return;
    
    const responseText = newResponses[reviewId];
    if (!responseText || responseText.trim().length === 0) {
      alert('La réponse est requise.');
      return;
    }
    
    try {
      const response = await propertyClient.respondToReview(id, reviewId, responseText);
      // Update the reviews state with the new response
      setReviews(prev => prev.map(review => 
        review._id === reviewId ? response.review : review
      ));
      // Clear the response input
      setNewResponses(prev => ({
        ...prev,
        [reviewId]: ''
      }));
    } catch (err) {
      console.error('Error submitting response:', err);
      alert('Erreur lors de l\'ajout de la réponse. Veuillez réessayer.');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fas fa-star ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          ></i>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SEO title="Chargement de l'annonce" />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gabon-green"></div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <SEO
          title="Annonce introuvable"
          description="L'annonce que vous recherchez n'existe pas ou n'est plus disponible sur Kama Immobilier."
        />
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-xl" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900">Offre non trouvée</h2>
            <p className="text-gray-600 mb-6">
              L'annonce que vous recherchez n'existe plus, a été retirée ou l'URL est incorrecte.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Link
                to="/offers"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-gabon-green text-white font-semibold hover:bg-dark-forest transition-colors"
              >
                <i className="fas fa-search mr-2" />
                Voir les autres offres
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-gabon-green text-gabon-green font-semibold hover:bg-green-50 transition-colors"
              >
                <i className="fas fa-home mr-2" />
                Retour à l'accueil
              </Link>
            </div>
          </div>

          {/* Fallback suggestions */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Suggestions similaires</h3>
            {fallbackLoading && (
              <div className="flex items-center text-gray-600"><i className="fas fa-spinner fa-spin mr-2"></i>Chargement des suggestions...</div>
            )}
            {fallbackError && (
              <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{fallbackError}</div>
            )}
            {!fallbackLoading && !fallbackError && fallbackOffers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fallbackOffers.map((p) => (
                  <div key={p._id} className="p-4 border rounded-lg">
                    <div className="font-medium text-gray-900 truncate">{p.title}</div>
                    <div className="text-sm text-gray-600">{p.address?.city || 'Gabon'}</div>
                    <div className="text-gabon-green font-bold mt-2">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: p.currency || 'XAF', minimumFractionDigits: 0 }).format(p.price)}</div>
                    <Link to={`/offers/${p._id}`} className="mt-3 inline-flex items-center text-gabon-green hover:text-dark-forest font-medium">
                      Voir l'offre <i className="fas fa-arrow-right ml-2"></i>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const title = `${offer.title} à ${offer.address?.city || 'Gabon'}`;
  const description = `${offer.surface || 0} m², ${offer.rooms || 0} chambres, ${formatPrice(offer.price, offer.currency)} - ${offer.address?.district || ''} ${offer.address?.city || ''}`.trim();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SEO title={title} description={description} />
      <div className="container mx-auto px-4">
        {/* Back button */}
        <div className="mb-6">
          <Link to="/offers" className="text-gabon-green hover:text-dark-forest flex items-center">
            <i className="fas fa-arrow-left mr-2"></i> Retour aux offres
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">

          <div className="p-6">
            {/* Fil d'Ariane */}
            <nav className="text-sm text-gray-500 mb-4" aria-label="Fil d'Ariane">
              <ol className="flex flex-wrap items-center gap-1">
                <li>
                  <Link to="/" className="hover:text-gabon-green">
                    Accueil
                  </Link>
                </li>
                <li className="mx-1 text-gray-400">/</li>
                <li>
                  <Link to="/offers" className="hover:text-gabon-green">
                    Offres
                  </Link>
                </li>
                <li className="mx-1 text-gray-400">/</li>
                <li className="font-medium text-gray-700 truncate max-w-[200px] md:max-w-[320px]">
                  {offer.title}
                </li>
              </ol>
            </nav>

            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{offer.title}</h1>
                <p className="text-gray-600 mb-4">
                  <i className="fas fa-map-marker-alt mr-2 text-gabon-green"></i>
                  {offer.address?.street ? `${offer.address.street}, ` : ''}
                  {offer.address?.district ? `${offer.address.district}, ` : ''}
                  {offer.address?.city || 'Gabon'}
                </p>
                
              </div>
              
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <div className="text-right">
                  <div className="text-3xl font-bold text-gabon-green mb-2">
                    {formatPrice(offer.price, offer.currency)}
                  </div>
                  <div className="text-gray-600">
                    {offer.surface} m² • {offer.rooms || 0} chambres
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gabon-beige rounded-lg">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-lg font-semibold text-gabon-green">{offer.rooms || 0}</div>
                <div className="text-sm text-gray-600">Chambres</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-lg font-semibold text-gabon-green">{offer.bathrooms || 0}</div>
                <div className="text-sm text-gray-600">Salles de bain</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-lg font-semibold text-gabon-green">{offer.kitchens || 0}</div>
                <div className="text-sm text-gray-600">Cuisines</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-lg font-semibold text-gabon-green">{offer.livingRooms || 0}</div>
                <div className="text-sm text-gray-600">Salons</div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 whitespace-pre-line">{offer.description}</p>
              </div>
              

            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Caractéristiques</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                  <i className={`fas fa-${offer.terrace ? 'check' : 'times'} mr-2 ${offer.terrace ? 'text-gabon-green' : 'text-red-600'}`}></i>
                  <span className="font-medium">Terrasse</span>
                  {offer.terrace && <span className="ml-2 text-xs bg-gabon-green text-white px-2 py-1 rounded-full">Inclus</span>}
                </div>
                <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                  <i className={`fas fa-${offer.pool ? 'check' : 'times'} mr-2 ${offer.pool ? 'text-gabon-green' : 'text-red-600'}`}></i>
                  <span className="font-medium">Piscine</span>
                  {offer.pool && <span className="ml-2 text-xs bg-gabon-green text-white px-2 py-1 rounded-full">Inclus</span>}
                </div>
                <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                  <i className={`fas fa-${offer.parking ? 'check' : 'times'} mr-2 ${offer.parking ? 'text-gabon-green' : 'text-red-600'}`}></i>
                  <span className="font-medium">Parking</span>
                  {offer.parking && <span className="ml-2 text-xs bg-gabon-green text-white px-2 py-1 rounded-full">Inclus</span>}
                </div>
              </div>
            </div>

            {/* Image gallery */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-8" style={{ height: '650px', width: '100%' }}>
              {offer && offer.images && offer.images.length > 0 ? (
                <div className="relative w-full h-full flex items-center justify-center" style={{ height: '650px', width: '100%' }}>
                  <img
                    src={offer.images[currentImageIndex]?.url}
                    alt={`${offer.title} - Image ${currentImageIndex + 1}`}
                    className="object-contain"
                    style={{ 
                      maxHeight: '650px',
                      maxWidth: '100%',
                      width: 'auto',
                      height: 'auto',
                      minWidth: '800px',
                      minHeight: '600px',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      console.log('Image load error for:', offer.images[currentImageIndex]?.url);
                      // Try a different fallback image
                      e.target.src = 'https://via.placeholder.com/600x400/cccccc/000000?text=Image+Indisponible';
                      // If that also fails, show a simple placeholder
                      e.target.onerror = null;
                    }}
                  />
                  
                  {offer.images.length > 1 && (
                    <>
                      <button 
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition"
                        aria-label="Image précédente"
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      
                      <button 
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition"
                        aria-label="Image suivante"
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                      
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {offer.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full transition ${
                              index === currentImageIndex ? 'bg-white' : 'bg-gray-300'
                            }`}
                            aria-label={`Aller à l'image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
                  <span className="text-gray-500">Pas d'image disponible</span>
                </div>
              )}
            </div>

            {/* Owner info and contact with Trust Elements */}
            <div className="border-t pt-6 mb-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-lg font-semibold mb-2">Vendeur</h3>
                  <div className="flex items-center">
                    <div className="bg-gabon-green border-2 border-gabon-green rounded-xl w-12 h-12 flex items-center justify-center mr-3">
                      <i className="fas fa-user text-white"></i>
                    </div>
                    <div>
                      <div className="font-medium flex items-center">
                        <Link to={`/profile/${offer.owner._id}`} className="hover:underline">
                          {offer.owner.firstName} {offer.owner.lastName}
                        </Link>
                        {/* Authority Element - Verified Seller */}
                        <span className="ml-2 bg-gabon-gold text-gray-900 text-xs px-2 py-1 rounded-full">
                          <i className="fas fa-check mr-1"></i> Vérifié
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Membre depuis {offer.owner.createdAt ? new Date(offer.owner.createdAt).toLocaleDateString('fr-FR') : 'Date non disponible'}
                      </div>
                      
                      {/* Social Proof Element */}
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <i className="fas fa-thumbs-up text-gabon-green mr-1"></i>
                        <span>98% satisfaction clients</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  {isOwner ? (
                    <div className="flex space-x-2">
                      <Link
                        to={`/offers/${offer._id}/edit`}
                        className="bg-gabon-green text-white px-4 py-2 rounded font-medium"
                      >
                        <i className="fas fa-edit mr-2"></i> Modifier
                      </Link>
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
                      >
                        <i className="fas fa-trash mr-2"></i> Supprimer
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleContactSeller}
                        className="bg-gabon-green text-white px-6 py-3 rounded-lg font-bold hover:bg-dark-forest transition-colors duration-300 flex items-center"
                      >
                        <i className="fab fa-whatsapp mr-2"></i> Contacter le vendeur
                      </button>
                      <button
                        onClick={() => setShowReportModal(true)}
                        className="px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-300 flex items-center"
                      >
                        <i className="fas fa-flag mr-2"></i> Signaler
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Avis des acheteurs</h3>
                {!showReviewForm && user && !isOwner && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-gabon-green text-white px-4 py-2 rounded-lg hover:bg-dark-forest transition-colors duration-300"
                  >
                    <i className="fas fa-plus mr-2"></i> Ajouter un avis
                  </button>
                )}
              </div>

              {showReviewForm && (
                <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold mb-4">Votre avis</h4>
                  {reviewError && (
                    <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
                      {reviewError}
                    </div>
                  )}
                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                            className="text-2xl focus:outline-none"
                          >
                            <i className={`fas fa-star ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire</label>
                      <textarea
                        name="comment"
                        value={newReview.comment}
                        onChange={handleReviewChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gabon-green"
                        placeholder="Partagez votre expérience..."
                        required
                      ></textarea>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={reviewLoading}
                        className="bg-gabon-green text-white px-4 py-2 rounded-lg hover:bg-dark-forest transition-colors duration-300 disabled:opacity-50"
                      >
                        {reviewLoading ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i> Envoi...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane mr-2"></i> Publier
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review._id} className="p-6 bg-white rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gabon-green flex items-center justify-center text-white font-bold mr-3">
                            {review.user?.firstName?.charAt(0) || review.user?.lastName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium">{review.user?.firstName} {review.user?.lastName}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                        <div className="flex">{renderStars(review.rating)}</div>
                      </div>
                      <p className="text-gray-700 mb-4">{review.comment}</p>
                      
                      {/* Response */}
                      {review.responses && review.responses.length > 0 && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-gabon-green">
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 rounded-full bg-gabon-green flex items-center justify-center text-white text-xs font-bold mr-2">
                              {review.responses[0].owner?.firstName?.charAt(0) || review.responses[0].owner?.lastName?.charAt(0) || 'V'}
                            </div>
                            <div className="font-medium text-gabon-green">
                              {review.responses[0].owner?.firstName} {review.responses[0].owner?.lastName}
                            </div>
                            <span className="ml-2 text-xs bg-gabon-green bg-opacity-20 text-gabon-green px-2 py-1 rounded-full">
                              Vendeur
                            </span>
                          </div>
                          <p className="text-gray-700">{review.responses[0].responseText}</p>
                          <div className="text-xs text-gray-500 mt-2">
                            {new Date(review.responses[0].createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      )}
                      
                      {/* Add response form for owner */}
                      {isOwner && (!review.responses || review.responses.length === 0) && (
                        <div className="mt-4">
                          <textarea
                            value={newResponses[review._id] || ''}
                            onChange={(e) => handleResponseChange(review._id, e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gabon-green"
                            placeholder="Répondre à cet avis..."
                          ></textarea>
                          <button
                            onClick={() => handleResponseSubmit(review._id)}
                            className="mt-2 bg-gabon-green text-white px-4 py-2 rounded-lg hover:bg-dark-forest transition-colors duration-300 text-sm"
                          >
                            <i className="fas fa-reply mr-2"></i> Répondre
                          </button>
                        </div>
                      )}
                      {/* Report button for all users except the comment author */}
                      {user && user._id !== review.user?._id && (
                        <div className="mt-2">
                          <button
                            onClick={() => {
                              setCurrentReportingComment({ reviewId: review._id, propertyId: id });
                              setShowCommentReportModal(true);
                            }}
                            className="text-sm text-red-600 hover:text-red-800 flex items-center"
                          >
                            <i className="fas fa-flag mr-1"></i> Signaler
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-comment-alt text-gray-300 text-3xl mb-3"></i>
                  <p className="text-gray-500">Aucun avis pour le moment. Soyez le premier à partager votre expérience !</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add report modal near the delete modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Signaler cette annonce</h3>
            <p className="text-gray-600 mb-4">
              Veuillez expliquer pourquoi vous signalez cette annonce :
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gabon-green"
              placeholder="Entrez votre raison ici..."
            ></textarea>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                disabled={reportLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleReportSubmit}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 disabled:opacity-50"
                disabled={reportLoading}
              >
                {reportLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Envoi...
                  </>
                ) : (
                  'Signaler'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add comment report modal near the other modals */}
      {showCommentReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Signaler ce commentaire</h3>
            <p className="text-gray-600 mb-4">
              Veuillez expliquer pourquoi vous signalez ce commentaire :
            </p>
            <textarea
              value={commentReportReason}
              onChange={(e) => setCommentReportReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gabon-green"
              placeholder="Entrez votre raison ici..."
            ></textarea>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowCommentReportModal(false);
                  setCurrentReportingComment(null);
                  setCommentReportReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                disabled={commentReportLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleCommentReportSubmit}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 disabled:opacity-50"
                disabled={commentReportLoading}
              >
                {commentReportLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Envoi...
                  </>
                ) : (
                  'Signaler'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Succès</h3>
            <p className="text-gray-600 mb-6">
              {successMessage}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 bg-gabon-green text-white rounded-lg hover:bg-dark-forest transition-colors duration-300"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}