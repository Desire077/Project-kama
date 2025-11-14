import React, { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    // Simulate form submission
    try {
      // In a real app, you would send the data to your backend here
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setSubmitError('Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-kama-bg py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-kama-vert mb-4">Contactez-nous</h1>
          <p className="text-kama-muted max-w-2xl mx-auto">
            Notre équipe est à votre disposition pour répondre à toutes vos questions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <div className="bg-white rounded-xl shadow-kama-soft p-8 h-full">
              <h2 className="text-2xl font-bold text-kama-vert mb-6">Informations de contact</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-kama-gold bg-opacity-10 p-3 rounded-lg mr-4">
                    <i className="fas fa-map-marker-alt text-kama-gold text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-kama-text mb-1">Adresse</h3>
                    <p className="text-kama-muted">Libreville, Gabon</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-kama-gold bg-opacity-10 p-3 rounded-lg mr-4">
                    <i className="fas fa-phone-alt text-kama-gold text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-kama-text mb-1">Téléphone</h3>
                    <p className="text-kama-muted">+241 00 00 00 00</p>
                    <p className="text-kama-muted">Lun-Ven: 8h00-18h00</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-kama-gold bg-opacity-10 p-3 rounded-lg mr-4">
                    <i className="fas fa-envelope text-kama-gold text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-kama-text mb-1">Email</h3>
                    <p className="text-kama-muted">contact@kama-immobilier.ga</p>
                    <p className="text-kama-muted">support@kama-immobilier.ga</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-kama-gold bg-opacity-10 p-3 rounded-lg mr-4">
                    <i className="fas fa-clock text-kama-gold text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-kama-text mb-1">Horaires</h3>
                    <p className="text-kama-muted">Lundi - Vendredi: 8h00 - 18h00</p>
                    <p className="text-kama-muted">Samedi: 9h00 - 14h00</p>
                    <p className="text-kama-muted">Dimanche: Fermé</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="font-semibold text-kama-text mb-4">Suivez-nous</h3>
                <div className="flex space-x-4">
                  <a href="#" className="bg-kama-vert text-white p-3 rounded-full hover:bg-opacity-90 transition">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" className="bg-kama-vert text-white p-3 rounded-full hover:bg-opacity-90 transition">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="bg-kama-vert text-white p-3 rounded-full hover:bg-opacity-90 transition">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="#" className="bg-kama-vert text-white p-3 rounded-full hover:bg-opacity-90 transition">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div>
            <div className="bg-white rounded-xl shadow-kama-soft p-8">
              <h2 className="text-2xl font-bold text-kama-vert mb-6">Envoyez-nous un message</h2>
              
              {submitSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                  <p>Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.</p>
                </div>
              )}
              
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  <p>{submitError}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-kama-text mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kama-vert focus:border-transparent"
                      placeholder="Votre nom"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-kama-text mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kama-vert focus:border-transparent"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="subject" className="block text-sm font-medium text-kama-text mb-2">
                    Sujet *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kama-vert focus:border-transparent"
                    placeholder="Sujet de votre message"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-kama-text mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kama-vert focus:border-transparent"
                    placeholder="Votre message..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-kama-vert text-white py-3 px-6 rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <i className="fas fa-spinner fa-spin mr-2"></i> Envoi en cours...
                    </span>
                  ) : (
                    'Envoyer le message'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}