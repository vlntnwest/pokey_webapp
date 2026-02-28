# Backend V2 — Spécification technique pour l'agent frontend

> Source de vérité pour la refonte frontend Next.js + shadcn/ui + Tailwind CSS.
> Généré à partir du code source backend le 2026-02-28.

---

<api_v2_overview>

## Architecture globale

Le backend est une API REST **Express.js** (Node.js v20+) connectée à **PostgreSQL** via **Prisma ORM**, hébergée sur **Supabase**.

### Changements structurants par rapport à la v1

1. **Authentification Supabase-native** : Le signup/login ne passe plus par le backend. L'authentification est entièrement gérée côté client via le SDK Supabase. Le backend ne fait que **valider le JWT** reçu dans le header `Authorization`.

2. **Modèle multi-tenant restaurant-centric** : Chaque ressource (menu, commandes, membres, stats, promos) est scopée à un `restaurantId`. L'utilisateur n'a pas de "panier" ou de "session" stockée côté serveur — tout est stateless.

3. **Système de rôles RBAC** : `OWNER > ADMIN > STAFF`. Les permissions sont vérifiées par middleware sur chaque route protégée. Le frontend ne doit jamais exposer une UI d'action si le rôle de l'utilisateur ne le permet pas.

4. **Options de produits découplées** : Les `OptionGroup` sont des entités au niveau restaurant, liées aux produits via une table de jonction `ProductOptionGroup`. Chaque groupe contient des `OptionChoice` avec des modificateurs de prix.

5. **Paiement dual-mode** : Stripe Connect pour les restaurants configurés (avec `stripeAccountId`), sinon fallback automatique vers un paiement sur place (`PENDING_ON_SITE_PAYMENT`).

6. **Temps réel via SSE** : Les notifications cuisine (nouvelle commande, changement de statut) passent par Server-Sent Events, pas WebSocket.

7. **Cache Redis optionnel** : Le menu est caché (TTL 5 min) quand Redis est configuré. L'invalidation est automatique à chaque mutation du menu.

8. **Rate limiting** :
   - Global : 100 req / 15 min / IP
   - Auth : 15 req / 15 min / IP
   - Payment : 10 req / 15 min / IP
   - Localhost : exempt (développement)

### Préfixes d'URL

Toutes les routes sont montées sur **deux préfixes** interchangeables :
- `/api/...`
- `/api/v1/...`

Utiliser `/api/v1` pour la clarté dans le nouveau frontend.

### Format de réponse uniforme

```
Succès :     { data: <object | array> }
Succès msg : { message: "..." }
Paginé :     { data: [...], pagination: { page, limit, total, totalPages } }
Erreur :     { error: "...", details?: [{ field, message }] }
```

### Codes HTTP utilisés

| Code | Signification |
|------|---------------|
| 200  | Succès (lecture, mise à jour, suppression) |
| 201  | Création réussie |
| 400  | Validation échouée / données invalides / restaurant fermé |
| 401  | Non authentifié / token invalide |
| 403  | Accès refusé (rôle insuffisant) |
| 404  | Ressource introuvable |
| 409  | Conflit (doublon, déjà membre) |
| 429  | Rate limit atteint |
| 500  | Erreur interne |

</api_v2_overview>

---

<auth_and_state>

## Authentification & gestion de l'état

### Flux d'authentification

```
1. Frontend : Supabase SDK → signup / login → obtient un JWT (access_token)
2. Frontend : Envoie le JWT dans chaque requête API
     Authorization: Bearer <access_token>
3. Backend  : middleware checkAuth → supabase.auth.getUser(token)
4. Backend  : Charge le User depuis la DB avec ses restaurantMembers (inclut les restaurants)
5. Backend  : Injecte req.user = { id, email, fullName, phone, restaurantMembers: [...] }
```

### Structure de `req.user` (après auth middleware)

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "Jean Dupont",
  "phone": "06 12 34 56 78",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": null,
  "restaurantMembers": [
    {
      "id": "uuid",
      "restaurantId": "uuid",
      "userId": "uuid",
      "role": "OWNER",
      "createdAt": "...",
      "updatedAt": null,
      "restaurant": {
        "id": "uuid",
        "name": "Mon Restaurant",
        "address": "...",
        "zipCode": "75001",
        "city": "Paris",
        "phone": "...",
        "email": "...",
        "imageUrl": "...",
        "stripeAccountId": "acct_xxx",
        "createdAt": "...",
        "updatedAt": null
      }
    }
  ]
}
```

### Rôles et permissions

| Rôle    | Peut faire |
|---------|------------|
| OWNER   | Tout (CRUD restaurant, gestion membres, invitations, suppression restaurant) |
| ADMIN   | CRUD menu, stats, promo codes, opening hours, upload, gestion commandes |
| STAFF   | Lecture commandes, stream SSE, mise à jour statut commandes |

Le middleware de rôle vérifie le tableau `restaurantMembers` de l'utilisateur pour le `restaurantId` de la requête.

### Pas de session côté serveur

- Aucun cookie de session backend. Les cookies sont parsés (`cookie-parser`) mais non utilisés pour l'auth.
- L'état utilisateur (restaurants, rôles) est rechargé à chaque requête authentifiée.
- Le frontend doit stocker le token Supabase et les infos utilisateur localement (Supabase gère déjà le refresh token).

### CORS

```
origin: process.env.CLIENT_URL    (une seule origin autorisée)
credentials: true
allowedHeaders: sessionId, Content-Type, Authorization
methods: GET, HEAD, PUT, PATCH, POST, DELETE
```

</auth_and_state>

---

<endpoints_documentation>

## Documentation exhaustive des endpoints

### Convention de notation

- `[PUBLIC]` : Aucune authentification requise
- `[AUTH]` : Token JWT requis
- `[STAFF+]` : Token JWT + rôle STAFF, ADMIN ou OWNER
- `[ADMIN+]` : Token JWT + rôle ADMIN ou OWNER
- `[OWNER]` : Token JWT + rôle OWNER uniquement

---

### 1. USER (`/api/v1/user`)

Rate limit : 15 req / 15 min (authLimiter)

#### `GET /api/v1/user/me` [AUTH]

Récupère le profil de l'utilisateur connecté.

**Réponse 200 :**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Jean Dupont",
    "phone": "06 12 34 56 78",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": null
  }
}
```

