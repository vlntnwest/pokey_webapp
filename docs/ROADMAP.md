# Roadmap - Servr
## Plateforme de commande en ligne pour restaurants

**Dernière mise à jour :** 27/02/2026
**Branche de référence :** `dev`

---

## État des lieux (branche `dev`)

### Ce qui est en place
- **Users** : CRUD complet (GET/PUT/DELETE /me) avec auth Supabase
- **Restaurants** : Create / Update / Delete avec gestion des rôles (OWNER, ADMIN)
- **Menu** : CRUD complet pour catégories, produits, groupes d'options, choix d'options
- **Menu public** : GET menu d'un restaurant (sans auth), GET produit individuel
- **Auth** : Middleware JWT via Supabase, vérification du token + lookup DB
- **Rôles** : Middleware isOwner / isAdmin / isStaff (RBAC par restaurant)
- **Rate limiting** : Global (100/15min), Auth (15/15min), Payment (10/15min)
- **Validation** : Schémas Zod sur les routes principales
- **Error handling** : Middleware centralisé (Zod, Prisma P2025/P2002, erreurs génériques)
- **Logging** : Pino structuré (pino-pretty en dev, JSON en prod)
- **Tests** : Tests d'intégration pour Users et Restaurants (Vitest + Supertest)
- **Sécurité** : Helmet (headers HTTP), CORS strict, UUIDs
- **Template email** : Template HTML confirmation de commande (hérité v1)
- **Base de données** : Schema Prisma complet avec 12 modèles
- **Health check** : `GET /health`

### Ce qui reste à faire (fonctionnel en v1 mais pas encore ré-implémenté en v2)
- Commandes (CRUD + workflow de statuts)
- Paiement Stripe (checkout + webhook)
- Impression thermique TCP/IP
- Emails transactionnels (Nodemailer)
- Horaires d'ouverture
- Lecture publique d'un restaurant

### Bugs connus
1. **Tests user** : attendent `response.body.user` mais le controller renvoie `response.body.data`
2. **Tests restaurant** : attendent `response.body.response` au lieu de `response.body.data`
3. **Test deleteUser** : attend `"Utilisateur supprime"` mais le controller renvoie `"User deleted successfully"`

---

## Phase 1 - Corrections & Stabilisation (CRITIQUE)

> Objectif : corriger les bugs existants avant d'ajouter des fonctionnalités.

### 1.1 Bugs à corriger
- [ ] Corriger les assertions des tests user (`response.body.data` au lieu de `response.body.user`)
- [ ] Corriger les assertions des tests restaurant (`response.body.data` au lieu de `response.body.response`)
- [ ] Corriger le message attendu dans test deleteUser (anglais)

### 1.2 Routes manquantes
- [ ] `GET /api/restaurants/:restaurantId` — Consulter les infos d'un restaurant (public)
- [ ] Documenter l'API menu dans `docs/menu.md`

**Estimation :** 1 sprint

---

## Phase 2 - Core Business : Commandes & Paiement (HAUTE)

> Objectif : implémenter les fonctionnalités nécessaires au fonctionnement du système de commande.

### 2.1 Commandes (Orders)
- [ ] `POST /api/restaurants/:restaurantId/orders` — Créer une commande (public)
- [ ] `GET /api/restaurants/:restaurantId/orders` — Lister les commandes (auth, STAFF+)
- [ ] `GET /api/restaurants/:restaurantId/orders/:orderId` — Détail commande (auth, STAFF+)
- [ ] `PATCH /api/restaurants/:restaurantId/orders/:orderId/status` — Changer le statut (auth, STAFF+)
- [ ] Schémas Zod pour les commandes (orderSchema, updateOrderStatusSchema)
- [ ] Recalculer le `totalPrice` côté serveur (ne jamais faire confiance au client)
- [ ] Tests d'intégration pour les commandes

