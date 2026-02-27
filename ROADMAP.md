# Roadmap — Pokey Webapp Backend

## Audit de l'existant

### Ce qui est en place

- **Users** : CRUD complet (GET /me, PUT /me, DELETE /me) avec auth Supabase
- **Restaurants** : Create / Update / Delete avec gestion des roles (OWNER, ADMIN)
- **Menu** : CRUD complet pour categories, produits, groupes d'options, choix d'options
- **Menu public** : GET menu d'un restaurant (sans auth), GET produit individuel
- **Auth** : Middleware JWT via Supabase, verification du token + lookup DB
- **Roles** : Middleware isOwner / isAdmin / isStaff
- **Rate limiting** : Global (100/15min), Auth (15/15min), Payment (10/15min)
- **Validation** : Schemas Zod sur les routes principales
- **Error handling** : Middleware centralise (Zod, Prisma P2025/P2002, erreurs generiques)
- **Logging** : Pino structure (pino-pretty en dev, JSON en prod)
- **Tests** : Integration tests pour Users et Restaurants (Vitest + Supertest)
- **Template email** : Template HTML pour confirmation de commande (Nodemailer en dependance)
- **Base de donnees** : Schema Prisma complet avec 12 modeles

### Problemes identifies

#### Bugs

1. **`user.controllers.js:30`** — `updateUserData` : le check `if (!result)` est du code mort car `req.body` est toujours un objet. De plus, `result.error.issues` crasherait puisque `result` est juste `req.body` (pas un SafeParseResult). La validation est deja geree par le middleware `validate`, ce bloc est inutile.

2. **`user.spec.js`** — Les tests attendent `response.body.user` mais le controller renvoie `response.body.data`. Les tests echoueront.

3. **`restaurant.spec.js`** — Les tests attendent `response.body.response` mais le controller renvoie `response.body.data`. Les tests echoueront.

4. **`user.spec.js:165`** — Le test attend `"Utilisateur supprime"` mais le controller renvoie `"User deleted successfully"`. Incoherence.

5. **`menu.controllers.js`** — `updateProductCategorie`, `deleteProductCategorie`, `deleteProduct` renvoient un status `201` au lieu de `200`. Le 201 est reserve a la creation.

6. **`menu.controllers.js`** — `deleteProductCategorie` et `deleteProduct` renvoient un string brut au lieu d'un objet JSON. Format de reponse inconsistant.

7. **`restaurant.controllers.js`** — `createRestaurant` fait la validation Zod manuellement dans le controller alors que les autres routes utilisent le middleware `validate`. Inconsistant.

8. **`schemas.js`** — `categorieSchema` et `productSchema` incluent `restaurantId` dans le body, mais celui-ci vient de `req.params`. Double source de verite.

#### Securite

1. **Pas de helmet** — Aucun header HTTP de securite (X-Content-Type-Options, Strict-Transport-Security, etc.)
2. **Pas de request ID** — Difficulte de tracer les requetes dans les logs
3. **Webhook Stripe** declare dans `app.js` mais aucun handler implemente
4. **Pas de sanitization** au-dela de la validation Zod

#### Qualite / DX

1. **Pas de .env.example** commite (reference dans le README mais absent du repo)
2. **Pas de CI/CD**
3. **Pas de Docker** / containerisation
4. **Messages d'erreur bilingues** — Melange francais/anglais dans les reponses ("Non authentifie", "Acces refuse" vs "Resource not found", "Internal server error")
5. **Pas de health check** endpoint
6. **Pas de documentation API** pour le menu (seulement users et restaurants dans `docs/`)

---

## Phase 1 — Corrections et stabilisation

> Priorite : corriger les bugs existants et stabiliser la base avant d'ajouter des fonctionnalites.

- [x] Corriger les status codes dans `menu.controllers.js` (200 au lieu de 201 pour update/delete)
- [x] Uniformiser le format de reponse (toujours `{ data }` ou `{ message }`, jamais de string brut)
- [x] Supprimer le code mort dans `user.controllers.js:updateUserData` (le check `if (!result)` inutile)
- [x] Utiliser le middleware `validate` sur la route `POST /api/restaurants` au lieu de valider dans le controller
- [x] Retirer `restaurantId` de `categorieSchema` et `productSchema` (vient de `req.params`)
- [x] Corriger les tests (`response.body.data` au lieu de `response.body.user` / `response.body.response`)
- [x] Uniformiser la langue des messages d'erreur (tout en anglais)
- [x] Ajouter `helmet` pour les headers de securite HTTP
- [x] Creer et commiter un `.env.example`
- [x] Ajouter un endpoint `GET /health` (health check pour monitoring/deploiement)

## Phase 2 — Fonctionnalites manquantes (core business)

> Priorite : implementer les features necessaires au fonctionnement du systeme de commande.

### Orders (commandes)