> Note : Ce endpoint retourne les champs User **sans** `restaurantMembers`. L'auth middleware charge déjà les memberships mais ce controller ne les expose pas.

#### `PUT /api/v1/user/me` [AUTH]

Met à jour le profil utilisateur.

**Body (JSON) — tous les champs optionnels :**
```json
{
  "fullName": "string (1-50 chars, optionnel)",
  "phone": "string (format FR: 06 12 34 56 78, optionnel)"
}
```

**Validation phone :** Regex `^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$`

**Réponse 200 :** `{ "data": { <User> } }`

#### `DELETE /api/v1/user/me` [AUTH]

Supprime le compte utilisateur (via Supabase Admin API — supprime aussi de la table `users` en cascade).

**Réponse 200 :** `{ "message": "User deleted successfully" }`

---

### 2. RESTAURANTS (`/api/v1/restaurants`)

#### `GET /api/v1/restaurants/:restaurantId` [PUBLIC]

**Réponse 200 :**
```json
{
  "data": {
    "id": "uuid",
    "name": "string",
    "address": "string",
    "zipCode": "string (5 digits)",
    "city": "string",
    "phone": "string | null",
    "email": "string | null",
    "imageUrl": "string | null",
    "stripeAccountId": "string | null",
    "createdAt": "ISO 8601",
    "updatedAt": "ISO 8601 | null"
  }
}
```

#### `POST /api/v1/restaurants` [AUTH]

Crée un restaurant et assigne l'utilisateur connecté comme OWNER.

**Body (JSON) :**
```json
{
  "name": "string (1-50, requis)",
  "address": "string (1-255, requis)",
  "zipCode": "string (5 digits exactement, requis)",
  "city": "string (1-50, requis)",
  "phone": "string (format FR, requis)",
  "email": "string (email, optionnel)",
  "imageUrl": "string (URL, optionnel)"
}
```

**Réponse 201 :** `{ "data": { <Restaurant> } }`

#### `PUT /api/v1/restaurants/:restaurantId` [ADMIN+]

Mise à jour partielle — tous les champs du schema `restaurantSchema` sont acceptés en mode `.partial()`.

**Body (JSON) — tous optionnels :**
```json
{
  "name": "string",
  "address": "string",
  "zipCode": "string",
  "city": "string",
  "phone": "string",
  "email": "string",
  "imageUrl": "string"
}
```

**Réponse 200 :** `{ "data": { <Restaurant> } }`
**Erreur 400 :** `{ "error": "No data" }` si body vide.

#### `DELETE /api/v1/restaurants/:restaurantId` [OWNER]

**Réponse 200 :** `{ "message": "Restaurant deleted successfully" }`

---

### 3. MENU (`/api/v1/menu`)

Note : Les routes menu sont montées sur le routeur `/api/v1/menu` mais les paths internes commencent par `/restaurants/:restaurantId/...`.
Donc l'URL complète est : `/api/v1/menu/restaurants/:restaurantId/...`

#### 3.1 Menu complet

##### `GET /api/v1/menu/restaurants/:restaurantId/menu` [PUBLIC]

Retourne le menu structuré par catégories, avec les produits imbriqués et leurs option groups.
**Mis en cache Redis** (clé `menu:<restaurantId>`, TTL 5 min). Invalidé à chaque mutation menu.

