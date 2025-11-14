# Kama Backend API

API backend pour la plateforme immobilière Kama.

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Créer un fichier `.env` à la racine du dossier `backend` avec les variables suivantes :
```env
# Configuration de la base de données
MONGO_URI=mongodb://localhost:27017/kama

# Configuration du serveur
PORT=5000
NODE_ENV=development

# Configuration du frontend
FRONTEND_URL=http://localhost:3000

# Configuration JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Configuration Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Configuration Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Configuration Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

3. Démarrer le serveur :
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

### Lancer sous Windows

Si vous êtes sous Windows, vous pouvez utiliser CMD (Invite de commandes) ou PowerShell.

- Ouvrir CMD (recommandé si PowerShell bloque l'exécution de scripts) :
```cmd
cd C:\\Users\\marle\\OneDrive\\Desktop\\Project-kama-master\\backend
npm install
npm run dev
```

- Si vous préférez PowerShell et que `npm` / `npx` sont bloqués par la policy d'exécution, ouvrez PowerShell en administrateur et exécutez :
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# puis dans le dossier backend
npm install
npm run dev
```

Alternativement, installez Git Bash et exécutez les mêmes commandes depuis le shell Bash.

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Propriétés
- `GET /api/properties` - Liste des propriétés
- `GET /api/properties/:id` - Détails d'une propriété
- `POST /api/properties` - Créer une propriété
- `PUT /api/properties/:id` - Modifier une propriété
- `DELETE /api/properties/:id` - Supprimer une propriété

### Utilisateurs
- `GET /api/users/profile` - Profil utilisateur
- `PUT /api/users/profile` - Modifier le profil
- `GET /api/users/properties` - Propriétés de l'utilisateur
- `GET /api/users/favorites` - Favoris de l'utilisateur
- `POST /api/users/favorites/:propertyId` - Ajouter aux favoris
- `DELETE /api/users/favorites/:propertyId` - Retirer des favoris

### Administration
- `GET /api/admin/users` - Liste des utilisateurs
- `GET /api/admin/properties` - Toutes les propriétés
- `PUT /api/admin/properties/:id/status` - Modifier le statut d'une propriété

### Paiements
- `POST /api/payments/create-payment-intent` - Créer un paiement
- `POST /api/payments/create-subscription` - Créer un abonnement
- `POST /api/payments/webhook` - Webhook Stripe

#### Paiement manuel / Airtel Money

Flux supporté : l'utilisateur choisit de payer par Airtel Money (ou par virement manuel). Le backend crée une entrée de paiement et génère un code de référence que l'utilisateur doit inclure lors du virement.

- `POST /api/payments/manual/initiate` (protégé) - Crée une demande de paiement manuelle. Body: `{ propertyId, amount, currency? }`. Réponse : `{ payment: { id, reference, recipientPhone } }` — afficher ces informations à l'utilisateur (faire le virement sur `recipientPhone` et indiquer la référence).
- `POST /api/payments/manual/submit` (protégé) - L'utilisateur confirme qu'il a fait le paiement en soumettant `{ paymentId, senderPhone, transactionRef }`. Le paiement passe en statut `submitted`.
- `POST /api/payments/manual/confirm` (protégé + admin) - Endpoint pour que l'administrateur confirme ou refuse le paiement : `{ paymentId, confirm: true|false }`. Si confirmé, la propriété liée passe au statut `online`.

Notes de sécurité / opérabilité :
- Le paiement manuel est hors-bande : l'administrateur vérifie le virement manuellement (via l'opérateur ou preuve). C'est adapté si tu souhaites contrôler les annonces avant publication.
- Assure-toi que `MERCHANT_PHONE` est défini dans `.env` pour indiquer le numéro de réception des paiements.


### Email
- `POST /api/email/welcome` - Email de bienvenue
- `POST /api/email/inquiry` - Demande d'information
- `POST /api/email/reset-password` - Réinitialisation de mot de passe

## Technologies utilisées

- Node.js
- Express.js
- MongoDB avec Mongoose
- JWT pour l'authentification
- Cloudinary pour le stockage d'images
- Stripe pour les paiements
- Nodemailer pour les emails
