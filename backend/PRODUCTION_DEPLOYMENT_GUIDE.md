# Guide de Déploiement en Production - Kama

## ✅ Checklist Sécurité (Mise à jour)

### ✔️ Complété
- [x] **Helmet installé** - Headers de sécurité HTTP configurés
- [x] **Vulnérabilités NPM corrigées** - Tous les packages sont à jour
- [x] **Authentication JWT** - Implémentée avec refresh tokens
- [x] **Rate limiting** - Configuré sur les routes sensibles
- [x] **Validation des données** - express-validator sur les routes
- [x] **Gestion des erreurs** - Messages génériques en production
- [x] **.env ignoré** - Fichiers sensibles exclus de Git

### ⚠️ À faire avant la production

1. **Variables d'environnement** (CRITIQUE)
```bash
# Créer un fichier .env avec ces variables :
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://[username]:[password]@[cluster].mongodb.net/kama
JWT_SECRET=[générer avec: openssl rand -base64 32]
JWT_EXPIRE=30m
REFRESH_TOKEN_SECRET=[générer une autre clé]
FRONTEND_URL=https://votre-domaine.com
CLOUDINARY_CLOUD_NAME=[votre cloud name]
CLOUDINARY_API_KEY=[votre api key]
CLOUDINARY_API_SECRET=[votre api secret]
AIRTEL_CLIENT_ID=[votre client id]
AIRTEL_CLIENT_SECRET=[votre client secret]
AIRTEL_BASE_URL=https://openapi.airtel.africa
AIRTEL_ENV=production
```

2. **Sécuriser MongoDB**
- Activer l'authentification
- Créer un utilisateur dédié avec permissions limitées
- Activer le chiffrement des données au repos
- Configurer les sauvegardes automatiques
- Limiter les IPs autorisées (whitelist)

3. **HTTPS/SSL**
- Obtenir un certificat SSL (Let's Encrypt gratuit)
- Rediriger tout le trafic HTTP vers HTTPS
- Activer HSTS dans Helmet après test SSL

4. **Protection CSRF (Optionnel mais recommandé)**
```bash
npm install csurf
```

5. **Monitoring et Logs**
```bash
npm install winston  # Pour les logs
npm install @sentry/node  # Pour le monitoring d'erreurs
```

## 🚀 Options de Déploiement

### Option 1: Heroku
```bash
# Dans le dossier racine
heroku create kama-app
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=...
# Ajouter toutes les variables d'environnement
git push heroku main
```

### Option 2: DigitalOcean/VPS
```bash
# Sur le serveur
sudo apt update
sudo apt install nodejs npm nginx certbot
npm install pm2 -g

# Cloner le projet
git clone [votre-repo]
cd Project-kama-master/backend
npm install --production

# Démarrer avec PM2
pm2 start server.js --name kama-api
pm2 save
pm2 startup

# Configurer Nginx comme reverse proxy
# Obtenir SSL avec certbot
```

### Option 3: Vercel/Netlify (Frontend) + Railway/Render (Backend)
- Déployer le frontend sur Vercel/Netlify
- Déployer le backend sur Railway/Render
- Configurer les variables d'environnement sur chaque plateforme

## 📝 Configuration Finale

### Ajuster Helmet pour la production
Si vous utilisez des ressources externes (CDN, APIs), ajustez la CSP dans `server.js` :

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "https://cdn.exemple.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https:"],
      connectSrc: ["'self'", "https://api.exemple.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      // ... autres directives
    },
  },
}));
```

### Configurer CORS pour un domaine spécifique
```javascript
app.use(cors({ 
  origin: 'https://votre-domaine.com', // Remplacer par votre domaine exact
  credentials: true
}));
```

### Tests finaux
1. Tester toutes les fonctionnalités en production
2. Vérifier les headers de sécurité : https://securityheaders.com
3. Tester SSL : https://www.ssllabs.com/ssltest/
4. Vérifier les performances : https://gtmetrix.com

## 📞 Support

Si vous avez des questions pendant le déploiement, n'hésitez pas à demander de l'aide !

## 🎉 Félicitations !

Votre application est maintenant prête pour la production avec :
- ✅ Sécurité renforcée avec Helmet
- ✅ Toutes les vulnérabilités corrigées
- ✅ Authentication JWT sécurisée
- ✅ Protection contre les attaques communes

Il ne reste plus qu'à :
1. Configurer vos variables d'environnement
2. Choisir votre plateforme de déploiement
3. Lancer votre application ! 🚀
