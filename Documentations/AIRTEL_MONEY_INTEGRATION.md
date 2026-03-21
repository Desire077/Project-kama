Intégration Airtel Money (Gabon)
Configuration requise
1. Compte développeur Airtel Money
Accédez au portail développeur Airtel Africa : https://developers.airtel.africa/
Créez un compte développeur
Créez une application
Récupérez votre Client ID et votre Client Secret
2. Variables d’environnement

Ajoutez les variables suivantes dans votre fichier .env côté backend :

# Configuration Airtel Money
AIRTEL_CLIENT_ID=votre_client_id_ici
AIRTEL_CLIENT_SECRET=votre_client_secret_ici
AIRTEL_BASE_URL=https://openapi.airtel.africa
AIRTEL_ENV=sandbox # ou 'production' en production
Architecture du système
1. Initialisation du paiement
Route : POST /api/payments/airtel/init
Le frontend envoie : numéro de téléphone, montant, ID utilisateur
Le backend génère un token Airtel et lance la transaction
L’utilisateur reçoit une demande de confirmation sur son téléphone
2. Callback de confirmation
Route : POST /api/payments/airtel/callback (publique)
Airtel appelle cette route pour confirmer le paiement
Le système met à jour le statut du paiement et active l’abonnement premium
3. Vérification du statut
Route : GET /api/payments/airtel/status/:reference
Le frontend peut vérifier régulièrement le statut du paiement
Flux de paiement
L’utilisateur sélectionne une offre premium
Il saisit son numéro Airtel Money
Le paiement est initié via l’API Airtel
L’utilisateur reçoit une demande de validation sur son téléphone
Il entre son code PIN pour confirmer
Airtel envoie une confirmation (callback) au backend
Le backend active l’abonnement premium
Le frontend redirige vers le tableau de bord
Sécurité
Tous les callbacks Airtel sont enregistrés (logs) pour audit
Les tokens Airtel sont générés dynamiquement à chaque transaction
Les numéros sont validés au format gabonais
HTTPS est obligatoire en production
Gestion des erreurs

Le système gère les cas suivants :

Numéro de téléphone invalide
Solde insuffisant
Transaction annulée par l’utilisateur
Problèmes réseau
Erreurs API Airtel
Tests

Pour tester le système :

Utilisez l’environnement sandbox Airtel
Testez avec les numéros fournis par Airtel
Consultez les logs pour suivre les transactions
Production

Avant mise en production :

Passez AIRTEL_ENV à production
Activez HTTPS
Testez complètement le système
Surveillez les logs pour détecter les erreurs