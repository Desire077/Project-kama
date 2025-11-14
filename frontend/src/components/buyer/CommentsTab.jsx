import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import propertyClient from '../../api/propertyClient';

export default function CommentsTab() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Mock data for comments since there's no specific API endpoint
      const mockComments = [
        {
          _id: '1',
          property: {
            _id: 'prop1',
            title: 'Villa Moderne à Akanda',
            images: [
              { url: 'https://images.unsplash.com/photo-1523374547115-7d4d80884098?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' }
            ]
          },
          content: 'Très belle villa avec un excellent emplacement. Le jardin est magnifique!',
          rating: 5,
          createdAt: '2023-05-15T10:30:00Z'
        },
        {
          _id: '2',
          property: {
            _id: 'prop2',
            title: 'Appartement Moderne à Mont-Bouët',
            images: [
              { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' }
            ]
          },
          content: 'Appartement bien agencé mais un peu bruyant la nuit.',
          rating: 3,
          createdAt: '2023-04-22T14:15:00Z'
        },
        {
          _id: '3',
          property: {
            _id: 'prop3',
            title: 'Terrain à Owendo',
            images: [
              { url: 'https://images.unsplash.com/photo-1533933269825-4f1d9dfe4d46?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' }
            ]
          },
          content: 'Terrain parfait pour construire une maison familiale. Bon quartier.',
          rating: 4,
          createdAt: '2023-03-10T09:45:00Z'
        }
      ];
      
      setComments(mockComments);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Erreur lors du chargement des commentaires');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const saveEdit = async (commentId) => {
    try {
      // In a real implementation, this would call an API to update the comment
      setComments(comments.map(comment => 
        comment._id === commentId 
          ? { ...comment, content: editContent } 
          : comment
      ));
      
      setEditingComment(null);
      setEditContent('');
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Erreur lors de la mise à jour du commentaire');
    }
  };

  const deleteComment = async (commentId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      try {
        // In a real implementation, this would call an API to delete the comment
        setComments(comments.filter(comment => comment._id !== commentId));
      } catch (err) {
        console.error('Error deleting comment:', err);
        setError('Erreur lors de la suppression du commentaire');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <i 
            key={i} 
            className={`fas fa-star ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          ></i>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark"></div>
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

  if (comments.length === 0) {
    return (
      <div className="premium-card rounded-2xl p-12 text-center shadow-lg">
        <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
          <i className="fas fa-comments text-gray-500 text-2xl"></i>
        </div>
        <h2 className="text-2xl font-poppins font-bold text-text-primary mb-2">Vous n'avez pas encore laissé de commentaires</h2>
        <p className="text-text-secondary mb-6 font-inter">Partagez votre expérience après avoir visité des biens</p>
        <Link 
          to="/offers" 
          className="bg-gradient-to-r from-[#0D6EFD] to-[#007BFF] text-white px-6 py-3 rounded-lg font-poppins font-bold hover-lift transition-all duration-300 shadow hover:shadow-lg"
        >
          <i className="fas fa-search mr-2"></i> Parcourir les offres
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-poppins font-bold text-text-primary">Mes Commentaires</h2>
        <p className="text-text-secondary font-inter">Retrouvez tous les commentaires que vous avez laissés</p>
      </div>
      
      <div className="space-y-6">
        {comments.map(comment => (
          <div key={comment._id} className="premium-card rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/4 mb-4 md:mb-0">
                <Link to={`/offers/${comment.property._id}`}>
                  <img
                    src={comment.property.images[0]?.url || 'https://via.placeholder.com/150x150/cccccc/000000?text=Image'}
                    alt={comment.property.title}
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150x150/cccccc/000000?text=Image';
                      e.target.onerror = null;
                    }}
                  />
                </Link>
              </div>
              
              <div className="md:w-3/4 md:pl-6">
                <div className="flex justify-between items-start">
                  <div>
                    <Link to={`/offers/${comment.property._id}`} className="text-lg font-poppins font-bold text-text-primary hover:text-[#0D6EFD]">
                      {comment.property.title}
                    </Link>
                    <div className="mt-1">
                      {renderStars(comment.rating)}
                    </div>
                    <div className="text-sm text-text-secondary mt-1 font-inter">
                      Posté le {formatDate(comment.createdAt)}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {editingComment === comment._id ? (
                      <>
                        <button
                          onClick={() => saveEdit(comment._id)}
                          className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(comment)}
                          className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-blue-100 hover:text-blue-600"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => deleteComment(comment._id)}
                          className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-600"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  {editingComment === comment._id ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D6EFD] font-medium font-inter"
                      rows="3"
                    />
                  ) : (
                    <p className="text-text-primary font-inter">{comment.content}</p>
                  )}
                </div>
                
                <div className="mt-4">
                  <Link 
                    to={`/offers/${comment.property._id}`}
                    className="text-sm text-[#0D6EFD] hover:underline flex items-center font-inter"
                  >
                    <i className="fas fa-eye mr-2"></i> Voir l'offre associée
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}