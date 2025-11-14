import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function Layout({children}){
  const user = useSelector(s=>s.auth.user)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold flex items-center">
            <span className={`rounded-lg px-2 py-1 mr-2 font-bold ${scrolled ? 'bg-luxury-gold text-primary-dark' : 'bg-white text-primary-dark'}`}>K</span>
            <span className={`hidden sm:inline ${scrolled ? 'text-primary-dark' : 'text-white'}`}>KAMA</span>
            <span className={`sm:hidden ${scrolled ? 'text-primary-dark' : 'text-white'}`}>K</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 sm:space-x-4">
            <Link to="/offers" className={`${scrolled ? 'text-primary-dark' : 'text-white'} hover:text-luxury-gold px-3 py-2 rounded transition font-medium`}>Offres</Link>
            {user ? (
              <>
                {user.role === 'vendeur' && (
                  <Link to="/dashboard/seller" className={`${scrolled ? 'text-primary-dark' : 'text-white'} hover:text-luxury-gold px-3 py-2 rounded transition font-medium`}>Espace Vendeur</Link>
                )}
                {user.role === 'client' && (
              <Link to="/dashboard/client" className={`${scrolled ? 'text-primary-dark' : 'text-white'} hover:text-luxury-gold px-3 py-2 rounded transition font-medium`}>Mon Compte</Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin/properties" className={`${scrolled ? 'text-primary-dark' : 'text-white'} hover:text-luxury-gold px-3 py-2 rounded transition font-medium`}>Admin</Link>
                )}
                <Link to="/logout" className={`${scrolled ? 'text-primary-dark' : 'text-white'} hover:text-luxury-gold px-3 py-2 rounded transition font-medium`}>Déconnexion</Link>
              </>
            ) : (
              <>
                <Link to="/login" className={`${scrolled ? 'text-primary-dark bg-white border border-primary-dark' : 'text-white bg-transparent border border-white'} hover:bg-luxury-gold hover:text-primary-dark px-4 py-2 rounded transition font-medium`}>Connexion</Link>
                <Link to="/register" className={`${scrolled ? 'text-primary-dark bg-luxury-gold' : 'text-primary-dark bg-white'} hover:bg-opacity-80 px-4 py-2 rounded transition font-medium`}>Inscription</Link>
              </>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className={`md:hidden text-2xl ${scrolled ? 'text-primary-dark' : 'text-white'}`} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white px-4 py-4 absolute w-full shadow-lg">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/offers" 
                className="text-primary-dark hover:text-luxury-gold px-3 py-2 rounded transition font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Offres
              </Link>
              {user ? (
                <>
                  {user.role === 'vendeur' && (
                    <Link 
                      to="/dashboard/seller" 
                      className="text-primary-dark hover:text-luxury-gold px-3 py-2 rounded transition font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Espace Vendeur
                    </Link>
                  )}
                  {user.role === 'client' && (
                    <Link 
                      to="/dashboard/client" 
                      className="text-primary-dark hover:text-luxury-gold px-3 py-2 rounded transition font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Mon Compte
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link 
                      to="/admin/properties" 
                      className="text-primary-dark hover:text-luxury-gold px-3 py-2 rounded transition font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <Link 
                    to="/logout" 
                    className="text-primary-dark hover:text-luxury-gold px-3 py-2 rounded transition font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Déconnexion
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-primary-dark bg-transparent border border-primary-dark hover:bg-luxury-gold hover:text-primary-dark px-4 py-2 rounded transition font-medium text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link 
                    to="/register" 
                    className="text-primary-dark bg-luxury-gold hover:bg-opacity-80 px-4 py-2 rounded transition font-medium text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className="bg-luxury-gold text-primary-dark rounded-lg px-2 py-1 mr-2 font-bold">K</span>
                Kama
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                La plateforme immobilière de référence au Gabon. 
                Trouvez votre bien idéal ou vendez votre propriété en toute simplicité.
              </p>
              
              {/* Social Media Links */}
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-300 hover:text-luxury-gold transition text-xl" aria-label="Facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-luxury-gold transition text-xl" aria-label="X">
                  <i className="fab fa-x"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-luxury-gold transition text-xl" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-luxury-gold transition text-xl" aria-label="LinkedIn">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-luxury-gold">Navigation</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li><Link to="/offers" className="hover:text-white transition">Offres immobilières</Link></li>
                <li><Link to="/acheter" className="hover:text-white transition">Acheter</Link></li>
                <li><Link to="/louer" className="hover:text-white transition">Louer</Link></li>
                <li><Link to="/vacances" className="hover:text-white transition">Vacances</Link></li>
                <li><Link to="/vendre" className="hover:text-white transition">Vendre</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-luxury-gold">Aide & Support</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contactez-nous</Link></li>
                <li><Link to="/guide-acheteur" className="hover:text-white transition">Guide de l'acheteur</Link></li>
                <li><Link to="/guide-vendeur" className="hover:text-white transition">Guide du vendeur</Link></li>
                <li><Link to="/blog" className="hover:text-white transition">Blog immobilier</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-luxury-gold">Contact</h4>
              <ul className="space-y-3 text-gray-300 text-sm">
                <li className="flex items-start">
                  <i className="fas fa-envelope mt-1 mr-3 text-luxury-gold"></i>
                  <span>Email: contact@kama.com</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-phone mt-1 mr-3 text-luxury-gold"></i>
                  <span>Téléphone: +241 01 02 03 04</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-map-marker-alt mt-1 mr-3 text-luxury-gold"></i>
                  <span>Libreville, Gabon</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-300 text-sm">
            <p>© {new Date().getFullYear()} Kama. Tous droits réservés.</p>
            
            {/* App Download Links - Hidden for now */}
            {/* 
            <div className="mt-6 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-6">
              <a href="#" className="flex items-center justify-center bg-black bg-opacity-30 px-5 py-3 rounded-lg hover:bg-opacity-50 transition">
                <i className="fab fa-apple text-2xl mr-3"></i>
                <div className="text-left">
                  <div className="text-xs">Télécharger sur</div>
                  <div className="font-medium">App Store</div>
                </div>
              </a>
              <a href="#" className="flex items-center justify-center bg-black bg-opacity-30 px-5 py-3 rounded-lg hover:bg-opacity-50 transition">
                <i className="fab fa-google-play text-2xl mr-3"></i>
                <div className="text-left">
                  <div className="text-xs">Télécharger sur</div>
                  <div className="font-medium">Google Play</div>
                </div>
              </a>
            </div>
            */}
          </div>
        </div>
      </footer>
    </div>
  )
}