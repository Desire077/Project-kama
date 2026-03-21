Résumé de l’implémentation du système administrateur Project-Kama
1. Mise à jour du modèle User
Mise à jour du modèle User pour supporter les rôles : user, seller, admin
Ajout du champ isPremium pour suivre le statut premium
Ajout d’une structure d’abonnement pour la gestion des paiements
2. Système d’authentification admin
Création de l’endpoint /api/auth/admin/login pour la connexion admin
Implémentation du middleware isAdmin pour vérifier le rôle administrateur
Création d’un utilisateur admin avec les identifiants :
Email : top@secret.com
Mot de passe : nocommunicable123!
Rôle : admin
3. Routes du tableau de bord admin
Création du préfixe de route /api/admin protégé par le middleware isAdmin
Implémentation des endpoints :
GET /admin/listings/pending — Lister les annonces en attente
PUT /admin/listings/approve/:id — Approuver une annonce
PUT /admin/listings/reject/:id — Rejeter une annonce
GET /admin/users/list — Lister tous les utilisateurs
4. Système de vérification des biens
Mise à jour du modèle Property avec les statuts : pending, approved, rejected
Définition du statut par défaut à pending pour les nouveaux biens
Modification des endpoints pour afficher uniquement les biens approved au public
Implémentation de notifications email pour les validations/rejets
5. Architecture des services de paiement
Création du dossier /services/payments
Ajout de fichiers placeholders pour Airtel Money et Stripe
Implémentation du contrôleur de paiement avec les endpoints :
GET /api/payments/verify-access — Vérifier le statut premium
POST /api/payments/upgrade-account — Passer un utilisateur en premium
POST /api/payments/activate-premium — Activer les fonctionnalités premium
6. Implémentation des fonctionnalités premium
Création du middleware premiumMiddleware pour contrôler l’accès premium
Limitation de création de biens :
1 bien pour les utilisateurs classiques
illimité pour les utilisateurs premium
Implémentation du boost d’annonce (réservé premium)
Ajout de l’endpoint PUT /api/properties/:id/boost
7. Tests et validation
Création de scripts pour tester l’authentification admin
Vérification de la création de l’utilisateur admin et du hash des mots de passe
Test de la génération des tokens JWT
Validation du fonctionnement des annonces en attente
8. Sécurité
Toutes les routes admin protégées par le middleware isAdmin
Fonctionnalités premium protégées par premiumMiddleware
Contrôle d’accès basé sur les rôles
Hash sécurisé des mots de passe avec bcrypt
Authentification via JWT
9. Notifications email
Intégration de Nodemailer pour envoyer des notifications (validation/rejet)
Envoi d’emails uniquement en environnement de production
Utilisation de templates pour les différents types de messages
10. Évolutivité future
Architecture modulaire prête pour l’intégration Airtel Money
Placeholder Stripe pour les futures options de paiement
Système de gestion des abonnements intégré au modèle User
Approche orientée événements pour le traitement des paiements