import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import userClient from '../api/userClient';
import { setUser } from '../store/slices/authSlice';

export default function EditProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth);

  const [form, setForm] = useState({ firstName: '', lastName: '', whatsapp: '', dateOfBirth: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        if (!token) {
          navigate('/login');
          return;
        }
        const res = await userClient.getProfile();
        const profile = res?.data?.user || res?.data || res;
        setForm({
          firstName: profile?.firstName || '',
          lastName: profile?.lastName || '',
          whatsapp: profile?.whatsapp || '',
          dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : ''
        });
        setLoading(false);
      } catch (e) {
        setError(e?.response?.data?.message || 'Erreur lors du chargement du profil');
        setLoading(false);
      }
    };
    load();
  }, [token, navigate]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        firstName: form.firstName?.trim(),
        lastName: form.lastName?.trim(),
        whatsapp: form.whatsapp?.trim(),
        dateOfBirth: form.dateOfBirth || undefined
      };
      const res = await userClient.updateProfile(payload);
      const updated = res?.data?.user || res?.user || res;
      if (updated) {
        dispatch(setUser(updated));
      }
      setSuccess('Profil mis à jour avec succès');
      // Optionally navigate back after a short delay
      setTimeout(() => navigate('/profile'), 1000);
    } catch (e) {
      setError(e?.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-bg-light py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-xl mx-auto">
          <div className="mb-4">
            <Link to="/profile" className="text-primary-dark hover:text-opacity-80">
              <i className="fas fa-arrow-left mr-2"></i> Retour au profil
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-text-primary mb-4">Modifier le profil</h1>
          {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4">{success}</div>}

          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1">Prénom</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-dark"
                placeholder="Votre prénom"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1">Nom</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-dark"
                placeholder="Votre nom"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1">WhatsApp</label>
              <input
                type="tel"
                name="whatsapp"
                value={form.whatsapp}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-dark"
                placeholder="Ex: +241XXXXXXXX"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-text-secondary mb-1">Date de naissance</label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-dark"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="premium-btn-primary px-4 py-2 rounded-lg disabled:opacity-50 w-full"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}