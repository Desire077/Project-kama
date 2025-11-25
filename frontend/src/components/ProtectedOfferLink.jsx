import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Composant qui redirige vers la page de connexion si l'utilisateur n'est pas connecté
 * quand il clique sur une offre
 */
export default function ProtectedOfferLink({ to, children, className, ...props }) {
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    
    if (!user) {
      // Rediriger vers la page de connexion avec l'URL de retour
      navigate(`/login?redirect=${encodeURIComponent(to)}`);
    } else {
      // Utilisateur connecté, naviguer normalement
      navigate(to);
    }
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </a>
  );
}

