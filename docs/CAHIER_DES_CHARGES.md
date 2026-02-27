# Cahier des Charges - Pokey Bar
## Application Web Click & Collect / Commande à table

**Client :** Pokey Bar - 36 rue de la Krutenau, 67000 Strasbourg
**Projet :** Servr (pokey_webapp)
**Version :** 1.0
**Date :** 27/02/2026

---

## 1. Présentation du projet

### 1.1 Contexte
Le Pokey Bar est un restaurant spécialisé dans les Poké bowls situé à Strasbourg. L'établissement souhaite digitaliser son processus de commande via une application web permettant :
- La **commande à table** (dine-in) : les clients scannent un QR code et commandent depuis leur smartphone
- Le **Click & Collect** : les clients commandent en ligne et récupèrent leur commande à un créneau choisi

### 1.2 Objectifs
- Fluidifier le processus de commande en salle (réduire les files d'attente)
- Proposer un service Click & Collect pour élargir la clientèle
- Automatiser l'impression des tickets de commande en cuisine
- Offrir un back-office d'administration complet pour le staff
- Sécuriser les paiements en ligne

### 1.3 Cible utilisateurs
| Profil | Description |
|--------|-------------|
| **Client en salle** | Commande depuis son smartphone via QR code à la table |
| **Client C&C** | Commande en ligne depuis chez lui, récupère en boutique |
| **Admin / Staff** | Gère les commandes, le menu, les tables depuis le dashboard |

---

## 2. Architecture technique

### 2.1 Stack technologique

| Couche | Technologie | Version |
|--------|-------------|---------|
| **Backend** | Node.js + Express.js | Node 18-20 / Express 4.21 |
| **Base de données** | MongoDB Atlas (Mongoose) | Mongoose 8.6 |
| **Authentification** | Auth0 (OAuth2 JWT Bearer) | express-oauth2-jwt-bearer 1.6 |
| **Paiement** | Stripe (Checkout Sessions + Webhooks) | stripe 17.4 |
| **Impression** | ESC/POS via TCP/IP (Socket raw) | esc-pos-encoder 2.1 |
| **Email** | Nodemailer (SMTP Gmail) | nodemailer 6.10 |
| **Templates** | Handlebars | handlebars 4.7 |
| **Frontend** | React + Material-UI | *(repo séparé)* |
| **Hébergement** | Hostinger (Node.js) | - |

### 2.2 Architecture applicative

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Client React  │────▶│  API Express.js  │────▶│  MongoDB Atlas  │
│   (Mobile-First)│◀────│   (REST API)     │◀────│   (Cloud DB)    │
└─────────────────┘     └──────┬───┬───┬───┘     └─────────────────┘
                               │   │   │
                    ┌──────────┘   │   └──────────┐
                    ▼              ▼               ▼
              ┌──────────┐  ┌──────────┐    ┌──────────┐
              │  Stripe  │  │ Imprimante│    │ Nodemailer│
              │ Checkout │  │  Thermique│    │  (Gmail)  │
              │ + Webhook│  │  TCP/IP   │    │           │
              └──────────┘  └──────────┘    └──────────┘
```

### 2.3 Infrastructure réseau (impression)

| Paramètre | Valeur |
|-----------|--------|
| Imprimante | Epson TM-T30 |
| Protocole | TCP/IP (socket raw ESC/POS) |
| Port | 9100 (standard) |
| Réseau | LAN local du restaurant |
| Encodage | CP850 (caractères français) |

---

## 3. Modèle de données

### 3.1 Schéma des entités

#### Order (Commande)
| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `orderNumber` | Number (auto-incrémenté) | Auto | Numéro de commande séquentiel |
| `userId` | String | Non | Identifiant utilisateur Auth0 |
| `orderType` | Enum: `dine-in`, `clickandcollect` | Oui | Type de commande |
| `tableNumber` | Number | Si dine-in | Numéro de table |
| `items` | Array[Item] | Oui | Articles commandés |
| `orderDate` | Object {date, time} | Si C&C | Date/heure de retrait |
| `specialInstructions` | String | Non | Commentaires client |
| `totalPrice` | Number | Oui | Prix total (en centimes) |
| `clientData` | Object {name, email, phone} | Non | Coordonnées client |
| `isArchived` | Boolean | Non | Commande archivée |
| `isSuccess` | Boolean | Non | Paiement confirmé |
| `paymentId` | String | Non | ID session Stripe |
| `createdAt` / `updatedAt` | Date | Auto | Timestamps |

#### Item (sous-document de Order)
| Champ | Type | Description |
|-------|------|-------------|
| `type` | Enum: `bowl`, `side`, `drink`, `dessert`, `custom` | Catégorie |
| `name` | String | Nom de l'article |
| `base` | String | Base (riz, quinoa) - bowls/custom |
| `proteins` | [String] | Protéines choisies |
| `extraProtein` | [String] | Protéines supplémentaires |
| `extraProteinPrice` | Number | Supplément protéine |
| `garnishes` | [String] | Garnitures - custom |
| `toppings` | [String] | Toppings - custom |
| `sauces` | [String] | Sauces |
| `quantity` | Number | Quantité |
| `price` | Number | Prix unitaire |

#### MenuItem (Carte du restaurant)
| Champ | Type | Description |
|-------|------|-------------|
| `name` | String | Nom du plat |
| `type` | Enum: `bowl`, `side`, `drink`, `dessert`, `custom` | Catégorie |
| `description` | String | Description |
| `price` | String | Prix |
| `bowlDetails` | BowlSchema | Détails bowl (protéines, garnitures, toppings) |
| `drinkInfo` | Object {variant, size} | Info boisson |
| `available` | Boolean | Disponibilité |
| `hasSauce` | Boolean | Sauce incluse |
| `picture` | String | URL image |
| `isPopular` | Boolean | Mise en avant |

#### User (Utilisateur client)
| Champ | Type | Description |
|-------|------|-------------|
| `firstName` | String | Prénom |
| `lastName` | String | Nom |
| `phone` | String | Téléphone |
| `email` | String (unique) | Email |
| `shouldGiveInformation` | Boolean | Consent marketing |

#### Table
| Champ | Type | Description |
|-------|------|-------------|
| `tableNumber` | Number (unique) | Numéro de table |
| `isOpen` | Boolean | Table ouverte aux commandes |

#### Food (Aliment)
| Champ | Type | Description |
|-------|------|-------------|
| `name` | String | Nom de l'aliment |
| `allergens` | Array[{allergen, allergen_id, level}] | Allergènes (non/trace/oui) |

#### Allergen
| Champ | Type | Description |
|-------|------|-------------|
| `name` | String | Nom de l'allergène |

#### MenuType (Catégorie de menu)
| Champ | Type | Description |
|-------|------|-------------|
| `type` | Enum | Type de catégorie |
| `title` | String | Titre affiché |
| `description` | String | Description de la catégorie |

#### CustomDetails (Options de personnalisation)
| Champ | Type | Description |
|-------|------|-------------|
| `category` | String | Catégorie (base, protein, etc.) |
| `name` | String | Nom de l'option |
| `price` | String | Prix supplément |
| `hasSauce` | Boolean | Sauce associée |

---

## 4. Fonctionnalités détaillées

### 4.1 Module Client - Commande à table (Dine-in)

**Parcours utilisateur :**
1. Le client scanne un QR code spécifique à sa table
2. L'application charge le menu avec le numéro de table pré-rempli
3. Le client parcourt le menu (bowls, sides, drinks, desserts)
4. Il peut personnaliser un bowl custom (base, protéines, garnitures, toppings, sauces)
5. Il ajoute des articles au panier commun de la table
6. Il procède au paiement via Stripe Checkout
7. La commande est imprimée automatiquement en cuisine
8. Le client reçoit un numéro de commande

**Règles métier :**
- Le numéro de table est obligatoire pour les commandes dine-in
- Plusieurs clients à la même table partagent un panier commun
- Le paiement minimum est de 0.50 EUR
- Pas d'email de confirmation pour le dine-in (commande servie sur place)

### 4.2 Module Client - Click & Collect

**Parcours utilisateur :**
1. Le client accède à l'application web
2. Il parcourt le menu et compose sa commande
3. Il renseigne ses coordonnées (nom, email, téléphone)
4. Il sélectionne une date et un créneau horaire de retrait
5. Il procède au paiement via Stripe Checkout
6. La commande est créée après confirmation du webhook Stripe
7. Un ticket est imprimé en cuisine
8. Un email de confirmation est envoyé au client (template HTML Handlebars)
9. Le client consulte sa commande via un lien de confirmation `/confirmation/:id`

**Règles métier :**
- La date et l'heure de retrait sont obligatoires
- Les coordonnées client (nom, email) sont obligatoires
- L'email contient : numéro de commande, nom du client, date/heure de retrait, total, lien vers la commande
- Le format horaire est Europe/Paris

### 4.3 Module Administration

**Fonctionnalités :**

| Fonction | Description | Route API |
|----------|-------------|-----------|
| **Gestion des commandes** | Voir toutes les commandes | `GET /api/private/orders` |
| | Voir une commande | `GET /api/private/orders/:id` |
| | Historique par utilisateur | `GET /api/private/orders/history/:userId` |
| | Commandes par table | `GET /api/private/orders/tables/:tableNumber` |
| | Archiver/désarchiver | `PUT /api/order/:id/toggle` |
| | Supprimer une commande | `DELETE /api/order/:id` |
| | Réimprimer un ticket | `POST /api/order/print-order` |
| **Gestion du menu** | Lister les articles | `GET /api/item` |
| | Créer un article | `POST /api/item` |
| | Modifier un article | `PUT /api/item/:id` |
| | Supprimer un article | `DELETE /api/item/:id` |
| | Gérer les catégories | `GET/POST /api/item/details` |
| | Gérer les options custom | `GET/POST /api/item/custom` |
| **Gestion des tables** | Lister les tables | `GET /api/table` |
| | Créer une table | `POST /api/table` |
| | Ouvrir/fermer une table | `PUT /api/table/:id/toggle` |
| **Gestion des allergènes** | Lister les aliments | `GET /api/food` |
| | Créer un aliment | `POST /api/food` |
| | Modifier niveaux allergènes | `PUT /api/food/:id` |
| | Supprimer des aliments | `DELETE /api/food` |
| | Gérer les allergènes | `GET/POST/DELETE /api/allergen` |
| **Gestion utilisateurs** | Lister | `GET /api/users` |
| | Info par email | `GET /api/users/:email` |
| | Créer | `POST /api/users` |
| | Modifier | `PUT /api/users/:id` |
| | Supprimer (Auth0 + DB) | `DELETE /api/users/:id/:auth0Id` |

**Sécurité admin :**
- Toutes les routes `/api/users` et `/api/private/orders` sont protégées par JWT Auth0
- Le middleware `checkJwt` valide le token contre le domaine et l'audience Auth0

### 4.4 Module Impression thermique (TCP/IP)

**Fonctionnement :**
1. A la création d'une commande (post-paiement), le serveur ouvre un socket TCP vers l'imprimante
2. Les données sont encodées en ESC/POS via `esc-pos-encoder`
3. Le buffer est envoyé via la connexion TCP/IP
4. Le socket est fermé après confirmation d'envoi

**Format du ticket :**
```
Pokey Bar
[Click and Collect / Table: X]
[Numéro de commande / Heure]
[Payé] (si C&C)
------------------------------
[Article] x[Qté]
  Base: [...]
  Proteins: [...]
  Extra proteins: [...]
  Garnishes: [...]
  Toppings: [...]
  Sauces: [...]

------------------------------
Comments
[Instructions spéciales]
------------------------------
[Nom client]
[Téléphone client]
------------------------------
[cut]
```

### 4.5 Module Email transactionnel

**Déclenchement :** Uniquement pour les commandes Click & Collect
**Service :** Nodemailer via SMTP Gmail (port 465, TLS)
**Template :** HTML Handlebars responsive (mobile-first)
**Contenu :**
- Logo Pokey Bar
- Numéro de commande
- Nom du client
- Date et heure de retrait
- Montant total
- Bouton "Voir la commande" (lien vers `/confirmation/:id`)
- Pied de page avec adresse et téléphone du restaurant

---

## 5. Sécurité

### 5.1 Authentification & Autorisation

| Mécanisme | Technologie | Périmètre |
|-----------|-------------|-----------|
| **Auth0 OAuth2** | express-oauth2-jwt-bearer | Routes admin (`/api/users`, `/api/private/orders`) |
| **JWT Validation** | Auth0 JWKS | Vérification audience + issuer |
| **Suppression utilisateur** | Auth0 Management API | Suppression synchronisée Auth0 + MongoDB |

### 5.2 Sécurité des paiements (CRITIQUE)

| Mesure | Implémentation | Statut |
|--------|---------------|--------|
| **Stripe Checkout Sessions** | Paiement délégué à Stripe (PCI DSS compliant) | Actif |
| **Webhook signature** | `stripe.webhooks.constructEvent()` vérifie la signature HMAC | Actif |
| **Montant minimum** | Validation `totalPrice >= 0.50 EUR` côté serveur | Actif |
| **Création post-paiement** | La commande n'est créée qu'après réception du webhook `checkout.session.completed` | Actif |
| **CORS exclusion webhook** | Le endpoint webhook bypass CORS (Stripe ne peut pas envoyer les headers CORS) | Actif |
| **Raw body pour webhook** | `express.raw()` appliqué avant `express.json()` pour la vérification de signature | Actif |
| **Mode UI custom** | `ui_mode: "custom"` pour intégration embarquée du checkout | Actif |
| **Méthodes de paiement** | Limité à `card` uniquement | Actif |

**Flux de paiement sécurisé :**
```
Client              Frontend            Backend             Stripe
  │                    │                   │                   │
  ├──[Commande]───────▶│                   │                   │
  │                    ├──[POST /create-checkout-session]─────▶│
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

### 5.3 Sécurité réseau & API

| Mesure | Détail |
|--------|--------|
| **CORS** | Origin restreint à `CLIENT_URL`, credentials activés |
| **Headers autorisés** | Limités à `sessionId`, `Content-Type`, `Authorization` |
| **Méthodes HTTP** | Limitées à `GET, HEAD, PUT, PATCH, POST, DELETE` |
| **Variables d'environnement** | Secrets stockés dans `.env` (exclu du git) |
| **Validation MongoDB ID** | Vérification `ObjectID.isValid()` sur tous les paramètres ID |
| **Body size limit** | Limité à 10 MB |
| **Validation email** | Via `validator` (isEmail) |

### 5.4 Vulnérabilités identifiées et recommandations

| Risque | Niveau | Description | Recommandation |
|--------|--------|-------------|----------------|
| **Routes publiques sensibles** | ÉLEVÉ | `POST /api/order`, `DELETE /api/order/:id`, `PUT /api/order/:id/toggle` sont publiques | Protéger ces routes par auth ou rate limiting |
| **Routes menu non protégées** | MOYEN | CRUD menu (`POST/PUT/DELETE /api/item`) accessible sans auth | Ajouter `checkJwt` sur les routes d'écriture |
| **Routes table non protégées** | MOYEN | `POST /api/table`, `PUT /api/table/:id/toggle` publiques | Protéger par auth admin |
| **Routes food/allergen non protégées** | MOYEN | CRUD complet public | Protéger par auth admin |
| **Pas de rate limiting** | MOYEN | Aucune protection contre le brute force ou le spam | Ajouter `express-rate-limit` |
| **Pas de validation d'input** | MOYEN | Pas de sanitization des données entrantes (XSS, injection) | Ajouter `express-validator` ou `joi` |
| **Credentials DB dans le code** | ÉLEVÉ | Le host MongoDB est en dur dans `config/db.js` | Déplacer l'URL complète dans `.env` |
| **Pas de HTTPS forcé** | MOYEN | Pas de redirection HTTP→HTTPS | Ajouter un middleware ou configurer au niveau hébergeur |
| **Stripe beta API** | FAIBLE | Utilisation d'une API version beta Stripe | Migrer vers une version stable |
| **Pas de logging structuré** | FAIBLE | `console.log/error` uniquement | Implémenter pino ou winston |
| **Données client non chiffrées** | MOYEN | `clientData` (nom, email, tel) stocké en clair en base | Envisager le chiffrement au repos |

---

## 6. API Endpoints - Récapitulatif complet

### Routes publiques (sans auth)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/item` | Lister tous les articles du menu |
| `GET` | `/api/item/details` | Lister les catégories de menu |
| `GET` | `/api/item/custom/:category` | Options de personnalisation par catégorie |
| `GET` | `/api/item/:id` | Détail d'un article |
| `POST` | `/api/item` | Créer un article |
| `POST` | `/api/item/details` | Créer une catégorie |
| `POST` | `/api/item/custom` | Créer une option custom |
| `PUT` | `/api/item/:id` | Modifier un article |
| `DELETE` | `/api/item/:id` | Supprimer un article |
| `GET` | `/api/order/confirmed/:id` | Consulter une commande confirmée (sans clientData) |
| `POST` | `/api/order` | Créer une commande |
| `DELETE` | `/api/order/:id` | Supprimer une commande |
| `PUT` | `/api/order/:id/toggle` | Archiver/désarchiver |
| `POST` | `/api/order/print-order` | Imprimer un ticket |
| `GET` | `/api/table` | Lister les tables |
| `GET` | `/api/table/:tableNumber` | Détail d'une table |
| `POST` | `/api/table` | Créer une table |
| `PUT` | `/api/table/:id/toggle` | Ouvrir/fermer une table |
| `GET` | `/api/allergen` | Lister les allergènes |
| `POST` | `/api/allergen` | Créer un allergène |
| `DELETE` | `/api/allergen/:id` | Supprimer un allergène |
| `GET` | `/api/food` | Lister les aliments |
| `GET` | `/api/food/:id` | Détail d'un aliment |
| `POST` | `/api/food` | Créer un aliment |
| `PUT` | `/api/food/:id` | Modifier les allergènes d'un aliment |
| `DELETE` | `/api/food` | Supprimer des aliments (batch) |
| `POST` | `/api/checkout/create-checkout-session` | Créer une session Stripe |
| `POST` | `/api/checkout/webhook` | Webhook Stripe |

### Routes privées (auth JWT Auth0 requise)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/users` | Lister tous les utilisateurs |
| `GET` | `/api/users/:email` | Info utilisateur par email |
| `POST` | `/api/users` | Créer un utilisateur |
| `PUT` | `/api/users/:id` | Modifier un utilisateur |
| `DELETE` | `/api/users/:id/:auth0Id` | Supprimer (Auth0 + DB) |
| `GET` | `/api/private/orders` | Toutes les commandes |
| `GET` | `/api/private/orders/:id` | Détail commande |
| `GET` | `/api/private/orders/history/:userId` | Historique par utilisateur |
| `GET` | `/api/private/orders/tables/:tableNumber` | Commandes par table |

---

## 7. Variables d'environnement requises

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PORT` | Port du serveur | `5001` |
| `CLIENT_URL` | URL du frontend React | `https://pokeybar.fr` |
| `DB_USER_PASS` | Mot de passe MongoDB Atlas | `****` |
| `PRINTER_HOST` | IP de l'imprimante thermique | `192.168.1.100` |
| `PRINTER_PORT` | Port de l'imprimante | `9100` |
| `AUTH0_DOMAIN` | Domaine Auth0 | `xxx.eu.auth0.com` |
| `AUTH0_CLIENT_ID` | Client ID Auth0 | `****` |
| `AUTH0_CLIENT_SECRET` | Client Secret Auth0 | `****` |
| `AUTH0_AUDIENCE` | Audience API Auth0 | `https://api.pokeybar.fr` |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | `sk_live_****` |
| `STRIPE_WEBHOOK_SECRET_KEY` | Secret du webhook Stripe | `whsec_****` |
| `GMAIL_ACCOUNT` | Compte Gmail pour les emails | `pokeybar@gmail.com` |
| `GMAIL_NODEMAILER_PASSWORD` | App password Gmail | `****` |

---

## 8. Contraintes & Exigences non-fonctionnelles

### 8.1 Performance
- Temps de réponse API < 500ms
- Impression du ticket < 3 secondes après confirmation paiement
- Support de la charge en période de rush (midi/soir)

### 8.2 Disponibilité
- Application disponible 7j/7 pendant les heures d'ouverture
- Hébergement Hostinger avec Node.js v20 LTS
- MongoDB Atlas (cloud) pour la haute disponibilité de la base

### 8.3 Compatibilité
- Mobile-first (smartphones des clients)
- Navigateurs modernes (Chrome, Safari, Firefox)
- Node.js 18-20 (contrainte `express-oauth2-jwt-bearer`)

### 8.4 Réglementation
- Conformité PCI DSS via Stripe (aucune donnée bancaire ne transite par le serveur)
- RGPD : consentement marketing (`shouldGiveInformation`), droit à la suppression (endpoint delete user)
- Allergènes : traçabilité à 3 niveaux (non/trace/oui) conforme à la réglementation européenne
