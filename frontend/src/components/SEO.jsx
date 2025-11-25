import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

export function SEOProvider({ children }) {
  return <HelmetProvider>{children}</HelmetProvider>;
}

export function SEO({ title, description }) {
  const fullTitle = title ? `${title} | Kama Immobilier` : 'Kama Immobilier';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
    </Helmet>
  );
}


