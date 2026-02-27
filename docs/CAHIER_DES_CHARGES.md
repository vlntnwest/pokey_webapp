# Cahier des Charges - Servr
## Plateforme de commande en ligne pour restaurants

**Premier client :** Pokey Bar - 36 rue de la Krutenau, 67000 Strasbourg
**Projet :** Servr (pokey_webapp)
**Version :** 2.0 (refonte Supabase/Prisma)
**Date :** 27/02/2026
**Branche de référence :** `dev`

---

## 1. Présentation du projet

### 1.1 Contexte
Servr est une plateforme backend de commande en ligne multi-restaurant. Le premier client est le Pokey Bar, un restaurant de Poké bowls à Strasbourg. La v1 (branche `master`) fonctionnait avec MongoDB/Mongoose/Auth0 pour un seul restaurant. La v2 (branche `dev`) est une refonte complète vers une architecture multi-restaurant avec Supabase/PostgreSQL/Prisma.

L'application permet :
- La **commande à table** (dine-in) : les clients scannent un QR code et commandent depuis leur smartphone
- Le **Click & Collect** : les clients commandent en ligne et récupèrent leur commande à un créneau choisi
- L'**impression automatique** des tickets en cuisine via TCP/IP (à ré-implémenter)

### 1.2 Objectifs
- Fluidifier le processus de commande en salle (réduire les files d'attente)
- Proposer un service Click & Collect pour élargir la clientèle
- Automatiser l'impression des tickets de commande en cuisine
- Offrir un back-office d'administration complet avec gestion d'équipe et de rôles
- Sécuriser les paiements en ligne
- Supporter plusieurs restaurants sur la même plateforme

### 1.3 Cible utilisateurs
| Profil | Description |
|--------|-------------|
| **Client final** | Commande depuis son smartphone (à table via QR code ou depuis chez lui en C&C) |
| **Owner** | Propriétaire du restaurant, accès complet (gestion équipe, menu, commandes) |
| **Admin** | Gestionnaire, peut modifier le menu et gérer les commandes |
| **Staff** | Membre d'équipe, accès limité à la gestion des commandes |

### 1.4 Historique des versions

| Version | Branche | Stack | Statut |
|---------|---------|-------|--------|
| **v1** | `master` | MongoDB + Mongoose + Auth0 + Handlebars | Ancienne - en production |
| **v2** | `dev` | PostgreSQL + Prisma + Supabase Auth + Zod | Active - en développement |

---

## 2. Architecture technique

### 2.1 Stack technologique (v2 - branche `dev`)

| Couche | Technologie | Version |
|--------|-------------|---------|
| **Runtime** | Node.js (CommonJS) | v20+ (jusqu'à v24) |
| **Framework** | Express.js | v4.21 |
| **Base de données** | PostgreSQL (hébergé Supabase) | via Prisma adapter-pg |
| **ORM** | Prisma | v7.3 |
| **Authentification** | Supabase Auth (JWT) | @supabase/supabase-js 2.91 |
| **Validation** | Zod | v3.24 |
| **Sécurité HTTP** | Helmet | v8.1 |
| **Rate Limiting** | express-rate-limit | v7.5 |
| **Logging** | Pino + pino-pretty (dev) | v10.3 |
| **Paiement** | Stripe | v17.5 (pas encore ré-implémenté) |
| **Email** | Nodemailer | v7.0 (pas encore ré-implémenté) |
| **Impression** | ESC/POS via TCP/IP | (pas encore ré-implémenté) |
| **Tests** | Vitest + Supertest | vitest 4.0 / supertest 7.2 |
| **Frontend** | React (repo séparé) | *(non inclus)* |

### 2.2 Architecture applicative

```
┌─────────────────┐     ┌──────────────────────────────────────────┐     ┌─────────────────────┐
│   Client React  │────▶│  API Express.js                          │────▶│  PostgreSQL          │
│   (Mobile-First)│◀────│                                          │◀────│  (Supabase Cloud)    │
└─────────────────┘     │  Helmet → CORS → Rate Limit → Auth      │     └─────────────────────┘
                        │  → Role Check → Zod Validate → Controller│
                        │  → Error Handler                         │     ┌─────────────────────┐
                        └──────────┬───────────┬───────────┬───────┘     │  Supabase Auth       │
                                   │           │           │        ◀────│  (JWT + User mgmt)   │
                        ┌──────────┘     ┌─────┘     ┌─────┘             └─────────────────────┘
                        ▼                ▼           ▼
                  ┌──────────┐    ┌──────────┐  ┌──────────┐
                  │  Stripe  │    │ Imprimante│  │ Nodemailer│
                  │ Checkout │    │  Thermique│  │  (Gmail)  │
                  │ + Webhook│    │  TCP/IP   │  │           │
                  │ (à faire)│    │ (à faire) │  │ (à faire) │
                  └──────────┘    └──────────┘  └──────────┘
```

### 2.3 Flux d'une requête

```
Client → Express → Rate Limiter → CORS → checkAuth (JWT Supabase)
       → isOwner/isAdmin/isStaff (rôle) → validate (Zod)
       → Controller → Prisma → PostgreSQL
                                    ↓ (si erreur)
                              errorHandler (Zod/Prisma/générique)
```

### 2.4 Structure du projet (v2)

```
pokey_webapp/
├── index.js                 # Point d'entrée — démarrage serveur
├── app.js                   # Config Express (CORS, rate limiting, routes, error handler)
├── logger.js                # Configuration Pino
├── prisma.config.ts         # Configuration Prisma (datasource, migrations)
├── vitest.config.js         # Configuration Vitest
├── controllers/
│   ├── user.controllers.js       # CRUD utilisateur (/api/user)
│   ├── restaurant.controllers.js # CRUD restaurant (/api/restaurants)
│   └── menu.controllers.js       # CRUD menu complet (/api/menu)
├── routes/
│   ├── user.routes.js            # Routes user (GET/PUT/DELETE /me)
│   ├── restaurant.routes.js      # Routes restaurant (POST/PUT/DELETE)
│   └── menu.routes.js            # Routes menu (catégories, produits, options)
├── middleware/
│   ├── auth.middleware.js        # checkAuth — vérifie JWT Supabase + charge user
│   ├── role.middleware.js        # isOwner / isAdmin / isStaff — permissions
│   ├── validate.middleware.js    # validate({ body, params, query }) — Zod
│   └── error.middleware.js       # Error handler centralisé
├── lib/
│   ├── prisma.js                 # Instance PrismaClient (singleton)
│   └── supabase.js               # Client Supabase admin (service_role_key)
├── validators/
│   └── schemas.js                # Tous les schémas Zod
├── prisma/
│   └── schema.prisma             # Schéma BDD (12 modèles)
├── tests/
│   ├── user.spec.js              # Tests intégration user
│   └── restaurant.spec.js        # Tests intégration restaurant
├── Template/
│   └── emailTemplate.html        # Template email confirmation (hérité v1)
└── docs/
    ├── api.md                    # Documentation API complète
    ├── users.md                  # Doc API users
    └── restaurants.md            # Doc API restaurants
```

---

## 3. Modèle de données (Prisma Schema - 12 modèles)

### 3.1 Diagramme relationnel

```
User ──────────────── RestaurantMember ──────────────── Restaurant
                      (role: OWNER/ADMIN/STAFF)            │
                                                           ├── OpeningHour
                                                           ├── Order ──── OrderProduct ──── OrderProductOption
                                                           │                    │                   │
                                                           ├── Product ─────────┘                   │
                                                           │     │                                  │
                                                           │     ├── ProductCategorie ── Categorie  │
                                                           │     └── OptionGroup ── OptionChoice ───┘
                                                           │
```

### 3.2 Détail des entités

#### User
| Champ | Type | Contrainte | Description |
|-------|------|------------|-------------|
| `id` | UUID | PK, auto (gen_random_uuid) | Lié à auth.users Supabase |
| `email` | String | Unique | Email de l'utilisateur |
| `fullName` | VARCHAR(50) | Optionnel | Nom complet |
| `phone` | String | Optionnel | Téléphone |
| `createdAt` | Timestamptz | Auto (UTC) | Date de création |
| `updatedAt` | Timestamp | Auto | Date de mise à jour |

#### Restaurant
| Champ | Type | Contrainte | Description |
|-------|------|------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `name` | VARCHAR(255) | Requis | Nom du restaurant |
| `address` | Text | Requis | Adresse |
| `zipCode` | VARCHAR(5) | Requis, regex `^[0-9]{5}$` | Code postal |
| `city` | VARCHAR(50) | Requis | Ville |
| `phone` | String | Optionnel | Téléphone |
| `email` | String | Optionnel | Email contact |
| `imageUrl` | String | Optionnel | URL logo/image |

#### RestaurantMember (table pivot User ↔ Restaurant)
| Champ | Type | Contrainte | Description |
|-------|------|------------|-------------|
| `id` | UUID | PK | Identifiant |
| `restaurantId` | UUID | FK → Restaurant | Restaurant lié |
| `userId` | UUID | FK → User | Utilisateur lié |
| `role` | Enum: `OWNER`, `ADMIN`, `STAFF` | Requis | Rôle dans le restaurant |

**Contrainte unique :** `(restaurantId, userId)` — un user ne peut avoir qu'un rôle par restaurant.

#### OpeningHour
| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant |
| `restaurantId` | UUID (FK) | Restaurant |
| `dayOfWeek` | Int | Jour (0=lundi, 6=dimanche) |
| `openTime` | String | Heure d'ouverture |
| `closeTime` | String | Heure de fermeture |
| `order` | Int | Ordre d'affichage |

#### Categorie (catégorie de menu)
| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant |
| `restaurantId` | UUID (FK) | Restaurant propriétaire |
| `name` | VARCHAR(255) | Nom de la catégorie (ex: "Bowls", "Sides", "Drinks") |
| `subHeading` | Text | Sous-titre optionnel |
| `displayOrder` | Int | Ordre d'affichage dans le menu |

#### Product (article du menu)
| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant |
| `restaurantId` | UUID (FK) | Restaurant propriétaire |
| `name` | VARCHAR(50) | Nom du produit |
| `description` | VARCHAR(255) | Description |
| `imageUrl` | String | URL image |
| `price` | Decimal(10,2) | Prix en EUR |
| `tags` | String[] | Tags (ex: "vegan", "populaire") |
| `discount` | Decimal(10,2) | Réduction (défaut: 0) |
| `isAvailable` | Boolean | Disponible à la commande (défaut: true) |
| `displayOrder` | Int | Ordre d'affichage |

#### ProductCategorie (pivot Product ↔ Categorie)
| Champ | Type | Description |
|-------|------|-------------|
| `productId` | UUID (FK) | Produit |
| `categorieId` | UUID (FK) | Catégorie |

**Contrainte unique :** `(productId, categorieId)`

#### OptionGroup (groupe d'options pour un produit)
| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant |
| `productId` | UUID (FK) | Produit parent |
| `name` | VARCHAR(255) | Nom du groupe (ex: "Choix de base", "Protéines") |
| `hasMultiple` | Boolean | Sélection multiple autorisée (défaut: false) |
| `isRequired` | Boolean | Choix obligatoire (défaut: true) |
| `minQuantity` | Int | Quantité minimum à sélectionner |
| `maxQuantity` | Int | Quantité maximum |

#### OptionChoice (choix dans un groupe d'options)
| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant |
| `optionGroupId` | UUID (FK) | Groupe parent |
| `name` | VARCHAR(255) | Nom du choix (ex: "Riz", "Saumon", "Avocat") |
| `priceModifier` | Decimal(10,2) | Supplément de prix (défaut: 0) |

#### Order (Commande)
| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant |
| `restaurantId` | UUID (FK) | Restaurant |
| `userId` | UUID (FK, optionnel) | Client (si connecté) |
| `fullName` | VARCHAR(50) | Nom du client |
| `phone` | VARCHAR(50) | Téléphone |
| `email` | VARCHAR(50) | Email |
| `status` | Enum: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `DELIVERED`, `CANCELLED` | Statut |
| `totalPrice` | Decimal(10,2) | Prix total |

#### OrderProduct (articles d'une commande)
| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant |
| `orderId` | UUID (FK) | Commande parent |
| `productId` | UUID (FK) | Produit commandé |
| `quantity` | Int | Quantité |

#### OrderProductOption (options choisies par article commandé)
| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant |
| `orderProductId` | UUID (FK) | Article de commande parent |
| `optionChoiceId` | UUID (FK) | Choix d'option sélectionné |

### 3.3 Enums

| Enum | Valeurs | Description |
|------|---------|-------------|
| `RestaurantRole` | `OWNER`, `ADMIN`, `STAFF` | Hiérarchie des rôles |
| `OrderStatus` | `PENDING` → `IN_PROGRESS` → `COMPLETED` → `DELIVERED` \| `CANCELLED` | Cycle de vie de la commande |

### 3.4 Règles de cascade
- Supprimer un **Restaurant** supprime tous ses membres, catégories, produits, commandes, horaires
- Supprimer un **Product** supprime ses catégories liées, groupes d'options, articles de commande
- Supprimer un **Order** supprime ses articles et options associées
- Supprimer un **OptionGroup** supprime ses choix
- Tous les IDs sont des UUID v4 générés par PostgreSQL (`gen_random_uuid()`)

---

## 4. Fonctionnalités détaillées

### 4.1 Module Authentification & Utilisateurs

**Technologie :** Supabase Auth (côté client) + vérification JWT (côté serveur)

**Flux :**
1. Le client s'authentifie via Supabase Auth SDK (login email/password, social login)
2. Il envoie le JWT dans le header `Authorization: Bearer <token>`
3. Le middleware `checkAuth` vérifie le token via `supabase.auth.getUser(token)`
4. Il charge le user depuis la table `users` avec ses `restaurantMembers`
5. `req.user` est disponible dans les controllers suivants

**Routes :**
| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `GET` | `/api/user/me` | Oui | Récupérer son profil |
| `PUT` | `/api/user/me` | Oui | Modifier son profil (fullName, phone) |
| `DELETE` | `/api/user/me` | Oui | Supprimer son compte (Supabase Auth + DB) |

### 4.2 Module Restaurant

**Routes :**
| Méthode | Endpoint | Auth | Rôle | Description |
|---------|----------|------|------|-------------|
| `POST` | `/api/restaurants` | Oui | - | Créer un restaurant (devenir OWNER) |
| `PUT` | `/api/restaurants/:restaurantId` | Oui | ADMIN+ | Modifier les infos |
| `DELETE` | `/api/restaurants/:restaurantId` | Oui | OWNER | Supprimer le restaurant |

**Règle :** A la création, l'utilisateur authentifié est automatiquement ajouté comme `OWNER` via une transaction Prisma.

### 4.3 Module Menu (catégories, produits, options)

**Routes publiques (sans auth) :**
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/menu/restaurants/:restaurantId/menu` | Menu complet (catégories → produits → options) |
| `GET` | `/api/menu/restaurants/:restaurantId/products/:productId` | Détail d'un produit |

**Routes protégées (auth + ADMIN+) :**

*Catégories :*
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/menu/restaurants/:restaurantId/categories` | Créer une catégorie |
| `PUT` | `/api/menu/restaurants/:restaurantId/categories/:categorieId` | Modifier |
| `DELETE` | `/api/menu/restaurants/:restaurantId/categories/:categorieId` | Supprimer |

*Produits :*
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/menu/restaurants/:restaurantId/products` | Créer un produit (+ lien catégorie en transaction) |
| `PUT` | `/api/menu/restaurants/:restaurantId/products/:productId` | Modifier |
| `DELETE` | `/api/menu/restaurants/:restaurantId/products/:productId` | Supprimer |

*Groupes d'options :*
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/menu/.../products/:productId/option-groups` | Créer un groupe d'options |
| `PUT` | `/api/menu/.../option-groups/:optionGroupId` | Modifier |
| `DELETE` | `/api/menu/.../option-groups/:optionGroupId` | Supprimer |

*Choix d'options :*
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/menu/.../option-groups/:optionGroupId/option-choices` | Créer un choix |
| `PUT` | `/api/menu/.../option-choices/:optionChoiceId` | Modifier |
| `DELETE` | `/api/menu/.../option-choices/:optionChoiceId` | Supprimer |

### 4.4 Module Commandes (À IMPLÉMENTER)

**Statut :** Non encore implémenté sur la branche `dev`. Schéma Prisma prêt.

**Routes prévues :**
| Méthode | Endpoint | Auth | Rôle | Description |
|---------|----------|------|------|-------------|
| `POST` | `/api/restaurants/:restaurantId/orders` | Non | - | Créer une commande (client) |
| `GET` | `/api/restaurants/:restaurantId/orders` | Oui | STAFF+ | Lister les commandes |
| `GET` | `/api/restaurants/:restaurantId/orders/:orderId` | Oui | STAFF+ | Détail commande |
| `PATCH` | `/api/restaurants/:restaurantId/orders/:orderId/status` | Oui | STAFF+ | Changer le statut |

**Cycle de vie de la commande :**
```
PENDING → IN_PROGRESS → COMPLETED → DELIVERED
                                  ↘ CANCELLED
```

### 4.5 Module Paiement Stripe (À IMPLÉMENTER)

**Statut :** Stripe est en dépendance (`stripe@17.5`) mais pas encore ré-implémenté. Le placeholder webhook est déclaré dans `app.js` (raw body parsing) mais sans handler.

**Flux de paiement prévu :**
```
Client              Frontend            Backend             Stripe
  │                    │                   │                   │
  ├──[Commande]───────▶│                   │                   │
  │                    ├──[POST /checkout/create-session]─────▶│
  │                    │                   ├──[Session Stripe]─▶│
  │                    │◀──[client_secret]──┤                   │
  │◀──[Formulaire CB]──┤                   │                   │
  ├──[Paiement]────────┤───────────────────┤──────────────────▶│
  │                    │                   │◀─[Webhook signed]──┤
  │                    │                   ├──[Verify signature]│
  │                    │                   ├──[Create Order]    │
  │                    │                   ├──[Print Ticket]    │
  │                    │                   ├──[Send Email]      │
  │                    │◀──[Confirmation]───┤                   │
```

**Routes prévues :**
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/checkout/create-session` | Créer une session Stripe Checkout |
| `POST` | `/api/checkout/webhook` | Webhook Stripe (signature vérifiée) |

### 4.6 Module Email (À IMPLÉMENTER)

**Statut :** Nodemailer en dépendance, template HTML hérité de la v1 présent dans `Template/emailTemplate.html`.
- Envoi d'email de confirmation uniquement pour le Click & Collect
- Template responsive avec logo, numéro de commande, créneau de retrait, total, lien de suivi

### 4.7 Module Impression thermique TCP/IP (À IMPLÉMENTER)

**Statut :** Retiré lors de la migration v2. À ré-implémenter.
- Imprimante : Epson TM-T30
- Protocole : TCP/IP socket raw, port 9100, encodage ESC/POS (CP850)
- Déclenchement : automatique à la création de commande (post-paiement)

### 4.8 Module Horaires d'ouverture (À IMPLÉMENTER)

**Statut :** Schéma Prisma prêt (`OpeningHour`), pas encore de routes/controllers.
- CRUD des horaires par jour de la semaine
- Vérification "restaurant ouvert" avant acceptation de commande

---

## 5. Sécurité

### 5.1 Authentification & Autorisation

| Mécanisme | Technologie | Détail |
|-----------|-------------|--------|
| **Supabase Auth** | JWT | Le client s'authentifie via Supabase SDK, le backend vérifie via `supabase.auth.getUser(token)` |
| **Service Role Key** | Supabase Admin | Le backend utilise `service_role_key` pour bypass RLS et opérations admin |
| **Rôles par restaurant** | RestaurantMember | Hiérarchie OWNER > ADMIN > STAFF, vérifiée par middleware |
| **Middleware chaîné** | checkAuth → isRole | Auth d'abord, puis vérification du rôle pour le restaurant ciblé |

### 5.2 Sécurité réseau & API

| Mesure | Détail | Statut |
|--------|--------|--------|
| **Helmet** | Headers de sécurité HTTP (X-Content-Type-Options, HSTS, etc.) | Actif |
| **Rate Limiting global** | 100 requêtes / 15 min par IP | Actif |
| **Rate Limiting auth** | 15 requêtes / 15 min (routes user) | Actif |
| **Rate Limiting paiement** | 10 requêtes / 15 min (skip webhook) | Actif |
| **CORS** | Origin restreint à `CLIENT_URL`, credentials activés | Actif |
| **Body size limit** | 10 MB max | Actif |
| **Validation Zod** | Validation/sanitization de tous les inputs via middleware | Actif |
| **Error handler centralisé** | Gestion ZodError, Prisma P2025/P2002, erreurs génériques | Actif |
| **Logging structuré** | Pino avec contexte (userId, restaurantId) | Actif |
| **UUIDs** | Identifiants non prédictibles (pas d'auto-increment) | Actif |

### 5.3 Sécurité des paiements (À COMPLÉTER)

| Mesure | Statut |
|--------|--------|
| Stripe Checkout Sessions (PCI DSS compliant) | À implémenter |
| Vérification signature webhook HMAC | À implémenter |
| Création commande uniquement post-webhook | À implémenter |
| Raw body parsing pour webhook (déjà dans `app.js`) | Préparé |
| Montant minimum 0.50 EUR côté serveur | À implémenter |
| Vérification prix serveur vs items | À implémenter |
| Idempotence webhook (éviter double création) | À implémenter |
| Logging webhook pour audit | À implémenter |

**Recommandations sécurité paiement :**
1. Ne jamais faire confiance au prix envoyé par le client — recalculer côté serveur à partir des produits en base
2. Stocker le `paymentIntentId` dans la commande pour traçabilité
3. Implémenter un mécanisme d'idempotence (vérifier si la commande existe déjà avant création sur webhook replay)
4. Logger tous les événements webhook dans une table d'audit
5. Gérer les remboursements (webhook `charge.refunded`)
6. Utiliser une version stable de l'API Stripe (pas de beta)

### 5.4 Comparaison v1 → v2 (améliorations sécurité)

| Point | v1 (master) | v2 (dev) |
|-------|-------------|----------|
| Routes d'écriture menu | Publiques (aucune auth) | Protégées (checkAuth + isAdmin) |
| Rate limiting | Aucun | Global + Auth + Payment |
| Validation input | Aucune | Zod sur toutes les routes |
| Headers sécurité | Aucun | Helmet |
| Logging | console.log | Pino structuré |
| Auth | Auth0 JWT simple | Supabase Auth + Rôles RBAC |
| Gestion d'erreur | Try/catch dispersé | Middleware centralisé |
| IDs | MongoDB ObjectId (prédictible) | UUID v4 (non prédictible) |
| DB credentials | Host en dur dans le code | Variables d'environnement |

---

## 6. Validation des données (schémas Zod)

| Schéma | Champs validés |
|--------|----------------|
| `updateUserSchema` | fullName (string 1-50, opt), phone (regex FR, opt) |
| `restaurantSchema` | name (1-50), address (1-255), zipCode (regex 5 chiffres), city (1-50), phone (regex FR), email (opt), imageUrl (URL, opt) |
| `categorieSchema` | name (1-50), subHeading (1-255, opt), displayOrder (number) |
| `productSchema` | name (1-50), description (1-255), imageUrl (URL), price (number), tags (string[], opt), discount (number, def 0), isAvailable (bool, def true), displayOrder (number, def 999), categorieId (UUID) |
| `productOptionGroupSchema` | name (1-50), hasMultiple (bool, def false), isRequired (bool, def false), minQuantity (number, def 1), maxQuantity (number, def 1) |
| `productOptionChoiceSchema` | name (1-50), priceModifier (number, def 0) |

Chaque schéma a sa variante `update` (tous les champs optionnels).

---

## 7. Variables d'environnement requises (v2)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PORT` | Port du serveur | `5001` |
| `CLIENT_URL` | URL du frontend React | `https://pokeybar.fr` |
| `SUPABASE_URL` | URL du projet Supabase | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Clé publique Supabase | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé admin Supabase (backend only) | `eyJ...` |
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres` |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | `sk_live_****` |
| `STRIPE_WEBHOOK_SECRET` | Secret du webhook Stripe | `whsec_****` |
| `GMAIL_ACCOUNT` | Compte Gmail (emails transactionnels) | `pokeybar@gmail.com` |
| `GMAIL_NODEMAILER_PASSWORD` | App password Gmail | `****` |

---

## 8. Tests

### 8.1 Stratégie
- **Tests d'intégration** contre Supabase réel (signup/login → opérations → cleanup)
- Framework : Vitest + Supertest
- Chaque suite crée un user de test, effectue les opérations, puis nettoie (delete user)

### 8.2 Couverture actuelle
| Module | Tests | Statut |
|--------|-------|--------|
| Users | CRUD complet | Présent (bugs assertions à corriger) |
| Restaurants | CRUD + permissions | Présent (bugs assertions à corriger) |
| Menu | - | À écrire |
| Orders | - | À écrire |
| Middlewares | - | À écrire |

### 8.3 Commandes
```bash
npm start        # Démarrer le serveur (production)
npm run dev      # Démarrer avec nodemon (dev, hot-reload)
npm test         # Lancer les tests (vitest run)
```

---

## 9. Contraintes & Exigences non-fonctionnelles

### 9.1 Performance
- Temps de réponse API < 500ms
- Impression du ticket < 3 secondes après confirmation paiement
- Support de la charge en période de rush (rate limiting adapté)

### 9.2 Disponibilité
- Application disponible 7j/7 pendant les heures d'ouverture
- PostgreSQL hébergé Supabase (haute disponibilité cloud)
- Health check endpoint : `GET /health`

### 9.3 Compatibilité
- Mobile-first (smartphones des clients)
- Navigateurs modernes (Chrome, Safari, Firefox)
- Node.js v20+ (jusqu'à v24)

### 9.4 Réglementation
- **PCI DSS** : Conformité via Stripe — aucune donnée bancaire ne transite par le serveur
- **RGPD** : Droit à la suppression (`DELETE /api/user/me` supprime Auth + DB), données minimales collectées
- **Conformité fiscale** : NF525 à envisager pour la caisse enregistreuse (Phase 4+)

### 9.5 Conventions de code
- **CommonJS** : `require()` / `module.exports` (pas d'ESM)
- **Controllers** : `async (req, res, next)` + `try/catch` + `next(error)`
- **Format réponse** : `{ data: ... }` (succès), `{ error: "..." }` (erreur), `{ message: "..." }` (confirmation)
- **Status codes** : 200 (OK), 201 (created), 400 (validation), 401 (non auth), 403 (forbidden), 404 (not found), 409 (conflict), 500 (serveur)
- **Nommage DB** : snake_case en PostgreSQL, camelCase dans Prisma via `@map()`
- **Langue** : Messages d'erreur en anglais, interface client en français