- [x] `POST /api/restaurants/:restaurantId/orders` — Creer une commande (public, pas d'auth requise)
- [x] `GET /api/restaurants/:restaurantId/orders` — Lister les commandes (auth, STAFF+)
- [x] `GET /api/restaurants/:restaurantId/orders/:orderId` — Detail d'une commande (auth, STAFF+)
- [x] `PATCH /api/restaurants/:restaurantId/orders/:orderId/status` — Changer le statut (auth, STAFF+)
- [x] Schemas Zod pour les commandes (orderSchema, updateOrderStatusSchema)
- [x] Tests unitaires pour les commandes (order.controllers.spec.js)

### Paiement Stripe

### Paiement Stripe (Stripe Connect)

- [x] `POST /api/checkout/create-session` — Créer une session Stripe Checkout
  - _Logique métier_ : Utiliser Stripe Connect (Destination charges). Le paiement arrive sur le compte plateforme, avec reversement automatique au `stripe_account_id` du restaurant, moins la commission (application_fee_amount).
  - _Fallback_ : Si le paiement échoue côté client, permettre la création de la commande avec un statut spécifique (ex: `PENDING_ON_SITE_PAYMENT`) pour que le restaurateur sache que le client paiera sur place.
- [ ] `POST /api/checkout/webhook` — Handler du webhook Stripe
  - _Configuration_ : Modifier `app.js` pour utiliser `express.raw({ type: 'application/json' })` STRICTEMENT sur cette route afin que Stripe puisse lire le buffer brut.
  - _Sécurité_ : Vérification de la signature du webhook avec `STRIPE_WEBHOOK_SECRET`.
  - _Action_ : Sur l'événement `checkout.session.completed`, créer la commande en base de données avec le statut `COMPLETED` (ou `PENDING` côté cuisine) et lier les produits/options.
- [ ] Gestion des remboursements (Refunds)
  - _Endpoint ou Webhook_ : Implémenter la logique en cas d'annulation de commande pour rembourser le client (et annuler le reversement au restaurant).

### Notifications email

- [ ] Service d'envoi d'email avec Nodemailer (utiliser le template existant `emailTemplate.html`)
- [ ] Envoyer un email de confirmation au client apres une commande
- [ ] Configurer les variables SMTP dans `.env`

### Horaires d'ouverture

- [ ] `GET /api/restaurants/:restaurantId/opening-hours` — Lister les horaires (public)
- [ ] `PUT /api/restaurants/:restaurantId/opening-hours` — Mettre a jour les horaires (auth, ADMIN+)
- [ ] Verification "restaurant ouvert" avant de passer commande

### Lecture restaurant

- [ ] `GET /api/restaurants/:restaurantId` — Consulter les infos d'un restaurant (public)

## Phase 3 — Gestion d'equipe et administration

> Priorite : permettre aux proprietaires de gerer leur equipe.

### Restaurant Members

- [ ] `GET /api/restaurants/:restaurantId/members` — Lister les membres (auth, ADMIN+)
- [ ] `POST /api/restaurants/:restaurantId/members/invite` — Inviter un membre par email (auth, OWNER)
- [ ] `PATCH /api/restaurants/:restaurantId/members/:memberId/role` — Changer le role (auth, OWNER)
- [ ] `DELETE /api/restaurants/:restaurantId/members/:memberId` — Retirer un membre (auth, OWNER)
- [ ] Systeme d'invitation par email (token temporaire + lien d'acceptation)

### Dashboard / Stats

- [ ] `GET /api/restaurants/:restaurantId/stats` — Stats basiques (nombre de commandes, chiffre d'affaires, produits populaires)
- [ ] Filtrage par periode (jour, semaine, mois)

## Phase 4 — Qualite et infrastructure

> Priorite : ameliorer la maintenabilite, la fiabilite et le deploiement.

### Tests

- [ ] Tests d'integration pour le menu (categories, produits, options)
- [ ] Tests d'integration pour les commandes
- [ ] Tests unitaires pour les middlewares (auth, role, validate, error)
- [ ] Tester les cas limites (UUID invalide, ressource inexistante, permissions)
- [ ] Coverage report (vitest --coverage)

### CI/CD

- [ ] GitHub Actions : lint + tests sur chaque PR
- [ ] GitHub Actions : deploy automatique sur merge dans main
- [ ] Linter (ESLint) + formatter (Prettier) avec config committee

### Infrastructure

- [ ] Dockerfile + docker-compose (app + PostgreSQL local)
- [ ] Fichier `.env.example` commite
- [ ] Script de seed pour la base de donnees (donnees de dev)
- [ ] Migrations Prisma versionnees dans le repo

### Documentation

- [ ] Documentation API pour le menu (`docs/menu.md`)
- [ ] Documentation API pour les commandes (`docs/orders.md`)
- [ ] Swagger / OpenAPI spec auto-generee ou manuelle

## Phase 5 — Ameliorations futures

> Nice-to-have, a traiter quand le core est stable.

- [ ] Pagination sur les endpoints de liste (menu, commandes, membres)
- [ ] Recherche / filtrage de produits
- [ ] Upload d'images (Supabase Storage ou S3) au lieu d'URL externes
- [ ] Notifications en temps reel (WebSocket ou Supabase Realtime) pour le dashboard cuisine
- [ ] Systeme de promotions / codes promo
- [ ] Multi-langue pour les menus (i18n)
- [ ] API versioning (`/api/v1/...`)
- [ ] Request ID dans les logs (middleware `x-request-id`)
- [ ] Cache (Redis) pour les menus publics
- [ ] Monitoring et alerting (Sentry, Datadog, etc.)