**Réponse 200 :**
```json
{
  "data": [
    {
      "id": "uuid",
      "restaurantId": "uuid",
      "name": "Pokés",
      "subHeading": "Nos pokés signatures",
      "displayOrder": 1,
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601 | null",
      "productCategories": [
        {
          "id": "uuid",
          "productId": "uuid",
          "categorieId": "uuid",
          "createdAt": "...",
          "updatedAt": "...",
          "product": {
            "id": "uuid",
            "restaurantId": "uuid",
            "name": "Saumon Avocado",
            "description": "Riz, saumon, avocat, ...",
            "imageUrl": "https://...",
            "price": "13.50",
            "tags": ["populaire", "sans-gluten"],
            "discount": "0",
            "isAvailable": true,
            "displayOrder": 1,
            "createdAt": "...",
            "updatedAt": "...",
            "optionGroups": [
              {
                "id": "uuid",
                "restaurantId": "uuid",
                "name": "Taille",
                "hasMultiple": false,
                "isRequired": true,
                "minQuantity": 1,
                "maxQuantity": 1,
                "displayOrder": 0,
                "createdAt": "...",
                "updatedAt": "...",
                "optionChoices": [
                  {
                    "id": "uuid",
                    "optionGroupId": "uuid",
                    "name": "Regular",
                    "priceModifier": "0",
                    "displayOrder": 0,
                    "createdAt": "...",
                    "updatedAt": "..."
                  },
                  {
                    "id": "uuid",
                    "optionGroupId": "uuid",
                    "name": "Large (+3€)",
                    "priceModifier": "3.00",
                    "displayOrder": 1,
                    "createdAt": "...",
                    "updatedAt": "..."
                  }
                ]
              }
            ]
          }
        }
      ]
    }
  ]
}
```

> **IMPORTANT** : `price`, `priceModifier` et `discount` sont retournés comme **strings** (type Prisma `Decimal`). Le frontend doit les parser avec `parseFloat()`.

> **IMPORTANT** : Le champ `optionGroups` est un tableau aplati (flattenOptionGroups). La réponse brute Prisma contient `productOptionGroups[].optionGroup` mais le contrôleur le transforme en `optionGroups[]` directement sur le produit.

#### 3.2 Recherche de produits

##### `GET /api/v1/menu/restaurants/:restaurantId/products` [PUBLIC]

**Query params :**
- `q` (string, optionnel) : Recherche insensible à la casse dans `name` et `description`
- `isAvailable` (string "true"|"false", optionnel) : Filtre disponibilité

**Réponse 200 :** `{ "data": [ <Product avec optionGroups aplatis> ] }`

#### 3.3 Détail produit

##### `GET /api/v1/menu/restaurants/:restaurantId/products/:productId` [PUBLIC]

**Réponse 200 :**
```json
{
  "data": {
    "id": "uuid",
    "restaurantId": "uuid",
    "name": "string",
    "description": "string | null",
    "imageUrl": "string | null",
    "price": "string (Decimal)",
    "tags": ["string"],
    "discount": "string (Decimal)",
    "isAvailable": true,
    "displayOrder": 0,
    "createdAt": "...",
    "updatedAt": "...",
    "productCategories": [
      {
        "id": "uuid",
        "productId": "uuid",
        "categorieId": "uuid",
        "createdAt": "...",
        "updatedAt": "...",
        "categorie": { "id": "uuid", "name": "string", "..." : "..." }
      }
    ],
    "optionGroups": [ "... (mêmes que dans getMenu)" ]
  }
}
```

#### 3.4 Catégories (CRUD)

##### `POST /api/v1/menu/restaurants/:restaurantId/categories` [ADMIN+]

**Body :**
```json
{
  "name": "string (1-50, requis)",
  "subHeading": "string (1-255, optionnel)",
  "displayOrder": "number (requis)"
}
```

**Réponse 201 :** `{ "data": { <Categorie> } }`

##### `PUT /api/v1/menu/restaurants/:restaurantId/categories/:categorieId` [ADMIN+]

**Body — tous optionnels :**
```json
{
  "name": "string (1-50)",
  "subHeading": "string (1-255)",
  "displayOrder": "number"
}
```

**Réponse 200 :** `{ "data": { <Categorie> } }`

##### `DELETE /api/v1/menu/restaurants/:restaurantId/categories/:categorieId` [ADMIN+]

**Réponse 200 :** `{ "message": "Product categorie deleted" }`

#### 3.5 Produits (CRUD)

##### `POST /api/v1/menu/restaurants/:restaurantId/products` [ADMIN+]

**Body :**
```json
{
  "name": "string (1-50, requis)",
  "description": "string (1-255, requis)",
  "imageUrl": "string (URL, requis)",
  "price": "number (requis)",
  "tags": ["string"] ,
  "discount": "number (défaut: 0)",
  "isAvailable": "boolean (défaut: true)",
  "displayOrder": "number (défaut: 999)",
  "categorieId": "uuid (requis)"
}
```

> Le produit est créé **et** lié à la catégorie dans une transaction.

**Réponse 201 :** `{ "data": { <Product> } }`

##### `PUT /api/v1/menu/restaurants/:restaurantId/products/:productId` [ADMIN+]

**Body — tous optionnels :**
```json
{
  "name": "string",
  "description": "string",
  "imageUrl": "string (URL)",
  "price": "number",
  "tags": ["string"],
  "discount": "number",
  "isAvailable": "boolean",
  "displayOrder": "number",
  "categorieId": "uuid"
}
```

