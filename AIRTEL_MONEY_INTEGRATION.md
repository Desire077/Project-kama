# Intégration Airtel Money Gabon

## Configuration requise

### 1. Compte développeur Airtel Money
1. Accédez au [Airtel Africa Developer Portal](https://developers.airtel.africa/)
2. Créez un compte développeur
3. Créez une application
4. Obtenez votre `Client ID` et `Client Secret`

### 2. Variables d'environnement
Ajoutez les variables suivantes à votre fichier `.env` du backend :

```env
# Airtel Money Configuration
AIRTEL_CLIENT_ID=votre_client_id_ici
AIRTEL_CLIENT_SECRET=votre_client_secret_ici
AIRTEL_BASE_URL=https://openapi.airtel.africa
AIRTEL_ENV=sandbox # ou 'production' en production
```

## Architecture du système

### 1. Initialisation du paiement
- Route: `POST /api/payments/airtel/init`
- Le frontend envoie le numéro de téléphone, le montant et l'ID utilisateur
- Le backend génère un token Airtel et initie la transaction
- L'utilisateur reçoit une demande de confirmation sur son téléphone

### 2. Callback de confirmation
- Route: `POST /api/payments/airtel/callback` (publique)
- Airtel appelle cette route pour confirmer le paiement
- Le système met à jour le statut du paiement et active l'abonnement premium

### 3. Vérification du statut
- Route: `GET /api/payments/airtel/status/:reference`
- Le frontend peut vérifier périodiquement le statut du paiement

## Flux de paiement

1. **Utilisateur sélectionne un plan premium**
2. **Saisie du numéro de téléphone Airtel Money**
3. **Initialisation du paiement via l'API Airtel**
4. **L'utilisateur reçoit une demande de confirmation sur son téléphone**
5. **L'utilisateur entre son code PIN pour confirmer**
6. **Airtel envoie un callback de confirmation au backend**
7. **Le backend active l'abonnement premium**
8. **Le frontend redirige vers le tableau de bord**

## Sécurité

- Tous les callbacks Airtel sont loggés pour audit
- Les tokens Airtel sont générés dynamiquement pour chaque transaction
- Les numéros de téléphone sont validés pour le format Gabonais
- HTTPS est obligatoire en production

## Gestion des erreurs

Le système gère les erreurs suivantes :
- Numéro de téléphone invalide
- Fonds insuffisants
- Transaction annulée par l'utilisateur
- Erreurs de réseau
- Erreurs d'API Airtel

## Test

Pour tester le système :
1. Utilisez l'environnement sandbox Airtel
2. Testez avec des numéros de test fournis par Airtel
3. Vérifiez les logs pour le suivi des transactions

## Production

En production :
1. Changez `AIRTEL_ENV` à 'production'
2. Assurez-vous que HTTPS est activé
3. Testez minutieusement avant de mettre en ligne
4. Surveillez les logs pour les erreurs potentielles