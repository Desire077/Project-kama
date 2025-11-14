import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';

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
        `px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
          isActive ? 'bg-kama-vert text-white' : 'text-kama-text hover:bg-kama-bg'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

/* ------------------ Logo minimaliste & professionnel ------------------ */
function KamaLogo({ className = 'w-9 h-9' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden>
        <rect x="0" y="0" width="48" height="48" rx="10" fill="#1A3C40"/>
        <path d="M14 30L24 14L34 30H14Z" fill="#D4AF37"/>
        <rect x="16" y="30" width="16" height="4" rx="1" fill="#D4AF37" opacity="0.95"/>
      </svg>
      <div className="flex flex-col leading-tight -mt-0.5">
        <span className="text-kama-text font-poppins font-semibold text-lg tracking-tight">Kama</span>
        <span className="text-xs text-kama-muted">Immobilier Gabon</span>
      </div>
    </div>
  );
}

/* ------------------ Navbar principal ------------------ */
export default function Navbar({ user = null, onLogout }) {
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
    window.location.href = `/offers?q=${encodeURIComponent(query.trim())}`;
  };

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* gauche : logo + nav desktop */}
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-3" aria-label="Kama - Accueil">
              <KamaLogo />
            </a>

            {/* liens desktop */}
            <nav className="hidden md:flex items-center gap-2" aria-label="Navigation principale">
              <NavItem to="/offers">Offres</NavItem>
              <NavItem to="/buy">Acheter</NavItem>
              <NavItem to="/rent">Louer</NavItem>
              <NavItem to="/vacances">Vacances</NavItem>
            </nav>
          </div>

          {/* centre : recherche desktop */}
          <div className="hidden md:flex flex-1 justify-center px-6">
            <form onSubmit={handleSearchSubmit} role="search" aria-label="Rechercher un bien" className="w-full max-w-2xl">
              <label htmlFor="navbar-search" className="sr-only">Rechercher</label>
              <div className="relative">
                <input
                  id="navbar-search"
                  name="q"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ville, quartier, budget..."
                  className="w-full border border-gray-200 bg-white rounded-full py-2.5 pl-4 pr-12 text-sm placeholder-kama-muted focus:outline-none focus:ring-2 focus:ring-kama-vert focus:border-transparent transition"
                  aria-label="Rechercher ville, quartier ou prix"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-kama-gold text-kama-vert rounded-full p-2 hover:scale-105 transform transition"
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
              className="md:hidden inline-flex p-2 rounded-lg hover:bg-kama-bg focus:outline-none focus:ring-2 focus:ring-kama-vert"
              aria-label="Rechercher"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M21 21l-4.35-4.35" stroke="#1C1C1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="10.5" cy="10.5" r="5.5" stroke="#1C1C1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* CTA publier */}
            <a
              href="/publish"
              className="hidden sm:inline-flex items-center gap-2 bg-kama-gold text-kama-vert px-4 py-2 rounded-full text-sm font-poppins font-semibold shadow-kama-soft hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kama-gold"
            >
              Publier une annonce
            </a>

            {/* user area */}
            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(s => !s)}
                  className="inline-flex items-center gap-2 p-1 rounded-full hover:bg-kama-bg focus:outline-none focus:ring-2 focus:ring-kama-vert"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  <img src={user.avatarUrl || '/default-avatar.png'} alt={`${user.name}`} className="w-9 h-9 rounded-full object-cover border border-gray-100"/>
                  <span className="hidden md:inline-block text-sm text-kama-text font-medium">{user.name.split(' ')[0]}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-kama-muted" aria-hidden>
                    <path d="M6 9l6 6 6-6" stroke="#606060" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {userMenuOpen && (
                  <div role="menu" aria-label="Menu utilisateur" className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-kama-soft py-2 z-50 ring-1 ring-black ring-opacity-5">
                    <a href="/dashboard" className="block px-4 py-2 text-sm text-kama-text hover:bg-kama-bg">Tableau de bord</a>
                    <a href="/profile" className="block px-4 py-2 text-sm text-kama-text hover:bg-kama-bg">Profil</a>
                    <button onClick={() => onLogout && onLogout()} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-kama-bg">Se déconnecter</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <a href="/login" className="text-sm text-kama-text px-3 py-2 rounded-lg hover:bg-kama-bg">Connexion</a>
                <a href="/signup" className="text-sm bg-white border border-kama-vert text-kama-vert px-3 py-2 rounded-full hover:shadow-sm">Inscription</a>
              </div>
            )}

            {/* mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(s => !s)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-kama-bg focus:outline-none focus:ring-2 focus:ring-kama-vert"
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
      </div>

      {/* mobile search */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-4">
          <form onSubmit={handleSearchSubmit} role="search" aria-label="Recherche mobile">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border border-gray-200 rounded-full py-2.5 pl-4 pr-12 text-sm"
                placeholder="Ville, quartier, budget..."
              />
              <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 bg-kama-gold text-kama-vert rounded-full p-2">
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
          <nav className="flex flex-col gap-2 px-4" aria-label="Navigation mobile">
            <NavItem to="/offers" onClick={() => setMobileOpen(false)}>Offres</NavItem>
            <NavItem to="/buy" onClick={() => setMobileOpen(false)}>Acheter</NavItem>
            <NavItem to="/rent" onClick={() => setMobileOpen(false)}>Louer</NavItem>
            <NavItem to="/vacances" onClick={() => setMobileOpen(false)}>Vacances</NavItem>
            <a
              href="/publish"
              className="px-3 py-2 rounded-lg text-sm font-medium text-kama-text hover:bg-kama-bg"
              onClick={() => setMobileOpen(false)}
            >
              Publier une annonce
            </a>
          </nav>

          {!user && (
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100 px-4">
              <a href="/login" className="text-sm text-kama-text px-3 py-2 rounded-lg hover:bg-kama-bg">Connexion</a>
              <a href="/signup" className="text-sm bg-kama-vert text-white px-3 py-2 rounded-full text-center">Inscription</a>
            </div>
          )}
        </div>
      )}
    </header>
  );
}