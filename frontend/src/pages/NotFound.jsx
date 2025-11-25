import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <SEO title="Page introuvable" description="La page que vous recherchez n'existe pas ou n'est plus disponible." />
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-kama-dore mb-2">Erreur 404</p>
        <h1 className="text-3xl md:text-4xl font-bold text-kama-vert mb-4">
          On dirait que cette page s'est volatilisée.
        </h1>
        <p className="text-kama-muted mb-8">
          La page demandée n'existe pas ou a été déplacée. Vérifiez l'URL ou revenez à l'accueil pour continuer votre
          navigation.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-kama-vert text-white font-semibold hover:bg-opacity-90 transition-all duration-300 shadow-kama-hover"
          >
            <i className="fas fa-home mr-2" />
            Retour à l'accueil
          </Link>
          <Link
            to="/offers"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-kama-vert text-kama-vert font-semibold hover:bg-kama-bg transition-all duration-300"
          >
            <i className="fas fa-search mr-2" />
            Voir les offres
          </Link>
        </div>
      </div>
    </div>
  );
}


