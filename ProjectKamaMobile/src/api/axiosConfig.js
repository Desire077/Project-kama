// src/api/axiosConfig.js
import axios from "axios";
import * as SecureStore from "expo-secure-store";

// ✅ Ton backend est déjà en ligne, pas besoin d'IPv4
const API_BASE_URL = "https://kama-ga.cloud/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur de requêtes : ajoute automatiquement le token JWT
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponses : gestion centralisée des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("Erreur API:", error.response.status, error.response.data);
      if (error.response.status === 401) {
        console.warn("Token invalide ou expiré");
      }
    } else if (error.request) {
      console.error("Pas de réponse du serveur:", error.request);
    } else {
      console.error("Erreur:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;