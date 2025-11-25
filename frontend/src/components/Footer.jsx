import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Footer() {
  const navigate = useNavigate();
  const { user, token } = useSelector(state => state.auth);
  const [showBuyerModal, setShowBuyerModal] = useState(false);

  const handleSellClick = (e) => {
    e.preventDefault();
    // Not logged in -> go to login
    if (!token) {
      navigate('/login');
      return;
    }
    // Logged in: check role
    if (user?.role === 'vendeur') {
      navigate('/vendre');
    } else {
      setShowBuyerModal(true);
    }
  };

  return (
    <footer className="bg-kama-vert text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="bg-kama-dore text-kama-vert rounded-lg px-2 py-1 mr-2 font-bold">K</span>
              Kama Immobilier
            </h3>
            <p className="text-kama-muted mb-4">
              Votre partenaire de confiance pour l'achat, la vente et la location de biens immobiliers au Gabon.
            </p>
            <div className="flex space-x-4">
              <button type="button" onClick={(e) => e.preventDefault()} className="text-kama-dore hover:text-white transition-all duration-300 transform hover:scale-110" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </button>
              <button type="button" onClick={(e) => e.preventDefault()} className="text-kama-dore hover:text-white transition-all duration-300 transform hover:scale-110" aria-label="X">
                <i className="fab fa-twitter"></i>
              </button>
              <button type="button" onClick={(e) => e.preventDefault()} className="text-kama-dore hover:text-white transition-all duration-300 transform hover:scale-110" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </button>
              <button type="button" onClick={(e) => e.preventDefault()} className="text-kama-dore hover:text-white transition-all duration-300 transform hover:scale-110" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-kama-dore">Navigation</h4>
            <ul className="space-y-2">
              <li><Link to="/acheter" className="text-kama-muted hover:text-kama-dore transition-all duration-300">Acheter</Link></li>
              <li><Link to="/louer" className="text-kama-muted hover:text-kama-dore transition-all duration-300">Louer</Link></li>
              <li><Link to="/vacances" className="text-kama-muted hover:text-kama-dore transition-all duration-300">Vacances</Link></li>
              <li>
                <a href="#" onClick={handleSellClick} className="text-kama-muted hover:text-kama-dore transition-all duration-300">Vendre</a>
              </li>
              <li><Link to="/offers" className="text-kama-muted hover:text-kama-dore transition-all duration-300">Toutes les offres</Link></li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-kama-dore">Aide & Support</h4>
            <ul className="space-y-2">
              <li><Link to="/faq" className="text-kama-muted hover:text-kama-dore transition-all duration-300">FAQ</Link></li>
              <li><Link to="/blog" className="text-kama-muted hover:text-kama-dore transition-all duration-300">Blog immobilier</Link></li>
              <li><Link to="/guide-acheteur" className="text-kama-muted hover:text-kama-dore transition-all duration-300">Guide de l'acheteur</Link></li>
              <li><Link to="/guide-vendeur" className="text-kama-muted hover:text-kama-dore transition-all duration-300">Guide du vendeur</Link></li>
              <li><Link to="/contact" className="text-kama-muted hover:text-kama-dore transition-all duration-300">Contactez-nous</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-kama-dore">Contact</h4>
            <ul className="space-y-3 text-kama-muted">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-3 text-kama-dore"></i>
                <span>Libreville, Gabon</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone-alt mr-3 text-kama-dore"></i>
                <span>+241 00 00 00 00</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope mr-3 text-kama-dore"></i>
                <span>contact@kama-immobilier.ga</span>
              </li>
            </ul>
          </div>
        </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-kama-muted text-sm space-y-2">
            <p>&copy; {new Date().getFullYear()} Kama Immobilier. Tous droits réservés.</p>
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              <Link to="/cgu" className="hover:text-kama-dore transition-colors">Conditions générales</Link>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-kama-dore transition-colors"
              >
                Retour en haut de page
              </button>
            </div>
          </div>
      </div>

      {/* Buyer account modal */}
      {showBuyerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-text-primary mb-2">Compte acheteur détecté</h3>
            <p className="text-text-secondary mb-4">
              Vous possédez actuellement un compte acheteur. Pour publier une annonce, vous devez être connecté avec un compte vendeur.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 rounded-lg bg-gray-200 text-text-primary"
                onClick={() => setShowBuyerModal(false)}
              >
                Fermer
              </button>
              <Link 
                to="/dashboard/seller"
                className="px-4 py-2 rounded-lg bg-primary-dark text-white"
                onClick={() => setShowBuyerModal(false)}
              >
                Aller au tableau vendeur
              </Link>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}