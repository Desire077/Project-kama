import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

/* ------------------ Hook utile : detecte clic en dehors ------------------ */
function useOutsideClick(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler(e);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

/* ------------------ Item de navigation (active styling via NavLink) ------------------ */
function NavItem({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
          isActive 
            ? 'bg-kama-vert text-white shadow-kama' 
            : 'text-kama-text hover:bg-kama-bg hover:text-kama-vert'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

/* ------------------ Logo minimaliste & professionnel ------------------ */
function KamaLogo({ className = 'w-10 h-10' }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="relative">
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden>
          <rect x="0" y="0" width="48" height="48" rx="12" fill="#1A3C40"/>
          <path d="M14 30L24 14L34 30H14Z" fill="#D4AF37"/>
          <rect x="16" y="30" width="16" height="4" rx="2" fill="#D4AF37" opacity="0.95"/>
        </svg>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-kama-dore rounded-full"></div>
      </div>
      <div className="flex flex-col leading-tight -mt-0.5">
        <span className="font-poppins font-bold text-xl tracking-tight text-kama-text">KAMA</span>
        <span className="text-xs font-medium text-kama-muted">Immobilier Gabon</span>
      </div>
    </div>
  );
}

/* ------------------ Navbar principal ------------------ */
export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const mobileRef = useRef(null);
  const userMenuRef = useRef(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useOutsideClick(mobileRef, () => setMobileOpen(false));
  useOutsideClick(userMenuRef, () => setUserMenuOpen(false));

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
  }, [mobileOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    // redirige vers /offers?q=...
    navigate(`/offers?q=${encodeURIComponent(query.trim())}`);
    setQuery('');
    setSearchOpen(false);
  };

  const handlePublishClick = (e) => {
    e.preventDefault();
    if (!user) {
      // Redirect unauthenticated users to login with return URL
      navigate('/login?redirect=/vendre');
    } else if (user.role === 'admin') {
      // Admins should go to their dashboard instead of publishing
      navigate('/dashboard/admin/properties');
    } else {
      // Authenticated users can publish
      navigate('/vendre');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="fixed w-full top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* gauche : logo + nav desktop */}
          <div className="flex items-center gap-12">
            <a href="/" className="flex items-center mr-4" aria-label="Kama - Accueil">
              <KamaLogo className="w-10 h-10" />
            </a>

            <nav className="hidden md:flex items-center gap-2" aria-label="Navigation principale">
              <NavItem to="/offers">Offres</NavItem>
              <NavItem to="/louer">Louer</NavItem>
              <NavItem to="/vacances">Vacances</NavItem>
            </nav>
          </div>

          {/* centre : recherche desktop */}
          <div className="hidden md:flex flex-1 justify-center px-6 max-w-2xl">
            <form onSubmit={handleSearchSubmit} role="search" aria-label="Rechercher un bien" className="w-full">
              <label htmlFor="navbar-search" className="sr-only">Rechercher</label>
              <div className="relative">
                <input
                  id="navbar-search"
                  name="q"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ville, quartier, budget..."
                  className="w-full border border-gray-200 bg-white rounded-full py-2.5 pl-4 pr-12 text-sm placeholder-kama-muted focus:outline-none focus:ring-2 focus:ring-kama-vert focus:border-transparent transition-all duration-300 shadow-sm"
                  aria-label="Rechercher ville, quartier ou prix"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-kama-dore text-kama-vert rounded-full p-2 hover:scale-105 transform transition-all duration-300 shadow-sm"
                  aria-label="Lancer la recherche"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M21 21l-4.35-4.35" stroke="#1A3C40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="10.5" cy="10.5" r="5.5" stroke="#1A3C40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </form>
          </div>

          {/* droite : actions */}
          <div className="flex items-center gap-3">
             {/* mobile search toggle */}
             <button
               onClick={() => setSearchOpen(s => !s)}
               className="md:hidden inline-flex p-2 rounded-lg text-kama-text hover:bg-kama-bg focus:outline-none focus:ring-2 focus:ring-kama-vert transition-all duration-300"
               aria-label="Rechercher"
             >
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                 <path d="M21 21l-4.35-4.35" stroke="#1C1C1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                 <circle cx="10.5" cy="10.5" r="5.5" stroke="#1C1C1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
             </button>

            {/* CTA publier */}
            <button
              onClick={handlePublishClick}
              className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-kama-dore to-kama-gold text-kama-vert px-5 py-2.5 rounded-full text-sm font-poppins font-semibold shadow-kama hover:shadow-kama-hover transition-all duration-300 transform hover:scale-105 floating"
            >
              <i className="fas fa-plus-circle"></i>
              {user?.role === 'admin' ? 'Tableau de bord Admin' : 'Publier une annonce'}
            </button>

            {/* user area */}
            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(s => !s)}
                  className="inline-flex items-center gap-2 p-1 rounded-full text-kama-text hover:bg-kama-bg focus:outline-none focus:ring-2 focus:ring-kama-vert transition-all duration-300"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-9 h-9 rounded-full bg-kama-vert flex items-center justify-center text-white font-medium">
                    {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden md:inline-block text-sm font-medium text-kama-text">
                    {user.firstName || user.email}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-kama-muted" aria-hidden>
                    <path d="M6 9l6 6 6-6" stroke="#606060" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {userMenuOpen && (
                  <div role="menu" aria-label="Menu utilisateur" className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-kama-lg py-2 z-50 ring-1 ring-black ring-opacity-5 border border-gray-100">
                    <a 
                      href={user.role === 'admin' ? '/dashboard/admin' : user.role === 'vendeur' ? '/dashboard/seller' : '/dashboard'} 
                      className="block px-4 py-2 text-sm text-kama-text hover:bg-kama-bg transition-colors duration-200"
                    >
                      Tableau de bord
                    </a>
                    {user.role !== 'admin' && (
                      <>
                        <a href="/profile" className="block px-4 py-2 text-sm text-kama-text hover:bg-kama-bg transition-colors duration-200">Profil</a>
                        <a href="/premium" className="block px-4 py-2 text-sm text-kama-text hover:bg-kama-bg transition-colors duration-200">Passer Premium</a>
                      </>
                    )}
                    <button 
                      onClick={handleLogout} 
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-kama-bg transition-colors duration-200"
                    >
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <a href="/login" className="text-sm px-4 py-2 rounded-lg text-kama-text hover:bg-kama-bg focus:outline-none focus:ring-2 focus:ring-kama-vert transition-all duration-300">Connexion</a>
                <a 
                  href="/register" 
                  className="text-sm bg-kama-dore text-kama-vert px-5 py-2.5 rounded-full hover:bg-opacity-90 shadow-kama transition-all duration-300 font-poppins font-semibold"
                >
                  Inscription
                </a>
              </div>
            )}

            {/* mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(s => !s)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-kama-text hover:bg-kama-bg focus:outline-none focus:ring-2 focus:ring-kama-vert transition-all duration-300"
              aria-expanded={mobileOpen}
              aria-label="Ouvrir le menu"
            >
              {mobileOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 18L18 6M6 6l12 12" stroke="#1C1C1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M3 6h18M3 12h18M3 18h18" stroke="#1C1C1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* mobile search bar */}
        {searchOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <form onSubmit={handleSearchSubmit} role="search" aria-label="Rechercher un bien (mobile)" className="w-full">
              <label htmlFor="mobile-search" className="sr-only">Rechercher</label>
              <div className="relative">
                <input
                  id="mobile-search"
                  name="q"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ville, quartier, budget..."
                  className="w-full border border-gray-200 bg-white rounded-full py-2.5 pl-4 pr-12 text-sm placeholder-kama-muted focus:outline-none focus:ring-2 focus:ring-kama-vert focus:border-transparent transition-all duration-300 shadow-sm"
                  aria-label="Rechercher ville, quartier ou prix"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-kama-dore text-kama-vert rounded-full p-2 hover:scale-105 transform transition-all duration-300 shadow-sm"
                  aria-label="Lancer la recherche"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M21 21l-4.35-4.35" stroke="#1A3C40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="10.5" cy="10.5" r="5.5" stroke="#1A3C40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* mobile menu */}
        {mobileOpen && (
          <div ref={mobileRef} className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-2" aria-label="Navigation mobile">
              <NavItem to="/offers" onClick={() => setMobileOpen(false)}>Offres</NavItem>
              <NavItem to="/louer" onClick={() => setMobileOpen(false)}>Louer</NavItem>
              <NavItem to="/vacances" onClick={() => setMobileOpen(false)}>Vacances</NavItem>
              <button 
                onClick={handlePublishClick}
                className="px-4 py-2 rounded-lg text-sm font-medium text-kama-text hover:bg-kama-bg text-left transition-all duration-300"
              >
                <i className="fas fa-plus-circle mr-2"></i>
                {user?.role === 'admin' ? 'Tableau de bord Admin' : 'Publier une annonce'}
              </button>
            </nav>
            
            {!user && (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
                <a 
                  href="/login" 
                  className="px-4 py-2 rounded-lg text-sm font-medium text-kama-text hover:bg-kama-bg transition-all duration-300"
                  onClick={() => setMobileOpen(false)}
                >
                  Connexion
                </a>
                <a 
                  href="/register" 
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-kama-vert to-kama-turquoise text-white text-center shadow-kama transition-all duration-300"
                  onClick={() => setMobileOpen(false)}
                >
                  Inscription
                </a>
              </div>
            )}
            
            {user && (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
                <a 
                  href={user.role === 'admin' ? '/dashboard/admin' : user.role === 'vendeur' ? '/dashboard/seller' : '/dashboard'} 
                  className="px-4 py-2 rounded-lg text-sm font-medium text-kama-text hover:bg-kama-bg transition-all duration-300"
                  onClick={() => setMobileOpen(false)}
                >
                  Tableau de bord
                </a>
                {user.role !== 'admin' && (
                  <>
                    <a 
                      href="/profile" 
                      className="px-4 py-2 rounded-lg text-sm font-medium text-kama-text hover:bg-kama-bg transition-all duration-300"
                      onClick={() => setMobileOpen(false)}
                    >
                      Profil
                    </a>
                    <a 
                      href="/premium" 
                      className="px-4 py-2 rounded-lg text-sm font-medium text-kama-text hover:bg-kama-bg transition-all duration-300"
                      onClick={() => setMobileOpen(false)}
                    >
                      Passer Premium
                    </a>
                  </>
                )}
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-kama-bg transition-all duration-300 text-left"
                >
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}