### 2.2 Paiement Stripe (FOCUS SÉCURITÉ)
- [ ] `POST /api/checkout/create-session` — Créer une session Stripe Checkout
- [ ] `POST /api/checkout/webhook` — Handler webhook Stripe (`checkout.session.completed`)
- [ ] Vérification de la signature du webhook (`stripe.webhooks.constructEvent`)
- [ ] La commande n'est créée qu'après confirmation du webhook (pas avant)
- [ ] Vérifier que le montant payé correspond au montant recalculé côté serveur
- [ ] Mécanisme d'idempotence (vérifier si commande déjà créée avant création sur replay webhook)
- [ ] Table d'audit des événements webhook
- [ ] Gestion `payment_intent.payment_failed`
- [ ] Rate limit spécifique (10/15min, déjà préparé dans `app.js`)
- [ ] Tests pour le flux de paiement

### 2.3 Notifications email
- [ ] Service d'envoi d'email avec Nodemailer (réutiliser `emailTemplate.html`)
- [ ] Email de confirmation au client après commande Click & Collect
- [ ] Adapter le template pour le multi-restaurant (nom/adresse dynamiques)

### 2.4 Impression thermique TCP/IP
- [ ] Ré-implémenter le module d'impression ESC/POS (socket TCP, port 9100)
- [ ] Adapter le format du ticket au nouveau modèle de données (produits + options)
- [ ] Impression automatique à la création de commande post-paiement
- [ ] Gestion d'erreur si l'imprimante n'est pas accessible (ne pas bloquer la commande)
- [ ] Configuration imprimante par restaurant (host/port en base ou env)

### 2.5 Horaires d'ouverture
- [ ] `GET /api/restaurants/:restaurantId/opening-hours` — Lister (public)
- [ ] `PUT /api/restaurants/:restaurantId/opening-hours` — Mettre à jour (auth, ADMIN+)
- [ ] Vérification "restaurant ouvert" avant d'accepter une commande

**Estimation :** 3-4 sprints

---

## Phase 3 - Gestion d'équipe & Administration (MOYENNE)

> Objectif : permettre aux propriétaires de gérer leur équipe et avoir de la visibilité.

### 3.1 Gestion des membres (RestaurantMember)
- [ ] `GET /api/restaurants/:restaurantId/members` — Lister les membres (auth, ADMIN+)
- [ ] `POST /api/restaurants/:restaurantId/members/invite` — Inviter par email (auth, OWNER)
- [ ] `PATCH /api/restaurants/:restaurantId/members/:memberId/role` — Changer le rôle (auth, OWNER)
- [ ] `DELETE /api/restaurants/:restaurantId/members/:memberId` — Retirer un membre (auth, OWNER)
- [ ] Système d'invitation par email (token temporaire + lien d'acceptation)

### 3.2 Dashboard / Stats
- [ ] `GET /api/restaurants/:restaurantId/stats` — Stats basiques
  - Nombre de commandes (jour/semaine/mois)
  - Chiffre d'affaires
  - Produits les plus commandés
  - Panier moyen
- [ ] Filtrage par période

### 3.3 Notifications temps réel
- [ ] WebSocket ou Supabase Realtime pour le dashboard cuisine
- [ ] Notification sonore à la réception d'une commande
- [ ] Mise à jour temps réel du statut côté client

**Estimation :** 3 sprints

---

## Phase 4 - Qualité & Infrastructure (MOYENNE)

> Objectif : améliorer la maintenabilité, la fiabilité et le déploiement.

### 4.1 Tests
- [ ] Tests d'intégration pour le menu (catégories, produits, options)
- [ ] Tests d'intégration pour les commandes
- [ ] Tests unitaires pour les middlewares (auth, role, validate, error)
- [ ] Tests des cas limites (UUID invalide, ressource inexistante, permissions)
- [ ] Coverage report (`vitest --coverage`)

### 4.2 CI/CD
- [ ] GitHub Actions : lint + tests sur chaque PR
- [ ] GitHub Actions : deploy automatique sur merge dans main
- [ ] ESLint + Prettier avec config partagée

### 4.3 Infrastructure
- [ ] Dockerfile + docker-compose (app + PostgreSQL local)
- [ ] Script de seed pour la base de données (données de dev)
- [ ] Migrations Prisma versionnées dans le repo

### 4.4 Documentation
- [ ] Documentation API pour le menu (`docs/menu.md`)
- [ ] Documentation API pour les commandes (`docs/orders.md`)
- [ ] Swagger / OpenAPI spec (auto-générée ou manuelle)

