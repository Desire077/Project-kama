# 🏠 Kama — Plateforme Immobilière Fullstack

Kama est une application web fullstack permettant la mise en relation entre vendeurs et acheteurs de biens immobiliers (vente, location, vacances).

L'application permet :
- la publication d’annonces immobilières
- la recherche avancée de biens
- la gestion d’un profil utilisateur
- une modération administrateur
- un système de paiement (Stripe / Airtel Money en cours d’intégration)

---

# 📌 Table des matières

1. Présentation
2. Stack technique
3. Architecture du projet
4. Installation
5. Configuration des variables d’environnement
6. Lancement du projet
7. Structure détaillée du backend
8. Structure détaillée du frontend
9. API et communication
10. Sécurité
11. Gestion des rôles
12. Paiements
13. Déploiement
14. Maintenance et bonnes pratiques

---

# 🧠 1. Présentation

Kama est une plateforme immobilière inspirée des marketplaces modernes.

Objectif :
> Simplifier la publication et la consultation de biens immobiliers tout en garantissant une expérience utilisateur fluide et sécurisée.

---

# 🛠️ 2. Stack technique

## Frontend
- React.js
- Vite
- Tailwind CSS
- Axios

## Backend
- Node.js
- Express.js

## Base de données
- MongoDB Atlas
- Mongoose

## Authentification
- JSON Web Token (JWT)

## Services externes
- Cloudinary (stockage images)
- Stripe (paiement)
- Airtel Money (en cours)

## DevOps
- VPS Hostinger
- PM2 (process manager)
- Nginx (reverse proxy)
- Git / GitHub

---

# 🏗️ 3. Architecture du projet

L’application suit une architecture **client / serveur (REST API)** :


[Frontend React] → [API Express] → [MongoDB Atlas]


### Flux global :
1. Le frontend envoie une requête HTTP
2. Le backend traite la requête
3. Le backend interagit avec MongoDB
4. La réponse est renvoyée au frontend

---

# ⚙️ 4. Installation

## 4.1 Cloner le projet

```bash
git clone https://github.com/Desire077/Project-kama.git
cd Project-kama
4.2 Installer les dépendances
Backend
cd backend
npm install
Frontend
cd ../frontend
npm install
🔐 5. Configuration (.env)

Créer un fichier .env dans /backend :

# Base de données
MONGO_URI=mongodb+srv://...

# JWT
JWT_SECRET=super_secret_key
JWT_EXPIRE=7d

# Serveur
PORT=5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Paiement
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Airtel
AIRTEL_API_KEY=
AIRTEL_API_SECRET=
AIRTEL_BASE_URL=https://openapi.airtel.africa

▶️ 6. Lancement du projet
Mode développement
Backend
cd backend
npm run dev
Frontend
cd frontend
npm run dev
Mode production
cd backend
npm start
📂 7. Structure Backend (détaillée)
backend/
│
├── config/           # Connexion DB
├── controllers/      # Logique métier
├── models/           # Schémas MongoDB
├── routes/           # Routes API
├── middlewares/      # Auth, sécurité, etc.
├── scripts/          # Cron jobs (ex: abonnements)
├── server.js         # Point d’entrée
🔁 Cycle d’une requête
Route appelée (/api/auth/login)
Middleware (auth, validation)
Controller exécuté
Interaction avec MongoDB
Réponse JSON envoyée
🎨 8. Structure Frontend
frontend/
│
├── src/
│   ├── components/   # UI réutilisable
│   ├── pages/        # Pages principales
│   ├── api/          # Axios config
│   ├── hooks/
│   ├── store/        # Redux
🔌 9. API & Communication
Base URL
https://kama-ga.cloud/api
Exemple : login
POST /api/auth/login
{
  "email": "test@vendeur.com",
  "password": "MotDePasse123!"
}
Réponse
{
  "token": "JWT_TOKEN",
  "user": { ... }
}
🔒 10. Sécurité
Authentification JWT
Middleware de protection
CORS configuré
Helmet (sécurité HTTP)
Données sensibles en .env
👥 11. Gestion des rôles
Rôle	Permissions
Utilisateur	consulter annonces
Vendeur	publier annonces
Admin	modérer, gérer utilisateurs
💳 12. Paiements
Stripe
Checkout session
Webhook validation
Airtel Money
Intégration API
Callback URL
Validation serveur
🚀 13. Déploiement
Environnement
VPS Hostinger
Domaine : https://kama-ga.cloud
Stack production
Node.js
PM2
Nginx
Commandes utiles
pm2 start server.js
pm2 restart all
pm2 logs
🛠️ 14. Maintenance
Logs PM2
Monitoring serveur
Vérification MongoDB
Mise à jour dépendances
📈 15. Évolutions possibles
Application mobile
Chat interne
Notifications push
Paiement 100% automatisé
IA recommandation de biens
👨‍💻 Auteur

Projet réalisé par Japhet Nguembet dans le cadre du BTS SIO.

🧠 Conclusion

Kama est une application fullstack moderne respectant les standards actuels du développement web :

✔ Architecture propre
✔ Sécurité
✔ Scalabilité
✔ Déploiement réel
