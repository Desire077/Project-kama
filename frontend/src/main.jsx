import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css'; // <-- s'assurer que c'est importé ici, une seule fois
import { SEOProvider } from './components/SEO';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <SEOProvider>
        <App />
      </SEOProvider>
    </BrowserRouter>
  </Provider>
);
