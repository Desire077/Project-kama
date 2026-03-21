# 📋 Documentation des Tests API — Kama

> **Plateforme immobilière Kama** | API REST Node.js/Express | Base URL : `https://www.kama-ga.cloud`
> 

---

## 📌 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Configuration & Prérequis](#configuration--prérequis)
3. [Variables d'environnement](#variables-denvironnement)
4. [Module 1 — Authentification](#module-1--authentification)
5. [Module 2 — Propriétés](#module-2--propriétés)
6. [Module 3 — Utilisateurs](#module-3--utilisateurs)
7. [Module 4 — Paiements](#module-4--paiements)
8. [Module 5 — Santé & Debug](#module-5--santé--debug)
9. [Scénarios de test end-to-end](#scénarios-de-test-end-to-end)
10. [Cas de test négatifs & sécurité](#cas-de-test-négatifs--sécurité)
11. [Bonnes pratiques](#bonnes-pratiques)

---

## Vue d'ensemble

L'API Kama est une API REST pour une plateforme immobilière gabonaise. Elle permet de gérer des annonces immobilières, des utilisateurs (vendeurs et acheteurs), des paiements via Mobile Money (Orange Money, Airtel Money) et des abonnements Premium.

| Catégorie | Nombre de requêtes | Authentification requise |
|---|---|---|
| Authentification | 6 | Partielle |
| Propriétés | 10 | Partielle |
| Utilisateurs | 11 | Oui (toutes) |
| Paiements | 4 | Oui (toutes) |
| Santé & Debug | 2 | Non |
| **TOTAL** | **33** | — |

---

## Configuration & Prérequis

### Démarrer le serveur local

```bash
cd backend
npm install
npm run dev
# Le serveur démarre sur https://www.kama-ga.cloud
```

### Vérifier que le serveur est actif

Avant tout test, envoie une requête `GET https://www.kama-ga.cloud/api/health`. Tu dois obtenir un statut `200 OK`.

### Collection Postman

La collection est disponible dans : `postman/collections/Kama-API/`

Elle contient 33 requêtes organisées en 5 dossiers avec des tests automatisés.

---

## Variables d'environnement

L'environnement **Kama Local** contient les variables suivantes :

| Variable | Description | Valeur par défaut | Remplie automatiquement |
|---|---|---|---|
| `baseUrl` | URL de base de l'API | `https://www.kama-ga.cloud` | Non |
| `authToken` | Token JWT de l'utilisateur connecté | *(vide)* | ✅ Oui (après Login) |
| `adminToken` | Token JWT de l'administrateur | *(vide)* | ✅ Oui (après Admin Login) |
| `propertyId` | ID de la dernière propriété créée | *(vide)* | ✅ Oui (après Créer propriété) |
| `userId` | ID de l'utilisateur connecté | *(vide)* | ✅ Oui (après Login) |

> 💡 **Astuce :** Lance d'abord le **Login** pour que `authToken` et `userId` soient automatiquement sauvegardés dans les variables de collection.

---

## Module 1 — Authentification

**Base URL :** `{{baseUrl}}/api/auth`

---

### 1.1 Register — Inscription d'un nouvel utilisateur

| Champ | Valeur |
|---|---|
| **Méthode** | `POST` |
| **URL** | `{{baseUrl}}/api/auth/register` |
| **Auth** | Aucune |

**Corps de la requête (JSON) :**
```json
{
  "firstName": "test",
  "lastName": "sellman",
  "password": "MotDePasse123!",
  "email": "test@vendre.com",
  "role": "vendeur",
  "whatsapp": "+24177221003"
}
```

**Tests automatisés :**
- ✅ Status code est `201 Created`
- ✅ La réponse contient `success: true`
- ✅ La réponse contient un `token` JWT
- ✅ La réponse contient les données utilisateur (`data._id`)
- 🔄 Sauvegarde automatique de `authToken` et `userId`

**Cas de test supplémentaires à vérifier manuellement :**
- ❌ Email déjà utilisé → doit retourner `400` ou `409`
- ❌ Mot de passe trop court → doit retourner `400`
- ❌ Email invalide → doit retourner `400`
- ❌ Champs obligatoires manquants → doit retourner `400`

---

### 1.2 Login — Connexion utilisateur

| Champ | Valeur |
|---|---|
| **Méthode** | `POST` |
| **URL** | `{{baseUrl}}/api/auth/login` |
| **Auth** | Aucune |

**Corps de la requête (JSON) :**
```json
{
  "email": "test@vendeur.com",
  "password": "MotDePasse123!"
}
```

**Tests automatisés :**
- ✅ Status code est `200 OK`
- ✅ La réponse contient `success: true`
- ✅ La réponse contient un `token` JWT
- ✅ La réponse contient les données utilisateur
- ✅ Temps de réponse inférieur à 2000ms
- 🔄 Sauvegarde automatique de `authToken` et `userId`

**Cas de test supplémentaires :**
- ❌ Mauvais mot de passe → doit retourner `401`
- ❌ Email inexistant → doit retourner `401` ou `404`
- ❌ Corps vide → doit retourner `400`

---

### 1.3 Get Me — Profil de l'utilisateur connecté

| Champ | Valeur |
|---|---|
| **Méthode** | `GET` |
| **URL** | `{{baseUrl}}/api/auth/me` |
| **Auth** | `Bearer {{authToken}}` |

**Tests automatisés :**
- ✅ Status code est `200 OK`
- ✅ La réponse contient `success: true`
- ✅ La réponse contient les données utilisateur

**Cas de test supplémentaires :**
- ❌ Sans token → doit retourner `401`
- ❌ Token expiré → doit retourner `401`

---

### 1.4 Refresh Token — Renouvellement du token

| Champ | Valeur |
|---|---|
| **Méthode** | `POST` |
| **URL** | `{{baseUrl}}/api/auth/refresh` |
| **Auth** | `Bearer {{authToken}}` |

**Tests automatisés :**
- ✅ Status code est `200 OK`
- ✅ La réponse contient un nouveau `token`

---

### 1.5 Admin Login — Connexion administrateur

| Champ | Valeur |
|---|---|
| **Méthode** | `POST` |
| **URL** | `{{baseUrl}}/api/auth/admin/login` |
| **Auth** | Aucune |

**Corps de la requête (JSON) :**
```json
{
  "email": "admin@kama.com",
  "password": "AdminPassword123!"
}
```

**Tests automatisés :**
- ✅ Status code est `200 OK`
- ✅ La réponse contient un `token` admin
- 🔄 Sauvegarde automatique de `adminToken`

---

### 1.6 Logout — Déconnexion

| Champ | Valeur |
|---|---|
| **Méthode** | `POST` |
| **URL** | `{{baseUrl}}/api/auth/logout` |
| **Auth** | `Bearer {{authToken}}` |

**Tests automatisés :**
- ✅ Status code est `200 OK`
- ✅ La réponse confirme la déconnexion

---

## Module 2 — Propriétés

**Base URL :** `{{baseUrl}}/api/properties`

---

### 2.1 Toutes les propriétés — Liste publique

| Champ | Valeur |
|---|---|
| **Méthode** | `GET` |
| **URL** | `{{baseUrl}}/api/properties` |
| **Auth** | Aucune |

**Tests automatisés :**
- ✅ Status code est `200 OK`
- ✅ La réponse contient `success: true`
- ✅ La réponse contient un tableau `data`
- ✅ Temps de réponse inférieur à 3000ms

**Paramètres de filtre disponibles :**
```
?city=Libreville
?type=maison
?minPrice=500000&maxPrice=5000000
?rooms=3
?status=online
```

---

### 2.2 Rechercher des propriétés

| Champ | Valeur |
|---|---|
| **Méthode** | `GET` |
| **URL** | `{{baseUrl}}/api/properties/search?q=Owendo` |
| **Auth** | Aucune |

**Tests automatisés :**
- ✅ Status code est `200 OK`
- ✅ La réponse contient des résultats de recherche

---

### 2.3 Créer une propriété ⭐

| Champ | Valeur |
|---|---|
| **Méthode** | `POST` |
| **URL** | `{{baseUrl}}/api/properties` |
| **Auth** | `Bearer {{authToken}}` |

**Corps de la requête (JSON) :**
```json
{
  "address": {
    "country": "Gabon",
    "city": "Libreville",
    "district": "Owendo",
    "street": "",
    "postalCode": ""
  },
  "title": "La plus belle maison de Owendo",
  "description": "Belle maison en bordure de route à Owendo",
  "type": "maison",
  "price": 3500000,
  "currency": "XAF",
  "surface": 180,
  "rooms": 4,
  "bathrooms": 2,
  "kitchens": 1,
  "livingRooms": 2,
  "terrace": true,
  "pool": false,
  "parking": false,
  "status": "online"
}
```

**Tests automatisés :**
- ✅ Status code est `201 Created`
- ✅ La réponse contient `success: true`
- ✅ La réponse contient les données de la propriété (`_id`, `title`)
- 🔄 Sauvegarde automatique de `propertyId`

**Cas de test supplémentaires :**
- ❌ Sans authentification → doit retourner `401`
- ❌ Prix négatif → doit retourner `400`
- ❌ Titre manquant → doit retourner `400`

---

### 2.4 Propriété par ID

| Champ | Valeur |
|---|---|
| **Méthode** | `GET` |
| **URL** | `{{baseUrl}}/api/properties/{{propertyId}}` |
| **Auth** | Optionnelle |

**Tests automatisés :**
- ✅ Status code est `200 OK`
- ✅ La réponse contient les détails de la propriété
- ✅ La propriété a un `_id`, `title`, `price`

**Cas de test supplémentaires :**
- ❌ ID inexistant → doit retourner `404`
- ❌ ID malformé → doit retourner `400`

---

### 2.5 Modifier une propriété

| Champ | Valeur |
|---|---|
| **Méthode** | `PUT` |
| **URL** | `{{baseUrl}}/api/properties/{{propertyId}}` |
| **Auth** | `Bearer {{authToken}}` |

**Corps de la requête (JSON) :**
```json
{
  "title": "Maison rénovée à Owendo",
  "price": 4000000
}
```

**Tests automatisés :**
- ✅ Status code est `200 OK`
- ✅ Les données modifiées sont reflétées dans la réponse

**Cas de test supplémentaires :**
- ❌ Modifier la propriété d'un autre utilisateur → doit retourner `403`

---

### 2.6 Supprimer une propriété

| Champ | Valeur |
|---|---|
| **Méthode** | `DELETE` |
| **URL** | `{{baseUrl}}/api/properties/{{propertyId}}` |
| **Auth** | `Bearer {{authToken}}` |

**Tests automatisés :**
- ✅ Status code est `200 OK`
- ✅ La réponse confirme la suppression

---

### 2.7 Mes propriétés

| Champ | Valeur |
|---|---|
| **Méthode** | `GET` |
| **URL** | `{{baseUrl}}/api/properties/my-properties` |
| **Auth** | `Bearer {{authToken}}` |

**Tests automatisés :**
- ✅ Status code est `200 OK`
- ✅ La réponse contient uniquement les propriétés de l'utilisateur connecté

---

### 2.8 Upload d'images

| Champ | Valeur |
|---|---|
| **Méthode** | `POST` |
| **URL** | `{{baseUrl}}/api/properties/{{propertyId}}/images` |
| **Auth** | `Bearer {{authToken}}` |
| **Body** | `form-data` |

**Tests automatisés :**
- ✅ Status code est `200 OK` ou `201 Created`
- ✅ La réponse contient les URLs des images uploadées

---

### 2.9 Ajouter un avis

| Champ | Valeur |
|---|---|
| **Méthode** | `POST` |
| **URL** | `{{baseUrl}}/api/properties/{{propertyId}}/reviews` |
| **Auth** | `Bearer {{authToken}}` |

**Corps de la requête (JSON) :**
```json
{
  "rating": 4,
  "comment": "Très belle propriété, bien située"
}
```

---

### 2.10 Statistiques des propriétés

| Champ | Valeur |
|---|---|
| **Méthode** | `GET` |
| **URL** | `{{baseUrl}}/api/properties/stats` |
| **Auth** | `Bearer {{authToken}}` |

**Tests automatisés :**
- ✅ Status code est `200 OK`
- ✅ La réponse contient des statistiques (nombre de vues, contacts, etc.)

---

## Module 3 — Utilisateurs

**Base URL :** `{{baseUrl}}/api/users`

> ⚠️ **Toutes les requêtes de ce module nécessitent un token d'authentification.**

---

### 3.1 Mon profil

| Champ | Valeur |
|---|---|
| **Méthode** | `GET` |
| **URL** | `{{baseUrl}}/api/users/profile` |
| **Auth** | `Bearer {{authToken}}` |

**Tests automatisés :**
- ✅ Status code est `200 OK`
- ✅ La réponse contient `success: true`
- ✅ La réponse contient `email` et `name`
- ✅ La réponse contient `_id` et `createdAt`

---

### 3.2 Modifier le profil

| Champ | Valeur |
|---|---|
| **Méthode** | `PUT` |
| **URL** | `{{baseUrl}}/api/users/profile` |
| **Auth** | `Bearer {{authToken}}` |

**Corps de la requête (JSON) :**
```json
{
  "firstName": "Nouveau Prénom",
  "lastName": "Nouveau Nom",
  "whatsapp": "+24177000000"
}
```

---

### 3.3 Changer le mot de passe

| Champ | Valeur |
|---|---|
| **Méthode** | `PUT` |
| **URL** | `{{baseUrl}}/api/users/change-password` |
| **Auth** | `Bearer {{authToken}}` |

**Corps de la requête (JSON) :**
```json
{
  "currentPassword": "MotDePasse123!",
  "newPassword": "NouveauMotDePasse456!"
}
```

**Cas de test supplémentaires :**
- ❌ Ancien mot de passe incorrect → doit retourner `400` ou `401`
- ❌ Nouveau mot de passe trop court → doit retourner `400`

---

### 3.4 Mes favoris

| Champ | Valeur |
|---|---|
| **Méthode** | `GET` |
| **URL** | `{{baseUrl}}/api/users/favorites` |
| **Auth** | `Bearer {{authToken}}` |

**Tests automatisés :**
- ✅ Status code est `200 OK`
- ✅ La réponse contient un tableau de favoris

---

### 3.5 Ajouter un favori

| Champ | Valeur |
|---|---|
| **Méthode** | `POST` |
| **URL** | `{{baseUrl}}/api/users/favorites/{{propertyId}}` |
| **Auth** | `Bearer {{authToken}}` |

---

### 3.6 Supprimer un favori

| Champ | Valeur |
|---|---|
| **Méthode** | `DELETE` |
| **URL** | `{{baseUrl}}/api/users/favorites/{{propertyId}}` |
| **Auth** | `Bearer {{authToken}}` |

---

### 3.7 Mes alertes

| Champ | Valeur |
|---|---|
| **Méthode** | `GET` |
| **URL** | `{{baseUrl}}/api/users/alerts` |
| **Auth** | `Bearer {{authToken}}` |

---

### 3.8 Créer une alerte

| Champ | Valeur |
|---|---|
| **Méthode** | `POST` |
| **URL** | `{{baseUrl}}/api/users/alerts` |
| **Auth** | `Bearer {{authToken}}` |

**Corps de la requête (JSON) :**
```json
{
  "city": "Libreville",
  "type": "maison",
  "maxPrice": 5000000,
  "minRooms": 3
}
```

---

### 3.9 Mon abonnement

| Champ | Valeur |
|---|---|
| **Méthode** | `GET` |
| **URL** | `{{baseUrl}}/api/users/subscription` |
| **Auth** | `Bearer {{authToken}}` |

---

### 3.10 Statut Premium

| Champ | Valeur |
|---|---|
| **Méthode** | `GET` |
| **URL** | `{{baseUrl}}/api/users/premium-status` |
| **Auth** | `Bearer {{authToken}}` |

**Tests automatisés :**
- ✅ Status code est `200 OK`
- ✅ La réponse indique si l'utilisateur est Premium ou non

---

### 3.11 Statistiques utilisateur

| Champ | Valeur |
|---|---|
| **Méthode** | `GET` |
| **URL** | `{{baseUrl}}/api/users/stats` |
| **Auth** | `Bearer {{authToken}}` |

---

## Module 4 — Paiements

**Base URL :** `{{baseUrl}}/api/payments`

> ⚠️ **Toutes les requêtes nécessitent un token. Les paiements utilisent Orange Money et Airtel Money (XAF).**

---

### 4.1 Créer une intention de paiement

| Champ | Valeur |
|---|---|
| **Méthode** | `POST` |
| **URL** | `{{baseUrl}}/api/payments/create-payment-intent` |
| **Auth** | `Bearer {{authToken}}` |

**Corps de la requête (JSON) :**
```json
{
  "amount": 5000,
  "currency": "XAF",
  "description": "Abonnement Premium Kama",
  "paymentMethod": "mobile_money",
  "provider": "orange_money"
}
```

**Tests automatisés :**
- ✅ Status code est `200 OK` ou `201 Created`
- ✅ La réponse contient `success: true`
- ✅ La réponse contient les données de l'intention de paiement
- ✅ L'intention de paiement a un `_id`

**Cas de test supplémentaires :**
- ❌ Montant négatif → doit retourner `400`
- ❌ Devise non supportée → doit retourner `400`
- ❌ Provider invalide → doit retourner `400`

---

### 4.2 Créer un abonnement

| Champ | Valeur |
|---|---|
| **Méthode** | `POST` |
| **URL** | `{{baseUrl}}/api/payments/subscribe` |
| **Auth** | `Bearer {{authToken}}` |

**Corps de la requête (JSON) :**
```json
{
  "plan": "premium",
  "duration": "monthly",
  "paymentMethod": "mobile_money",
  "provider": "airtel_money",
  "phoneNumber": "+24177221003"
}
```

**Tests automatisés :**
- ✅ Status code est `200 OK` ou `201 Created`
- ✅ La réponse contient les détails de l'abonnement

---

### 4.3 Activer Premium

| Champ | Valeur |
|---|---|
| **Méthode** | `POST` |
| **URL** | `{{baseUrl}}/api/payments/activate-premium` |
| **Auth** | `Bearer {{authToken}}` |

**Tests automatisés :**
- ✅ Status code est `200 OK`
- ✅ Le statut Premium de l'utilisateur est activé

---

### 4.4 Vérifier l'accès

| Champ | Valeur |
|---|---|
| **Méthode** | `GET` |
| **URL** | `{{baseUrl}}/api/payments/check-access` |
| **Auth** | `Bearer {{authToken}}` |

**Tests automatisés :**
- ✅ Status code est `200 OK`
- ✅ La réponse indique les droits d'accès de l'utilisateur

---

## Module 5 — Santé & Debug

---

### 5.1 Health Check

| Champ | Valeur |
|---|---|
| **Méthode** | `GET` |
| **URL** | `{{baseUrl}}/api/health` |
| **Auth** | Aucune |

**Tests automatisés :**
- ✅ Status code est `200 OK`
- ✅ La réponse contient `status: ok` (ou `healthy` ou `up`)
- ✅ Temps de réponse inférieur à 1000ms
- ✅ La connexion à la base de données est saine (si `database` présent dans la réponse)

> 💡 **Lance toujours ce test en premier** pour vérifier que le serveur est opérationnel.

---

### 5.2 API Root

| Champ | Valeur |
|---|---|
| **Méthode** | `GET` |
| **URL** | `{{baseUrl}}/` |
| **Auth** | Aucune |

**Tests automatisés :**
- ✅ Status code est `200 OK`
- ✅ L'API répond correctement

---

## Scénarios de test end-to-end

Ces scénarios testent des flux complets de l'application. Lance les requêtes dans l'ordre indiqué.

---

### 🔄 Scénario 1 : Inscription et publication d'une annonce

```
1. POST /api/auth/register        → Créer un compte vendeur
2. POST /api/auth/login           → Se connecter (authToken sauvegardé)
3. POST /api/properties           → Créer une propriété (propertyId sauvegardé)
4. GET  /api/properties/{{propertyId}} → Vérifier que la propriété est visible
5. PUT  /api/properties/{{propertyId}} → Modifier le prix
6. GET  /api/properties/my-properties → Vérifier dans mes propriétés
```

**Résultat attendu :** L'annonce est créée, modifiable et visible publiquement.

---

### 🔄 Scénario 2 : Recherche et mise en favori

```
1. POST /api/auth/login           → Se connecter
2. GET  /api/properties?city=Libreville → Rechercher des propriétés
3. GET  /api/properties/{{propertyId}}  → Voir le détail d'une propriété
4. POST /api/users/favorites/{{propertyId}} → Ajouter aux favoris
5. GET  /api/users/favorites      → Vérifier la liste des favoris
6. DELETE /api/users/favorites/{{propertyId}} → Retirer des favoris
```

---

### 🔄 Scénario 3 : Abonnement Premium

```
1. POST /api/auth/login           → Se connecter
2. GET  /api/users/premium-status → Vérifier statut actuel (non-premium)
3. POST /api/payments/create-payment-intent → Créer intention de paiement
4. POST /api/payments/subscribe   → Souscrire à l'abonnement
5. GET  /api/users/premium-status → Vérifier statut (premium activé)
6. GET  /api/payments/check-access → Vérifier les droits d'accès
```

---

### 🔄 Scénario 4 : Gestion du profil

```
1. POST /api/auth/login           → Se connecter
2. GET  /api/users/profile        → Voir le profil actuel
3. PUT  /api/users/profile        → Modifier le profil
4. GET  /api/users/profile        → Vérifier les modifications
5. PUT  /api/users/change-password → Changer le mot de passe
6. POST /api/auth/login           → Se reconnecter avec le nouveau mot de passe
```

---

## Cas de test négatifs & sécurité

Ces tests vérifient que l'API gère correctement les erreurs et protège les données.

### 🔒 Tests d'authentification

| Test | Requête | Résultat attendu |
|---|---|---|
| Accès sans token | `GET /api/users/profile` (sans header Auth) | `401 Unauthorized` |
| Token invalide | `GET /api/users/profile` (token = "faketoken") | `401 Unauthorized` |
| Token expiré | `GET /api/users/profile` (token expiré) | `401 Unauthorized` |
| Mauvais mot de passe | `POST /api/auth/login` (mauvais mdp) | `401 Unauthorized` |

### 🔒 Tests d'autorisation

| Test | Requête | Résultat attendu |
|---|---|---|
| Modifier propriété d'autrui | `PUT /api/properties/{id_autre_user}` | `403 Forbidden` |
| Supprimer propriété d'autrui | `DELETE /api/properties/{id_autre_user}` | `403 Forbidden` |
| Accès admin sans droits | `POST /api/auth/admin/login` (compte normal) | `403 Forbidden` |

### 🔒 Tests de validation des données

| Test | Requête | Résultat attendu |
|---|---|---|
| Email invalide à l'inscription | `POST /api/auth/register` (email = "pas-un-email") | `400 Bad Request` |
| Prix négatif | `POST /api/properties` (price = -1000) | `400 Bad Request` |
| ID inexistant | `GET /api/properties/000000000000000000000000` | `404 Not Found` |
| ID malformé | `GET /api/properties/abc` | `400 Bad Request` |
| Corps vide | `POST /api/auth/login` (body = {}) | `400 Bad Request` |

---

## Bonnes pratiques

### ✅ Ordre recommandé pour les tests

1. **Health Check** → Vérifier que le serveur est actif
2. **Register** ou **Login** → Obtenir un token d'authentification
3. **Créer une propriété** → Obtenir un `propertyId`
4. Tester les autres endpoints dans l'ordre logique

### ✅ Utilisation des variables

- Ne jamais coder en dur les tokens ou IDs dans les requêtes
- Utiliser toujours `{{authToken}}`, `{{propertyId}}`, `{{userId}}`
- Les variables sont automatiquement sauvegardées par les scripts de test

### ✅ Interprétation des codes de statut

| Code | Signification | Action |
|---|---|---|
| `200 OK` | Succès | ✅ Normal |
| `201 Created` | Ressource créée | ✅ Normal |
| `400 Bad Request` | Données invalides | Vérifier le corps de la requête |
| `401 Unauthorized` | Non authentifié | Relancer le Login |
| `403 Forbidden` | Non autorisé | Vérifier les droits de l'utilisateur |
| `404 Not Found` | Ressource introuvable | Vérifier l'ID utilisé |
| `500 Internal Server Error` | Erreur serveur | Vérifier les logs du backend |

### ✅ Lancer tous les tests automatiquement

Dans Postman, tu peux lancer toute la collection en une fois :
1. Clic droit sur la collection **Kama API**
2. Sélectionner **Run collection**
3. Tous les tests s'exécutent dans l'ordre
4. Un rapport de résultats s'affiche à la fin

---

*Documentation générée pour le projet Kama — Plateforme immobilière gabonaise*
*Collection Postman : `postman/collections/Kama-API/`*
*Environnement : `postman/environments/Kama Local.environment.yaml`*
