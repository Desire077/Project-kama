🏠 Kama – Backend API Documentation

API backend officielle de la plateforme immobilière Kama.
Cette API gère l’authentification, les annonces immobilières, les utilisateurs, les rôles (admin), les paiements et la logique métier associée.

📌 Présentation générale

Kama est une plateforme immobilière destinée au marché africain, permettant :

Aux vendeurs de publier et promouvoir des annonces

Aux acheteurs de consulter et contacter via WhatsApp

À un administrateur de modérer et superviser la plateforme

L’intégration de paiements locaux (Airtel Money) et internationaux (Stripe – extensible)

🛠️ Stack technique

Node.js

Express.js

MongoDB Atlas + Mongoose

JWT (authentification)

Cloudinary (images)

Airtel Money (manuel / API-ready)

Stripe (prévu / optionnel)

Nodemailer

PM2 + Nginx (production)

📂 Architecture simplifiée
backend/
├── controllers/
├── routes/
├── models/
├── middlewares/
├── services/
├── utils/
├── config/
├── .env
└── server.js
⚙️ Installation & configuration
1️⃣ Installation des dépendances
npm install
2️⃣ Variables d’environnement (.env)

Créer un fichier .env à la racine du dossier backend.

# Environnement
NODE_ENV=production
PORT=5000

# Base de données (MongoDB Atlas recommandé)
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/kama

# Frontend
FRONTEND_URL=https://kama-ga.cloud

# Authentification
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx

# Paiements
MERCHANT_PHONE=+241XXXXXXXX
PAYMENT_CURRENCY=XAF

# Stripe (optionnel / futur)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=example@gmail.com
EMAIL_PASS=app_password

⚠️ Sécurité

Ne jamais exposer .env

MongoDB ne doit jamais être en 0.0.0.0

Utiliser HTTPS en production

3️⃣ Lancer le serveur
# Développement
npm run dev

# Production
npm start
🌐 Endpoints API
🔐 Authentification
Méthode	Endpoint	Description
POST	/api/auth/register	Inscription
POST	/api/auth/login	Connexion
GET	/api/auth/me	Utilisateur connecté
🏡 Annonces immobilières
Méthode	Endpoint	Description
GET	/api/properties	Liste publique
GET	/api/properties/:id	Détails
POST	/api/properties	Créer une annonce
PUT	/api/properties/:id	Modifier
DELETE	/api/properties/:id	Supprimer
👤 Utilisateurs
Méthode	Endpoint	Description
GET	/api/users/profile	Profil
PUT	/api/users/profile	Modifier
GET	/api/users/properties	Annonces de l’utilisateur
GET	/api/users/favorites	Favoris
POST	/api/users/favorites/:propertyId	Ajouter
DELETE	/api/users/favorites/:propertyId	Retirer
🛡️ Administration (Admin only)
Méthode	Endpoint	Description
GET	/api/admin/users	Tous les utilisateurs
GET	/api/admin/properties	Toutes les annonces
PUT	/api/admin/properties/:id/status	Valider / refuser
💳 Paiements
🟡 Paiement manuel / Airtel Money (actuel)

Flux :

L’utilisateur initie un paiement

Le backend génère une référence unique

L’utilisateur paie via Airtel Money

L’admin valide manuellement

Les fonctionnalités sont activées

Endpoints Airtel Money
Méthode	Endpoint	Description
POST	/api/payments/manual/initiate	Initier paiement
POST	/api/payments/manual/submit	Soumettre preuve
POST	/api/payments/manual/confirm	Confirmer (admin)

📌 Logique métier

Si confirmé → annonce online

Si refusé → statut rejected

Traçabilité complète en base

🔵 Stripe (prévu / extensible)
Endpoint	Description
/api/payments/create-payment-intent	Paiement ponctuel
/api/payments/create-subscription	Abonnement
/api/payments/webhook	Webhook Stripe
📧 Emails
Endpoint	Description
/api/email/welcome	Bienvenue
/api/email/inquiry	Contact
/api/email/reset-password	Mot de passe
🚀 Production

VPS Hostinger KVM

OS : Ubuntu Server

Process manager : PM2

Reverse proxy : Nginx

Domaine :

kama-ga.cloud

api.kama-ga.cloud

🔒 Sécurité & bonnes pratiques

JWT + middlewares

Rôles & permissions

Validation des entrées

Variables sensibles en .env

Logs et statuts de paiement

Architecture évolutive

🧠 Évolutions prévues

API Airtel Money officielle (webhook)

Messagerie interne

Application mobile

Vérification KYC avancée

✅ Statut du projet

✔ Fonctionnel
✔ Prêt pour la production
✔ Scalable
✔ Adapté au contexte local