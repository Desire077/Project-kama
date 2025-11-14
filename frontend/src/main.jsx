import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css' // <-- s'assurer que c'est importé ici, une seule fois

// (le slice lit déjà localStorage au démarrage via initialState)
// si tu veux forcer une action au mount, tu peux dispatcher ici, ex:
// const token = localStorage.getItem('auth_token')
// const user = localStorage.getItem('auth_user')
// if (token) store.dispatch({ type: 'auth/setCredentials', payload: { token, user: user ? JSON.parse(user) : null } })

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
)