**Estimation :** 2-3 sprints

---

## Phase 5 - Expérience utilisateur avancée (BASSE)

> Objectif : enrichir l'expérience client et admin.

### 5.1 Compte client enrichi
- [ ] Social login (Google, Apple via Supabase Auth)
- [ ] Historique des commandes client
- [ ] Commandes favorites / recommander
- [ ] Préférences allergènes dans le profil

### 5.2 Notifications multi-canal
- [ ] SMS de confirmation (Twilio)
- [ ] Email de rappel 30 min avant le créneau C&C
- [ ] Push notifications (PWA)

### 5.3 UX Client
- [ ] Recherche dans le menu
- [ ] Filtrage par allergènes / tags
- [ ] Upload d'images (Supabase Storage)
- [ ] Multi-langue (FR/EN/DE pour Strasbourg)

### 5.4 Paiement avancé
- [ ] Apple Pay / Google Pay (Stripe Payment Request)
- [ ] Paiement partagé à la table (split bill)
- [ ] Pourboire numérique

**Estimation :** 4 sprints

---

## Phase 6 - Croissance & Scale (FUTURE)

> Objectif : préparer la plateforme pour plusieurs restaurants.

### 6.1 Multi-restaurant
- [ ] Onboarding restaurant self-service
- [ ] Dashboard centralisé multi-établissements
- [ ] Configuration imprimante par restaurant
- [ ] Branding personnalisé par restaurant (couleurs, logo)

### 6.2 Monétisation
- [ ] Système de promotions / codes promo
- [ ] Programme de fidélité (points, récompenses)
- [ ] Facturation/abonnement pour les restaurateurs

### 6.3 Infrastructure scalable
- [ ] Cache Redis pour les menus publics
- [ ] API versioning (`/api/v1/...`)
- [ ] Request ID dans les logs (`x-request-id`)
- [ ] Monitoring et alerting (Sentry, Datadog)
- [ ] Pagination sur tous les endpoints de liste
- [ ] Application PWA complète (offline-first)

### 6.4 Conformité
- [ ] NF525 (conformité fiscale caisse enregistreuse française)
- [ ] Intégration comptable (export pour expert-comptable)
- [ ] RGPD : consentement granulaire, export des données, droit à l'oubli

**Estimation :** Post-validation Phase 5

---

## Résumé des priorités

| Phase | Priorité | Focus | Sprints estimés |
|-------|----------|-------|-----------------|
| **Phase 1** | CRITIQUE | Corrections bugs, route manquante | 1 |
| **Phase 2** | HAUTE | Commandes, Stripe, Email, Impression | 3-4 |
| **Phase 3** | MOYENNE | Équipe, Stats, Temps réel | 3 |
| **Phase 4** | MOYENNE | Tests, CI/CD, Docker, Docs | 2-3 |
| **Phase 5** | BASSE | UX client, Notifications, Paiement avancé | 4 |
| **Phase 6** | FUTURE | Multi-restaurant, Scale, Conformité | TBD |

---

## Dettes techniques actuelles

| Dette | Priorité | Détail |
|-------|----------|--------|
| Tests en échec | HAUTE | Assertions incorrectes (mauvaises clés dans `response.body`) |
| Pas de gestion de remboursement | HAUTE | À implémenter avec Stripe |
| Template email figé v1 | MOYENNE | Adapter pour multi-restaurant |
| Pas de pagination | MOYENNE | `findMany` sans limite sur les listes |
| Pas de Docker | BASSE | Dev uniquement local pour l'instant |
| Pas de CI/CD | BASSE | Tests et déploiement manuels |
| Messages bilingues | FAIBLE | Quelques traces de français dans les anciens messages |

---

## Stack recommandée pour les évolutions

| Besoin | Recommandation |
|--------|---------------|
| Temps réel | Supabase Realtime (déjà dans l'écosystème) ou `ws` |
| Upload images | Supabase Storage (cohérent avec le reste de la stack) |
| SMS | Twilio |
| Monitoring | Sentry |
| CI/CD | GitHub Actions |
| Cache | ioredis |
