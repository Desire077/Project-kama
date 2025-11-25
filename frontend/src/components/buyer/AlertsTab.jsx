import React, { useState, useEffect } from 'react';
import userClient from '../../api/userClient';

export default function AlertsTab() {
  const [alerts, setAlerts] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    type: 'maison',
    minPrice: '',
    maxPrice: '',
    city: '',
    rooms: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await userClient.getAlerts();
      const alertsData = response.data || response;

      // Merge with persisted active states in localStorage
      const savedActive = JSON.parse(localStorage.getItem('kama_alert_active') || '{}');
      const merged = (alertsData || []).map(a => ({
        ...a,
        active: savedActive[a._id] ?? (a.active ?? false)
      }));

      setAlerts(merged);
    } catch (err) {
      console.error('Error loading alerts:', err);
      setError('Erreur lors du chargement des alertes');

      // Fallback: try to load from localStorage when API fails
      const savedActive = JSON.parse(localStorage.getItem('kama_alert_active') || '{}');
      const savedAlerts = JSON.parse(localStorage.getItem('kama_alerts_cache') || '[]');
      if (savedAlerts.length > 0) {
        const merged = savedAlerts.map(a => ({
          ...a,
          active: savedActive[a._id] ?? (a.active ?? false)
        }));
        setAlerts(merged);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await userClient.createAlert(formData);
      const created = res.alert || res.data?.alert || formData;
      const newAlert = { ...created, _id: created._id || `${Date.now()}` };

      // Update cache
      const cache = JSON.parse(localStorage.getItem('kama_alerts_cache') || '[]');
      localStorage.setItem('kama_alerts_cache', JSON.stringify([ ...cache, newAlert ]));

      setAlerts(prev => [ ...prev, { ...newAlert, active: false } ]);
      setShowForm(false);
      setSuccess('Alerte créée avec succès');

      // Refresh matching properties
      window.dispatchEvent(new Event('refreshMatchingProperties'));
    } catch (err) {
      console.error('Error creating alert:', err);
      setError('Erreur lors de la création de l\'alerte');
    } finally {
      setLoading(false);
    }
  };

  const deleteAlert = async (id) => {
    try {
      await userClient.deleteAlert(id);
      setAlerts(alerts.filter(alert => alert._id !== id));

      // Update cache
      const cache = JSON.parse(localStorage.getItem('kama_alerts_cache') || '[]').filter(a => a._id !== id);
      localStorage.setItem('kama_alerts_cache', JSON.stringify(cache));
      const savedActive = JSON.parse(localStorage.getItem('kama_alert_active') || '{}');
      delete savedActive[id];
      localStorage.setItem('kama_alert_active', JSON.stringify(savedActive));
      
      // Refresh matching properties
      window.dispatchEvent(new Event('refreshMatchingProperties'));
    } catch (err) {
      console.error('Error deleting alert:', err);
      setError('Erreur lors de la suppression de l\'alerte');
    }
  };

  const toggleAlertStatus = (id) => {
    const next = alerts.map(alert => {
      if (alert._id === id) {
        return { ...alert, active: !alert.active };
      }
      return alert;
    });
    setAlerts(next);

    // Persist active flags locally (fallback when backend not available)
    const savedActive = JSON.parse(localStorage.getItem('kama_alert_active') || '{}');
    const changed = next.find(a => a._id === id);
    savedActive[id] = !!changed?.active;
    localStorage.setItem('kama_alert_active', JSON.stringify(savedActive));

    // Optional: dispatch refresh matching properties
    window.dispatchEvent(new Event('refreshMatchingProperties'));
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-poppins font-bold text-text-primary">Mes Alertes</h2>
          <p className="text-text-secondary font-inter">Soyez informé des nouvelles offres correspondant à vos critères</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-kama-vert to-kama-turquoise text-white px-5 py-3 rounded-lg font-poppins font-bold mt-4 md:mt-0 hover-lift transition-all duration-300 shadow hover:shadow-lg"
        >
          <i className="fas fa-plus mr-2"></i> Créer une alerte
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
      
      {showForm && (
        <div className="premium-card p-6 rounded-2xl mb-8 shadow-lg">
          <h3 className="text-xl font-poppins font-bold text-text-primary mb-4">Créer une nouvelle alerte</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Nom de l'alerte *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kama-vert font-medium font-inter"
                placeholder="Ex: Maison à Libreville"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Type de propriété</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kama-vert font-medium font-inter"
                >
                  <option value="maison">Maison</option>
                  <option value="appartement">Appartement</option>
                  <option value="terrain">Terrain</option>
                  <option value="vacances">Vacances</option>
                </select>
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
                <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Prix minimum (XAF)</label>
                <input
                  type="number"
                  name="minPrice"
                  value={formData.minPrice}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kama-vert font-medium font-inter"
                  placeholder="Ex: 5000000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Prix maximum (XAF)</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={formData.maxPrice}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kama-vert font-medium font-inter"
                  placeholder="Ex: 20000000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Nombre de chambres minimum</label>
                <select
                  name="rooms"
                  value={formData.rooms}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kama-vert font-medium font-inter"
                >
                  <option value="">Peu importe</option>
                  <option value="1">1 chambre</option>
                  <option value="2">2 chambres</option>
                  <option value="3">3 chambres</option>
                  <option value="4">4 chambres ou plus</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium font-inter"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-kama-vert to-kama-turquoise text-white px-5 py-3 rounded-lg font-medium font-inter hover-lift transition-all duration-300 shadow hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Création...
                  </>
                ) : (
                  'Créer l\'alerte'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {alerts.length === 0 ? (
        <div className="premium-card rounded-2xl p-12 text-center shadow-lg">
          <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
            <i className="fas fa-bell text-gray-500 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-poppins font-bold text-text-primary mb-2">Vous n'avez pas encore d'alertes</h2>
          <p className="text-text-secondary mb-6 font-inter">Créez des alertes pour être informé des nouvelles offres</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-kama-vert to-kama-turquoise text-white px-6 py-3 rounded-lg font-poppins font-bold hover-lift transition-all duration-300 shadow hover:shadow-lg"
          >
            <i className="fas fa-plus mr-2"></i> Créer une alerte
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alerts.map(alert => (
            <div key={alert._id} className="premium-card p-6 rounded-2xl shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-poppins font-bold text-text-primary">{alert.title}</h3>
                  <div className="flex items-center mt-1">
                    <div className={`w-3 h-3 rounded-full mr-2 ${alert.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-text-secondary font-inter">
                      {alert.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleAlertStatus(alert._id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      alert.active 
                        ? 'bg-kama-vert/10 text-kama-vert hover:bg-kama-vert/20' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <i className={`fas ${alert.active ? 'fa-bell' : 'fa-bell-slash'}`}></i>
                  </button>
                  <button
                    onClick={() => deleteAlert(alert._id)}
                    className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <div className="space-y-3 text-sm text-text-secondary font-inter">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium text-text-primary">{alert.type}</span>
                </div>
                {alert.city && (
                  <div className="flex justify-between">
                    <span>Ville:</span>
                    <span className="font-medium text-text-primary">{alert.city}</span>
                  </div>
                )}
                {(alert.minPrice || alert.maxPrice) && (
                  <div className="flex justify-between">
                    <span>Prix:</span>
                    <span className="font-medium text-text-primary">
                      {alert.minPrice ? `${Number(alert.minPrice).toLocaleString()} FCFA` : ''} 
                      {alert.minPrice && alert.maxPrice ? ' - ' : ''}
                      {alert.maxPrice ? `${Number(alert.maxPrice).toLocaleString()} FCFA` : ''}
                    </span>
                  </div>
                )}
                {alert.rooms && (
                  <div className="flex justify-between">
                    <span>Chambres min:</span>
                    <span className="font-medium text-text-primary">{alert.rooms}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Fréquence:</span>
                  <span className="font-medium text-text-primary">Quotidienne</span>
                </div>
                <div className="flex justify-between">
                  <span>Dernier envoi:</span>
                  <span className="font-medium text-text-primary">
                    {alert.lastSent ? new Date(alert.lastSent).toLocaleDateString('fr-FR') : 'Jamais'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-text-secondary font-inter">
                Créée le {new Date(alert.createdAt).toLocaleDateString('fr-FR')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}