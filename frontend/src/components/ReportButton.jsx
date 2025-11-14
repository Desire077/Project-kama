import React, { useState } from 'react';
import axios from '../api/api';

export default function ReportButton({ type, id, onReport }) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    if (!reason.trim()) {
      alert('Veuillez fournir une raison pour le signalement.');
      return;
    }

    setLoading(true);
    try {
      if (type === 'property') {
        await axios.post(`/api/properties/${id}/report`, { reason });
      } else if (type === 'comment') {
        // We need the propertyId for comment reporting
        // This would need to be passed as a prop in a real implementation
        console.error('Property ID required for comment reporting');
        return;
      }
      
      alert('Signalement envoyé avec succès.');
      setShowModal(false);
      setReason('');
      if (onReport) onReport();
    } catch (error) {
      console.error('Error reporting:', error);
      alert('Erreur lors de l\'envoi du signalement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="text-sm text-red-600 hover:text-red-800 flex items-center"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        Signaler
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Signaler ce contenu</h3>
            <p className="text-gray-600 mb-4">
              Veuillez expliquer pourquoi vous signalez ce {type === 'property' ? 'bien' : 'commentaire'} :
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kama-vert focus:border-kama-vert"
              placeholder="Entrez votre raison ici..."
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                onClick={handleReport}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Envoi...' : 'Signaler'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}