> Si `categorieId` est fourni et différent de la catégorie actuelle, une nouvelle liaison est créée (sans supprimer l'ancienne).

**Réponse 200 :** `{ "data": { <Product> } }`

##### `DELETE /api/v1/menu/restaurants/:restaurantId/products/:productId` [ADMIN+]

**Réponse 200 :** `{ "message": "Product deleted" }`

#### 3.6 Option Groups (CRUD)

##### `GET /api/v1/menu/restaurants/:restaurantId/option-groups` [ADMIN+]

Liste tous les option groups du restaurant avec leurs choices.

**Réponse 200 :**
```json
{
  "data": [
    {
      "id": "uuid",
      "restaurantId": "uuid",
      "name": "Taille",
      "hasMultiple": false,
      "isRequired": true,
      "minQuantity": 1,
      "maxQuantity": 1,
      "displayOrder": 0,
      "createdAt": "...",
      "updatedAt": "...",
      "optionChoices": [
        {
          "id": "uuid",
          "optionGroupId": "uuid",
          "name": "Regular",
          "priceModifier": "0",
          "displayOrder": 0,
          "createdAt": "...",
          "updatedAt": "..."
        }
      ]
    }
  ]
}
```

##### `POST /api/v1/menu/restaurants/:restaurantId/option-groups` [ADMIN+]

**Body :**
```json
{
  "name": "string (1-50, requis)",
  "hasMultiple": "boolean (défaut: false)",
  "isRequired": "boolean (défaut: false)",
  "minQuantity": "number (défaut: 1)",
  "maxQuantity": "number (défaut: 1)",
  "displayOrder": "number int (défaut: 0)",
  "choices": [
    {
      "name": "string (1-50, requis)",
      "priceModifier": "number (défaut: 0)",
      "displayOrder": "number int (défaut: 0)"
    }
  ]
}
```

> `choices` est optionnel. Si fourni, les choices sont créées dans la même transaction.

**Réponse 201 :** `{ "data": { <OptionGroup avec optionChoices> } }`

##### `PUT /api/v1/menu/restaurants/:restaurantId/option-groups/:optionGroupId` [ADMIN+]

**Body — tous optionnels :**
```json
{
  "name": "string",
  "hasMultiple": "boolean",
  "isRequired": "boolean",
  "minQuantity": "number",
  "maxQuantity": "number",
  "displayOrder": "number int"
}
```

**Réponse 200 :** `{ "data": { <OptionGroup avec optionChoices> } }`

##### `DELETE /api/v1/menu/restaurants/:restaurantId/option-groups/:optionGroupId` [ADMIN+]

**Réponse 200 :** `{ "message": "Option group deleted" }`

#### 3.7 Liaison Product ↔ OptionGroup

##### `POST /api/v1/menu/restaurants/:restaurantId/products/:productId/option-groups` [ADMIN+]

Lie un ou plusieurs option groups à un produit.

**Body :**
```json
{
  "optionGroupIds": ["uuid", "uuid"]
}
```

**Réponse 200 :** `{ "message": "Option groups linked" }`

##### `DELETE /api/v1/menu/restaurants/:restaurantId/products/:productId/option-groups/:optionGroupId` [ADMIN+]

**Réponse 200 :** `{ "message": "Option group unlinked" }`

#### 3.8 Option Choices (CRUD)

##### `POST /api/v1/menu/restaurants/:restaurantId/option-groups/:optionGroupId/option-choices` [ADMIN+]

**Body :**
```json
{
  "name": "string (1-50, requis)",
  "priceModifier": "number (défaut: 0)",
  "displayOrder": "number int (défaut: 0)"
}
```

**Réponse 201 :** `{ "data": { <OptionChoice> } }`

##### `POST /api/v1/menu/restaurants/:restaurantId/option-groups/:optionGroupId/option-choices/bulk` [ADMIN+]

**Body (tableau à la racine) :**
```json
[
  { "name": "Regular", "priceModifier": 0, "displayOrder": 0 },
  { "name": "Large", "priceModifier": 3, "displayOrder": 1 }
]
```

> Minimum 1 élément. Le body est un **tableau JSON**, pas un objet.

**Réponse 201 :** `{ "data": [ <tous les OptionChoice du groupe> ] }`

##### `PUT /api/v1/menu/restaurants/:restaurantId/option-choices/:optionChoiceId` [ADMIN+]

**Body — tous optionnels :**
```json
{
  "name": "string",
  "priceModifier": "number",
  "displayOrder": "number int"
}
```

**Réponse 200 :** `{ "data": { <OptionChoice> } }`

##### `DELETE /api/v1/menu/restaurants/:restaurantId/option-choices/:optionChoiceId` [ADMIN+]

**Réponse 200 :** `{ "message": "Option choice deleted" }`

---

### 4. COMMANDES (`/api/v1/restaurants/:restaurantId/orders`)

#### `POST /api/v1/restaurants/:restaurantId/orders` [PUBLIC]

Crée une commande directe (sans paiement Stripe). Vérifie que le restaurant est ouvert.

**Body :**
```json
{
  "fullName": "string (1-50, optionnel)",
  "phone": "string (format FR, optionnel)",
  "email": "string (email, optionnel)",
  "items": [
    {
      "productId": "uuid (requis)",
      "quantity": "number int >= 1 (requis)",
      "optionChoiceIds": ["uuid"]
    }
  ],
  "promoCode": "string (1-50, optionnel)"
}
```

> `items` : minimum 1 élément. `optionChoiceIds` : défaut `[]`.

**Logique serveur :**
1. Vérifie les horaires d'ouverture
2. Vérifie l'existence de tous les produits
3. Charge les option choices
4. Calcule le `totalPrice` = Σ (product.price + Σ optionChoice.priceModifier) × quantity
5. Applique le promo code si fourni (PERCENTAGE ou FIXED)
6. Crée Order + OrderProducts + OrderProductOptions en transaction
7. Envoie un email de confirmation (fire-and-forget)
8. Broadcast SSE `new_order`

**Réponse 201 :**
```json
{
  "data": {
    "id": "uuid",
    "restaurantId": "uuid",
    "userId": null,
    "fullName": "string | null",
    "phone": "string | null",
    "email": "string | null",
    "status": "PENDING",
    "totalPrice": "string (Decimal)",
    "stripePaymentIntentId": null,
    "createdAt": "ISO 8601",
    "updatedAt": "...",
    "orderProducts": [
      {
        "id": "uuid",
        "orderId": "uuid",
        "productId": "uuid",
        "quantity": 2,
        "product": { "... Product complet ..." },
        "orderProductOptions": [
          {
            "id": "uuid",
            "orderProductId": "uuid",
            "optionChoiceId": "uuid",
            "optionChoice": { "... OptionChoice complet ..." }
          }
        ]
      }
    ]
  }
}
```

**Erreurs spécifiques :**
- `400` : `"Restaurant is currently closed"`
- `400` : `"Invalid or inactive promo code"`
- `400` : `"Promo code has expired"`
- `400` : `"Promo code usage limit reached"`
- `400` : `"Minimum order amount of X required"`
- `404` : `"One or more products not found"`

#### `GET /api/v1/restaurants/:restaurantId/orders` [STAFF+]

Liste paginée des commandes.

**Query params :**
- `page` (number, défaut: 1, min: 1)
- `limit` (number, défaut: 20, min: 1, max: 100)

**Réponse 200 :**
```json
{
  "data": [ "... tableau d'Order avec orderProducts imbriqués ..." ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

#### `GET /api/v1/restaurants/:restaurantId/orders/:orderId` [STAFF+]

**Réponse 200 :** `{ "data": { <Order avec orderProducts> } }`

#### `PATCH /api/v1/restaurants/:restaurantId/orders/:orderId/status` [STAFF+]

**Body :**
```json
{
  "status": "PENDING | IN_PROGRESS | COMPLETED | DELIVERED | CANCELLED | PENDING_ON_SITE_PAYMENT"
}
```

> Broadcast SSE `order_status` avec `{ orderId, status }`.

**Réponse 200 :** `{ "data": { <Order mis à jour (sans orderProducts)> } }`

#### `GET /api/v1/restaurants/:restaurantId/orders/stream` [STAFF+]

**Server-Sent Events (SSE)** — connexion persistante.

**Headers de réponse :**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Événements émis :**

| Event | Trigger | Data |
|-------|---------|------|
| `connected` | À la connexion | `{ "restaurantId": "uuid" }` |
| `new_order` | Nouvelle commande créée | `{ <Order complet avec orderProducts> }` |
| `order_status` | Statut mis à jour | `{ "orderId": "uuid", "status": "IN_PROGRESS" }` |

**Format SSE :**
```
event: new_order
data: {"id":"uuid","status":"PENDING",...}

event: order_status
data: {"orderId":"uuid","status":"COMPLETED"}
```

---

### 5. CHECKOUT / PAIEMENT (`/api/v1/checkout`)

Rate limit : 10 req / 15 min (paymentLimiter). Le webhook est exempt.

#### `POST /api/v1/checkout/create-session` [PUBLIC]

Crée une session de paiement. Deux comportements selon la configuration du restaurant :

**Body :**
```json
{
  "restaurantId": "uuid (requis)",
  "fullName": "string (1-50, optionnel)",
  "phone": "string (format FR, optionnel)",
  "email": "string (email, optionnel)",
  "items": [
    {
      "productId": "uuid (requis)",
      "quantity": "number int >= 1 (requis)",
      "optionChoiceIds": ["uuid"]
    }
  ]
}
```

**Cas 1 : Restaurant avec `stripeAccountId`** → Session Stripe Connect

**Réponse 201 :**
```json
{
  "data": {
    "sessionId": "cs_xxx",
    "url": "https://checkout.stripe.com/..."
  }
}
```

> Le frontend doit **rediriger** l'utilisateur vers `data.url`.
> Success URL : `{CLIENT_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`
> Cancel URL : `{CLIENT_URL}/order/cancel`
> Commission plateforme : 5% prélevé via `application_fee_amount`.

**Cas 2 : Restaurant sans `stripeAccountId`** → Commande sur place

**Réponse 201 :**
```json
{
  "data": {
    "order": { "... <Order complet avec orderProducts> ..." },
    "paymentMethod": "on_site"
  }
}
```

> Le frontend doit afficher une confirmation de commande au lieu de rediriger vers Stripe.
> Le statut initial est `PENDING_ON_SITE_PAYMENT`.

#### `POST /api/v1/checkout/webhook` [INTERNE — Stripe uniquement]

Reçoit les événements Stripe. Le body est en `raw` (pas JSON), configuré dans `app.js`.
- Gère uniquement `checkout.session.completed`
- Crée l'Order en base à partir des metadata de la session

> Le frontend n'appelle jamais ce endpoint.

#### `POST /api/v1/checkout/restaurants/:restaurantId/orders/:orderId/refund` [ADMIN+]

Rembourse une commande via Stripe et passe le statut à `CANCELLED`.

**Réponse 200 :**
```json
{
  "data": {
    "order": { "... <Order avec status CANCELLED> ..." },
    "refund": { "id": "re_xxx", "status": "succeeded" }
  }
}
```

**Erreurs spécifiques :**
- `400` : `"No Stripe payment associated with this order"`
- `409` : `"Order is already cancelled"`

---

### 6. MEMBRES (`/api/v1/restaurants/:restaurantId/members`)

#### `GET /api/v1/restaurants/:restaurantId/members` [ADMIN+]

Liste paginée des membres du restaurant.

**Query params :** `page` (défaut 1), `limit` (défaut 20, max 100)

**Réponse 200 :**
```json
{
  "data": [
    {
      "id": "uuid (member id)",
      "restaurantId": "uuid",
      "userId": "uuid",
      "role": "ADMIN",
      "createdAt": "...",
      "updatedAt": "...",
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "fullName": "Marie Martin",
        "phone": "06 98 76 54 32"
      }
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 3, "totalPages": 1 }
}
```

#### `POST /api/v1/restaurants/:restaurantId/members/invite` [OWNER]

Envoie un email d'invitation.

**Body :**
```json
{
  "email": "string (email, requis)",
  "role": "ADMIN | STAFF (défaut: STAFF)"
}
```

> Génère un token d'invitation valide 7 jours. L'email contient un lien vers `{CLIENT_URL}/invite/accept?token={token}`.
> Si l'utilisateur est déjà membre : `409` `"User is already a member"`.

**Réponse 201 :** `{ "message": "Invitation sent" }`

#### `PATCH /api/v1/restaurants/:restaurantId/members/:memberId/role` [OWNER]

**Body :**
```json
{
  "role": "ADMIN | STAFF"
}
```

> Le rôle OWNER ne peut pas être modifié : `400` `"Cannot change the role of the owner"`.

**Réponse 200 :** `{ "data": { <RestaurantMember> } }`

#### `DELETE /api/v1/restaurants/:restaurantId/members/:memberId` [OWNER]

> Le owner ne peut pas se supprimer : `400` `"Cannot remove the owner"`.

**Réponse 200 :** `{ "message": "Member removed successfully" }`

#### `POST /api/v1/members/accept` [AUTH]

Accepte une invitation par token.

**Body :**
```json
{
  "token": "string (requis)"
}
```

> L'email du token doit correspondre à l'email de l'utilisateur connecté, sinon `403`.
> Si déjà membre : `409`.
> Token expiré : `400`.

**Réponse 201 :** `{ "data": { <RestaurantMember créé> } }`

---

### 7. STATISTIQUES (`/api/v1/restaurants/:restaurantId/stats`)

#### `GET /api/v1/restaurants/:restaurantId/stats` [ADMIN+]

**Query params :**
- `period` : `"day" | "week" | "month"` (défaut: `"month"`)

**Réponse 200 :**
```json
{
  "data": {
    "period": "month",
    "since": "2025-06-01T00:00:00.000Z",
    "totalOrders": 42,
    "revenue": 1234.56,
    "popularProducts": [
      { "name": "Saumon Avocado", "count": 89 },
      { "name": "Thon Mangue", "count": 67 },
      { "name": "Chicken Teriyaki", "count": 45 },
      { "name": "Edamame", "count": 34 },
      { "name": "Gyoza", "count": 28 }
    ]
  }
}
```

> Exclut les commandes `CANCELLED`. Top 5 produits par quantité vendue.

---

### 8. CODES PROMO (`/api/v1/restaurants/:restaurantId/promo-codes`)

#### `POST /api/v1/restaurants/:restaurantId/promo-codes/validate` [PUBLIC]

Valide un code promo et retourne la réduction calculée.

**Body :**
```json
{
  "code": "string (requis)",
  "orderTotal": "number > 0 (requis)"
}
```

**Réponse 200 :**
```json
{
  "data": {
    "code": "SUMMER20",
    "discountType": "PERCENTAGE",
    "discountValue": 20,
    "discountAmount": 5.40,
    "finalTotal": 21.60
  }
}
```

**Erreurs :** `404` (code introuvable), `400` (inactif, expiré, limite atteinte, montant minimum non atteint).

#### `GET /api/v1/restaurants/:restaurantId/promo-codes` [ADMIN+]

**Réponse 200 :**
```json
{
  "data": [
    {
      "id": "uuid",
      "restaurantId": "uuid",
      "code": "SUMMER20",
      "discountType": "PERCENTAGE",
      "discountValue": "20.00",
      "minOrderAmount": "15.00",
      "maxUses": 100,
      "usedCount": 23,
      "expiresAt": "2025-09-01T00:00:00.000Z",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### `POST /api/v1/restaurants/:restaurantId/promo-codes` [ADMIN+]

**Body :**
```json
{
  "code": "string (1-50, requis)",
  "discountType": "PERCENTAGE | FIXED (requis)",
  "discountValue": "number > 0 (requis)",
  "minOrderAmount": "number > 0 (optionnel)",
  "maxUses": "number int > 0 (optionnel)",
  "expiresAt": "ISO 8601 datetime (optionnel)",
  "isActive": "boolean (défaut: true)"
}
```

> Le `code` est stocké en **UPPERCASE** automatiquement.

**Réponse 201 :** `{ "data": { <PromoCode> } }`

#### `DELETE /api/v1/restaurants/:restaurantId/promo-codes/:promoCodeId` [ADMIN+]

**Réponse 200 :** `{ "message": "Promo code deleted" }`

---

### 9. HORAIRES D'OUVERTURE (`/api/v1/restaurants/:restaurantId/opening-hours`)

#### `GET /api/v1/restaurants/:restaurantId/opening-hours` [PUBLIC]

**Réponse 200 :**
```json
{
  "data": [
    {
      "id": "uuid",
      "restaurantId": "uuid",
      "dayOfWeek": 1,
      "openTime": "11:00",
      "closeTime": "22:00",
      "order": 0,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

> `dayOfWeek` : 0=Dimanche, 1=Lundi, ..., 6=Samedi (convention JavaScript `Date.getDay()`).

#### `PUT /api/v1/restaurants/:restaurantId/opening-hours` [ADMIN+]

**Remplace TOUTES les plages horaires** (delete all + recreate).

**Body (tableau à la racine) :**
```json
[
  { "dayOfWeek": 1, "openTime": "11:00", "closeTime": "14:30", "order": 0 },
  { "dayOfWeek": 1, "openTime": "18:00", "closeTime": "22:00", "order": 1 },
  { "dayOfWeek": 2, "openTime": "11:00", "closeTime": "22:00", "order": 2 }
]
```

> Envoyer un tableau vide `[]` efface tous les horaires (restaurant toujours ouvert par défaut — la logique `isRestaurantOpen` retourne `true` si aucun horaire n'est défini).

**Réponse 200 :** `{ "data": [ <les nouveaux OpeningHour> ] }`

---

### 10. UPLOAD (`/api/v1/restaurants/:restaurantId/upload`)

#### `POST /api/v1/restaurants/:restaurantId/upload` [ADMIN+]

Upload d'image via **multipart/form-data**.

**Form field :** `image` (file)

**Contraintes :**
- Types MIME : `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Taille max : 5 MB
- Stockage : Supabase Storage, bucket `images`, chemin `restaurants/{restaurantId}/{timestamp}-{random}.{ext}`

**Réponse 201 :**
```json
{
  "data": {
    "url": "https://xxx.supabase.co/storage/v1/object/public/images/restaurants/uuid/123456-abc.jpg"
  }
}
```

> Utiliser cette URL comme valeur de `imageUrl` lors de la création/mise à jour de restaurant ou produit.

---

### 11. HEALTH CHECK

#### `GET /health` [PUBLIC]

**Réponse 200 :** `{ "status": "ok" }`

</endpoints_documentation>

---

<nextjs_migration_tips>

## Recommandations Next.js pour la migration frontend

### 1. Séparation Server Components vs Client Components

| Donnée / Feature | Recommandation | Raison |
|---|---|---|
| Page restaurant publique (`GET /restaurants/:id`) | **Server Component** | Données statiques, SEO-friendly |
| Menu complet (`GET /menu/restaurants/:id/menu`) | **Server Component** avec `revalidate` | Données publiques cachées côté backend (Redis 5 min), idéal pour ISR |
| Horaires d'ouverture (`GET /opening-hours`) | **Server Component** | Données publiques, rarement mutées |
| Recherche produits (`GET /products?q=...`) | **Client Component** | Interaction utilisateur dynamique (input search) |
| Gestion du panier | **Client Component** pur (state local) | Aucune API panier côté backend — tout est calculé côté client |
| Formulaire de commande | **Client Component** | Interactivité, validation, soumission |
| Dashboard admin (stats, commandes, membres) | **Client Component** ou Server Component avec streaming | Données protégées nécessitant le JWT |
| Stream SSE (cuisine) | **Client Component** exclusivement | Connexion persistante navigateur |

### 2. Stratégie de récupération de données

#### Server-side (Route Handlers ou Server Components)
```
// Pour les pages publiques — fetch directement côté serveur
// Le JWT n'est pas nécessaire pour les routes [PUBLIC]

fetch(`${API_URL}/api/v1/restaurants/${restaurantId}`, {
  next: { revalidate: 60 }  // ISR: revalidation toutes les 60 secondes
})
```

#### Client-side (pages admin/dashboard)
```
// Le JWT Supabase doit être envoyé — nécessite le contexte navigateur
// Utiliser un hook ou une lib comme SWR / TanStack Query

fetch(`${API_URL}/api/v1/restaurants/${restaurantId}/orders`, {
  headers: { Authorization: `Bearer ${session.access_token}` }
})
```

### 3. Authentification avec Supabase + Next.js

- Utiliser `@supabase/ssr` (pas `@supabase/auth-helpers-nextjs` qui est déprécié).
- Le signup/login/logout est géré par le SDK Supabase côté client.
- Le JWT (`session.access_token`) doit être transmis dans le header `Authorization: Bearer <token>` pour **toute** requête authentifiée vers le backend.
- Le backend ne set/lit **aucun cookie** d'auth — tout passe par le header.
- Pour les Server Components authentifiés : récupérer le token via les cookies Supabase (middleware Next.js) et le transmettre dans les fetch serveur.

### 4. Logique métier à déplacer du client vers le serveur

L'API v2 gère déjà côté backend :

| Logique | Ancien (client React) | Nouveau (API backend) |
|---------|----------------------|----------------------|
| Calcul du prix total | Client devait calculer | Backend calcule dans `createOrder` |
| Validation du promo code | Client validait localement | `POST /promo-codes/validate` retourne le montant exact |
| Vérification horaires d'ouverture | Client vérifiait | Backend refuse la commande si fermé |
| Vérification existence produits | Client ne vérifiait pas | Backend vérifie tous les `productId` |
| Application de la réduction | Client calculait | Backend applique et retourne le total final |

**Ce qui reste côté client :**
- Construction du panier (liste d'items avec `productId`, `quantity`, `optionChoiceIds`)
- Affichage d'un prix estimé (pré-calcul client pour UX) — le prix définitif vient du backend
- Navigation et gestion des vues
- Gestion de l'état Supabase Auth

### 5. SSE (Server-Sent Events) — Dashboard cuisine

```javascript
// Client Component uniquement
const evtSource = new EventSource(
  `${API_URL}/api/v1/restaurants/${restaurantId}/orders/stream`,
  // ATTENTION : EventSource natif ne supporte pas les headers custom.
  // Utiliser une lib comme 'eventsource-polyfill' ou 'fetch-event-source'
  // pour envoyer le Bearer token.
);

evtSource.addEventListener('new_order', (e) => {
  const order = JSON.parse(e.data);
  // Ajouter à la liste des commandes
});

evtSource.addEventListener('order_status', (e) => {
  const { orderId, status } = JSON.parse(e.data);
  // Mettre à jour le statut localement
});
```

> **IMPORTANT** : L'endpoint SSE nécessite l'authentification (`checkAuth` + `isStaff`). L'API native `EventSource` du navigateur ne supporte pas les headers custom. Utiliser `@microsoft/fetch-event-source` ou équivalent pour passer le `Authorization` header.

### 6. Upload d'images

L'upload utilise `multipart/form-data` avec le champ `image` :

```javascript
const formData = new FormData();
formData.append('image', file);

const response = await fetch(
  `${API_URL}/api/v1/restaurants/${restaurantId}/upload`,
  {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    // PAS de Content-Type — le navigateur le set automatiquement avec le boundary
    body: formData,
  }
);
const { data } = await response.json();
// data.url = URL publique de l'image uploadée
```

### 7. Gestion des erreurs — mapping standard

Toutes les erreurs suivent le format :
```json
{ "error": "message lisible", "details": [{ "field": "name", "message": "Required" }] }
```

Le champ `details` n'est présent que pour les erreurs de validation Zod (400).
Créer un helper centralisé :

```typescript
type ApiError = { error: string; details?: { field: string; message: string }[] };

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err: ApiError = await res.json();
    throw err;
  }
  return res.json();
}
```

### 8. Types Prisma Decimal → string

Les champs `price`, `discount`, `priceModifier`, `totalPrice`, `discountValue`, `minOrderAmount` sont retournés comme **strings** par Prisma (type `Decimal(10,2)`). Exemple : `"13.50"` et non `13.50`.

Le frontend doit systématiquement parser ces valeurs :
```typescript
const price = parseFloat(product.price);
```

### 9. Pages à créer (mapping routes → pages)

| Page Next.js | Endpoint(s) principal(aux) | Auth requise |
|---|---|---|
| `/[restaurantId]` | `GET /restaurants/:id`, `GET /opening-hours` | Non |
| `/[restaurantId]/menu` | `GET /menu/restaurants/:id/menu` | Non |
| `/[restaurantId]/menu/[productId]` | `GET /products/:productId` | Non |
| `/[restaurantId]/order` | `POST /orders`, `POST /checkout/create-session`, `POST /promo-codes/validate` | Non |
| `/order/success` | — (page statique, lit `session_id` query param) | Non |
| `/order/cancel` | — (page statique) | Non |
| `/invite/accept` | `POST /members/accept` (lit `token` query param) | Oui |
| `/dashboard` | `GET /user/me` | Oui |
| `/dashboard/[restaurantId]/orders` | `GET /orders`, `PATCH /orders/:id/status`, SSE stream | Oui (STAFF+) |
| `/dashboard/[restaurantId]/menu` | `GET /menu`, CRUD categories/products/options | Oui (ADMIN+) |
| `/dashboard/[restaurantId]/stats` | `GET /stats` | Oui (ADMIN+) |
| `/dashboard/[restaurantId]/promo-codes` | CRUD promo-codes | Oui (ADMIN+) |
| `/dashboard/[restaurantId]/members` | CRUD members, invite | Oui (ADMIN+ / OWNER) |
| `/dashboard/[restaurantId]/settings` | `PUT /restaurants/:id`, `PUT /opening-hours`, upload | Oui (ADMIN+) |

### 10. Variables d'environnement côté frontend

```env
NEXT_PUBLIC_API_URL=https://api.pokey.com    # URL du backend
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

</nextjs_migration_tips>
