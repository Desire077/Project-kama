# Configuration de Sécurité Helmet

## Qu'est-ce que Helmet ?

Helmet est un middleware Express qui aide à sécuriser votre application en définissant divers headers HTTP. Il protège contre les attaques courantes comme XSS, clickjacking, et autres vulnérabilités web.

## Headers de sécurité configurés

Helmet configure automatiquement ces headers de sécurité :

### 1. **Content Security Policy (CSP)**
Protège contre les attaques XSS en contrôlant quelles ressources peuvent être chargées.

Configuration actuelle :
- `defaultSrc: ["'self'"]` - Seules les ressources du même domaine
- `styleSrc: ["'self'", "'unsafe-inline'"]` - CSS du domaine + styles inline (nécessaire pour React)
- `scriptSrc: ["'self'"]` - Scripts uniquement du même domaine
- `imgSrc: ["'self'", "data:", "https://res.cloudinary.com"]` - Images locales + Cloudinary
- `connectSrc: ["'self'"]` - Connexions AJAX/WebSocket au même domaine
- `fontSrc: ["'self'"]` - Polices du même domaine
- `objectSrc: ["'none'"]` - Bloque Flash/Java
- `mediaSrc: ["'self'"]` - Audio/vidéo du même domaine
- `frameSrc: ["'none'"]` - Empêche l'iframe de votre site

### 2. **X-DNS-Prefetch-Control**
Contrôle la pré-résolution DNS (activé par défaut)

### 3. **X-Frame-Options**
Empêche le clickjacking en interdisant l'affichage dans une iframe (SAMEORIGIN)

### 4. **Strict-Transport-Security**
Force HTTPS sur 180 jours une fois activé

### 5. **X-Download-Options**
Empêche IE d'exécuter des téléchargements dans le contexte du site

### 6. **X-Content-Type-Options**
Empêche le MIME sniffing (nosniff)

### 7. **X-Permitted-Cross-Domain-Policies**
Empêche Adobe Flash/Acrobat de charger du contenu (none)

### 8. **Referrer-Policy**
Contrôle les informations du referrer (no-referrer)

### 9. **X-XSS-Protection**
Protection XSS pour les anciens navigateurs (0 - désactivé car obsolète)

## Ajustements pour la production

Pour la production, vous devrez peut-être ajuster :

1. **CSP pour les ressources externes** :
   - Ajouter les domaines des APIs externes dans `connectSrc`
   - Ajouter les domaines des polices Google dans `fontSrc`
   - Ajouter les CDNs JavaScript dans `scriptSrc`

2. **HTTPS Strict Transport Security** :
   ```javascript
   app.use(helmet({
     // ... autres configs
     hsts: {
       maxAge: 31536000, // 1 an
       includeSubDomains: true,
       preload: true
     }
   }));
   ```

3. **Pour une API publique**, vous pourriez désactiver certaines protections :
   ```javascript
   app.use(helmet({
     contentSecurityPolicy: false, // Si votre API est consommée par d'autres sites
     crossOriginEmbedderPolicy: false
   }));
   ```

## Test de la configuration

Pour vérifier que Helmet fonctionne :

1. Démarrez votre serveur
2. Faites une requête : `curl -I http://localhost:5000/api`
3. Vérifiez les headers de réponse

Vous devriez voir des headers comme :
- X-DNS-Prefetch-Control
- X-Frame-Options
- Strict-Transport-Security
- X-Content-Type-Options
- etc.

## Ressources

- [Documentation Helmet](https://helmetjs.github.io/)
- [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
