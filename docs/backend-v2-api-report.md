# Rapport Technique — Backend v2 API (Source de vérité pour refonte Next.js)

> Généré après analyse exhaustive du code source : `app.js`, tous les `routes/*.js`, tous les `controllers/*.js`, `middleware/*.js`, `validators/schemas.js`, `prisma/schema.prisma`, `lib/supabase.js`.

---

```xml
<api_v2_overview>
```

## Résumé de la philosophie et des changements drastiques

### Stack technique réelle (v2)

| Couche | Technologie |
|--------|-------------|
| Runtime | Node.js v20+, CommonJS (`require`/`module.exports`) |
| Framework | Express.js v4 |
| Base de données | PostgreSQL via Supabase (schéma `public`) |
| ORM | Prisma v7 avec `@prisma/adapter-pg` |
| Authentification | **Supabase Auth** — JWT vérifié côté serveur |
| Validation | **Zod** — middleware centralisé, jamais dans les controllers |
| Paiement | **Stripe Connect** (avec fallback paiement sur place) |
| Upload | Supabase Storage (bucket `images`) |
| Email | Nodemailer (confirmation commande + invitations membres) |
| Monitoring | Sentry + Pino |

### Changements architecturaux majeurs par rapport à la v1 frontend

1. **Nouveau modèle de données : OptionGroups / OptionChoices**
   La v1 frontend n'avait probablement pas ce niveau d'options produit. En v2, les produits peuvent avoir des groupes d'options (ex: "Sauce", "Taille") chacun avec des choix (`OptionChoice`) ayant un `priceModifier`. C'est un changement structurel profond.

2. **Logique de commande déplacée entièrement côté serveur**
   Le calcul du prix total, la vérification de disponibilité produit, la validation du code promo et la vérification des horaires d'ouverture se font **exclusivement sur le backend**. Le frontend ne doit plus calculer de prix.

3. **Deux chemins de paiement distincts**
   - **Stripe Connect** : si le restaurant a un `stripeAccountId` → retourne `{ sessionId, url }` → redirect vers Stripe Checkout.
   - **Paiement sur place** : si pas de `stripeAccountId` → crée l'ordre directement avec `status: PENDING_ON_SITE_PAYMENT` → retourne `{ order, paymentMethod: "on_site" }`.

4. **Système d'invitation par token** pour les membres (ADMIN/STAFF) avec expiration 7 jours.

5. **URL convention** : Toutes les routes sont disponibles sur `/api/*` ET `/api/v1/*` (alias strict). En pratique, utiliser `/api/v1/` en Next.js pour la clarté.

6. **Format de réponse unifié** :
   - Succès : `{ data: <object|array> }`
   - Confirmation sans donnée : `{ message: "..." }`
   - Erreur : `{ error: "..." }` ou `{ error: "Validation failed", details: [{ field, message }] }`

7. **Statuts de commande étendus** : `PENDING` | `IN_PROGRESS` | `COMPLETED` | `DELIVERED` | `CANCELLED` | `PENDING_ON_SITE_PAYMENT`

8. **Pagination** disponible sur les listes d'ordres et de membres (`?page=1&limit=20`).

9. **Système de codes promo** complet avec pré-validation avant soumission.

```xml
</api_v2_overview>
```

---

```xml
<endpoints_documentation>
```

## Documentation exhaustive des endpoints

**Base URL** : `https://<host>/api` ou `https://<host>/api/v1` (identiques)

**Légende des permissions** :
- `🌐 Public` — Aucun token requis
- `🔑 Auth` — JWT Supabase requis (`Authorization: Bearer <token>`)
- `👤 STAFF+` — Membre du restaurant (tout rôle)
- `🛡️ ADMIN+` — Rôle OWNER ou ADMIN
- `👑 OWNER` — Rôle OWNER uniquement

---

### 1. Health Check

#### `GET /health`
**Permission** : `🌐 Public`

**Réponse 200** :
```json
{ "status": "ok" }
```

---

### 2. Utilisateur — `/api/user`

#### `GET /user/me`
**Permission** : `🔑 Auth`

**Réponse 200** :
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Jean Dupont",
    "phone": "+33612345678",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### `PUT /user/me`
**Permission** : `🔑 Auth`

**Body** :
```json
{
  "fullName": "string (1-50 chars, optionnel)",
  "phone": "string (numéro FR valide, optionnel)"
}
```
Phone regex : `/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/`

**Réponse 200** : `{ "data": <User> }`

#### `DELETE /user/me`
**Permission** : `🔑 Auth`

Supprime le compte Supabase Auth (suppression logique totale via l'admin Supabase).

**Réponse 200** : `{ "message": "User deleted successfully" }`

---

### 3. Restaurant — `/api/restaurants`

#### `GET /restaurants/:restaurantId`
**Permission** : `🌐 Public`

**Réponse 200** :
```json
{
  "data": {
    "id": "uuid",
    "name": "Le Pokey",
    "address": "12 rue de la Paix",
    "zipCode": "75001",
    "city": "Paris",
    "phone": "0123456789",
    "email": "contact@lepokey.fr",
    "imageUrl": "https://...",
    "stripeAccountId": "acct_...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```
> **Note** : `stripeAccountId` est exposé. Le frontend doit l'utiliser pour déterminer si le paiement Stripe est disponible (`stripeAccountId !== null`).

#### `POST /restaurants`
**Permission** : `🔑 Auth`

Crée un restaurant et assigne automatiquement le créateur comme `OWNER`.

**Body** :
```json
{
  "name": "string (1-50 chars, requis)",
  "address": "string (1-255 chars, requis)",
  "zipCode": "string (5 chiffres, requis)",
  "city": "string (1-50 chars, requis)",
  "phone": "string (numéro FR, requis)",
  "email": "string (email valide, optionnel)",
  "imageUrl": "string (URL valide, optionnel)"
}
```

**Réponse 201** : `{ "data": <Restaurant> }`

#### `PUT /restaurants/:restaurantId`
**Permission** : `🛡️ ADMIN+`

Tous les champs du restaurantSchema sont optionnels (PATCH sémantique via `partial()`).

**Body** : Tout sous-ensemble de `POST /restaurants`.

**Réponse 200** : `{ "data": <Restaurant> }`

#### `DELETE /restaurants/:restaurantId`
**Permission** : `👑 OWNER`

Suppression en cascade : supprime membres, catégories, produits, commandes, codes promo, horaires.

**Réponse 200** : `{ "message": "Restaurant deleted successfully" }`

---

### 4. Menu — `/api/menu/restaurants/:restaurantId/`

> **IMPORTANT** : Ces routes sont montées sous le préfixe `/api/menu`, pas `/api`. L'URL complète est `/api/menu/restaurants/:restaurantId/...`

#### `GET /menu/restaurants/:restaurantId/menu`
**Permission** : `🌐 Public`

Retourne toutes les catégories avec leurs produits et les groupes d'options imbriqués.

**Réponse 200** :
```json
{
  "data": [
    {
      "id": "uuid",
      "restaurantId": "uuid",
      "name": "Pokés",
      "subHeading": "Nos créations signature",
      "displayOrder": 1,
      "createdAt": "...",
      "updatedAt": "...",
      "productCategories": [
        {
          "id": "uuid",
          "productId": "uuid",
          "categorieId": "uuid",
          "product": {
            "id": "uuid",
            "restaurantId": "uuid",
            "name": "Poké Saumon",
            "description": "...",
            "imageUrl": "https://...",
            "price": "12.50",
            "tags": ["bestseller"],
            "discount": "0",
            "isAvailable": true,
            "displayOrder": 1,
            "optionGroups": [
              {
                "id": "uuid",
                "restaurantId": "uuid",
                "name": "Base",
                "hasMultiple": false,
                "isRequired": true,
                "minQuantity": 1,
                "maxQuantity": 1,
                "displayOrder": 0,
                "optionChoices": [
                  {
                    "id": "uuid",
                    "optionGroupId": "uuid",
                    "name": "Riz blanc",
                    "priceModifier": "0",
                    "displayOrder": 0
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
> **Note critique** : Le champ `productOptionGroups` (relation Prisma) est aplati (`flattenOptionGroups`) vers `optionGroups: []`. C'est ce format qui est retourné, pas la structure Prisma brute.

> **Note prix** : `price`, `discount`, `priceModifier` sont des **strings** (type `Decimal` Prisma sérialisé en string JSON). Le frontend doit faire `parseFloat(price)`.

#### `GET /menu/restaurants/:restaurantId/products`
**Permission** : `🌐 Public`

**Query params** :
- `?q=string` — recherche insensible à la casse sur `name` et `description`
- `?isAvailable=true|false` — filtre sur disponibilité

**Réponse 200** : `{ "data": [<Product avec optionGroups>] }`

#### `GET /menu/restaurants/:restaurantId/products/:productId`
**Permission** : `🌐 Public`

**Réponse 200** :
```json
{
  "data": {
    "id": "uuid",
    "name": "...",
    "productCategories": [{ "categorie": { "id": "uuid", "name": "Pokés" } }],
    "optionGroups": [...]
  }
}
```

#### `POST /menu/restaurants/:restaurantId/categories`
**Permission** : `🛡️ ADMIN+`

**Body** :
```json
{
  "name": "string (1-50 chars, requis)",
  "subHeading": "string (1-255 chars, optionnel)",
  "displayOrder": "number (requis)"
}
```
**Réponse 201** : `{ "data": <Categorie> }`

#### `PUT /menu/restaurants/:restaurantId/categories/:categorieId`
**Permission** : `🛡️ ADMIN+`

**Body** : Tout sous-ensemble de POST categories (tous optionnels).

**Réponse 200** : `{ "data": <Categorie> }`

#### `DELETE /menu/restaurants/:restaurantId/categories/:categorieId`
**Permission** : `🛡️ ADMIN+`

**Réponse 200** : `{ "message": "Product categorie deleted" }`

#### `POST /menu/restaurants/:restaurantId/products`
**Permission** : `🛡️ ADMIN+`

**Body** :
```json
{
  "name": "string (1-50 chars, requis)",
  "description": "string (1-255 chars, requis)",
  "imageUrl": "string (URL valide, requis)",
  "price": "number (requis)",
  "tags": ["string"] ,
  "discount": "number (défaut: 0)",
  "isAvailable": "boolean (défaut: true)",
  "displayOrder": "number (défaut: 999)",
  "categorieId": "uuid (requis)"
}
```

Crée le produit ET le lien `ProductCategorie` dans une transaction atomique.

**Réponse 201** : `{ "data": <Product> }` (sans `optionGroups` imbriqués)

#### `PUT /menu/restaurants/:restaurantId/products/:productId`
**Permission** : `🛡️ ADMIN+`

**Body** : Tout sous-ensemble de POST products (tous optionnels).

**Comportement `categorieId`** : Si fourni et différent de la catégorie actuelle, ajoute le lien de catégorie (ne supprime pas l'ancien).

**Réponse 200** : `{ "data": <Product> }`

#### `DELETE /menu/restaurants/:restaurantId/products/:productId`
**Permission** : `🛡️ ADMIN+`

**Réponse 200** : `{ "message": "Product deleted" }`

---

### 5. Groupes d'options — `/api/menu/restaurants/:restaurantId/option-groups`

#### `GET /menu/restaurants/:restaurantId/option-groups`
**Permission** : `🛡️ ADMIN+`

Retourne tous les groupes d'options du restaurant, triés par `displayOrder`, avec leurs choix inclus.

**Réponse 200** :
```json
{
  "data": [
    {
      "id": "uuid",
      "restaurantId": "uuid",
      "name": "Sauce",
      "hasMultiple": true,
      "isRequired": false,
      "minQuantity": 0,
      "maxQuantity": 3,
      "displayOrder": 1,
      "optionChoices": [
        { "id": "uuid", "name": "Teriyaki", "priceModifier": "0.50", "displayOrder": 0 }
      ]
    }
  ]
}
```

#### `POST /menu/restaurants/:restaurantId/option-groups`
**Permission** : `🛡️ ADMIN+`

**Body** :
```json
{
  "name": "string (1-50 chars, requis)",
  "hasMultiple": "boolean (défaut: false)",
  "isRequired": "boolean (défaut: false)",
  "minQuantity": "number (défaut: 1)",
  "maxQuantity": "number (défaut: 1)",
  "displayOrder": "number int (défaut: 0)",
  "choices": [
    {
      "name": "string (1-50 chars, requis)",
      "priceModifier": "number (défaut: 0)",
      "displayOrder": "number int (défaut: 0)"
    }
  ]
}
```

Crée le groupe ET ses choix en une transaction. Retourne le groupe avec ses choix.

**Réponse 201** : `{ "data": <OptionGroup avec optionChoices> }`

#### `PUT /menu/restaurants/:restaurantId/option-groups/:optionGroupId`
**Permission** : `🛡️ ADMIN+`

**Body** : Tout sous-ensemble de POST option-groups (sans `choices`).

**Réponse 200** : `{ "data": <OptionGroup avec optionChoices> }`

#### `DELETE /menu/restaurants/:restaurantId/option-groups/:optionGroupId`
**Permission** : `🛡️ ADMIN+`

**Réponse 200** : `{ "message": "Option group deleted" }`

---

### 6. Liaison Produit ↔ Groupes d'options

#### `POST /menu/restaurants/:restaurantId/products/:productId/option-groups`
**Permission** : `🛡️ ADMIN+`

Lie plusieurs groupes d'options à un produit (idempotent via `skipDuplicates`).

**Body** :
```json
{ "optionGroupIds": ["uuid", "uuid"] }
```

**Réponse 200** : `{ "message": "Option groups linked" }`

#### `DELETE /menu/restaurants/:restaurantId/products/:productId/option-groups/:optionGroupId`
**Permission** : `🛡️ ADMIN+`

**Réponse 200** : `{ "message": "Option group unlinked" }`

---

### 7. Choix d'options — `/api/menu/restaurants/:restaurantId/option-groups/:optionGroupId/option-choices`

#### `POST /menu/restaurants/:restaurantId/option-groups/:optionGroupId/option-choices`
**Permission** : `🛡️ ADMIN+`

**Body** :
```json
{
  "name": "string (1-50 chars, requis)",
  "priceModifier": "number (défaut: 0)",
  "displayOrder": "number int (défaut: 0)"
}
```
**Réponse 201** : `{ "data": <OptionChoice> }`

#### `POST /menu/restaurants/:restaurantId/option-groups/:optionGroupId/option-choices/bulk`
**Permission** : `🛡️ ADMIN+`

**Body** : `[ { "name", "priceModifier", "displayOrder" }, ... ]` (array, min 1 élément)

**Réponse 201** : `{ "data": [<OptionChoice>] }` — retourne tous les choix du groupe après insertion.

#### `PUT /menu/restaurants/:restaurantId/option-choices/:optionChoiceId`
**Permission** : `🛡️ ADMIN+`

> **ATTENTION** : L'`optionGroupId` n'est PAS dans l'URL ici, seulement `:optionChoiceId`.

**Body** : Tout sous-ensemble de `{ name, priceModifier, displayOrder }`.

**Réponse 200** : `{ "data": <OptionChoice> }`

#### `DELETE /menu/restaurants/:restaurantId/option-choices/:optionChoiceId`
**Permission** : `🛡️ ADMIN+`

**Réponse 200** : `{ "message": "Option choice deleted" }`

---

### 8. Commandes — `/api/restaurants/:restaurantId/orders`

#### `POST /restaurants/:restaurantId/orders`
**Permission** : `🌐 Public` (commande client sans compte)

Le backend vérifie : horaires d'ouverture, existence produits, existence choix d'options, validité du code promo, et calcule le prix total.

**Body** :
```json
{
  "fullName": "string (1-50 chars, optionnel)",
  "phone": "string (numéro FR, optionnel)",
  "email": "string (email valide, optionnel)",
  "items": [
    {
      "productId": "uuid (requis)",
      "quantity": "number int ≥ 1 (requis)",
      "optionChoiceIds": ["uuid"]
    }
  ],
  "promoCode": "string (1-50 chars, optionnel)"
}
```

**Réponse 201** :
```json
{
  "data": {
    "id": "uuid",
    "restaurantId": "uuid",
    "fullName": "Jean Dupont",
    "phone": null,
    "email": "jean@example.com",
    "status": "PENDING",
    "totalPrice": "24.50",
    "stripePaymentIntentId": null,
    "createdAt": "...",
    "updatedAt": "...",
    "orderProducts": [
      {
        "id": "uuid",
        "orderId": "uuid",
        "productId": "uuid",
        "quantity": 2,
        "product": { "id": "uuid", "name": "Poké Saumon", "price": "12.50", ... },
        "orderProductOptions": [
          {
            "id": "uuid",
            "orderProductId": "uuid",
            "optionChoiceId": "uuid",
            "optionChoice": { "id": "uuid", "name": "Riz blanc", "priceModifier": "0" }
          }
        ]
      }
    ]
  }
}
```

**Erreurs possibles** :
- `400` `"Restaurant is currently closed"`
- `404` `"One or more products not found"`
- `400` `"Invalid or inactive promo code"` / `"Promo code has expired"` / `"Promo code usage limit reached"` / `"Minimum order amount of X required"`

Un email de confirmation est envoyé si `email` est fourni.

#### `GET /restaurants/:restaurantId/orders`
**Permission** : `👤 STAFF+`

**Query params** :
- `?page=1` (défaut: 1)
- `?limit=20` (défaut: 20, max: 100)

**Réponse 200** :
```json
{
  "data": [<Order avec orderProducts imbriqués>],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### `GET /restaurants/:restaurantId/orders/:orderId`
**Permission** : `👤 STAFF+`

**Réponse 200** : `{ "data": <Order complet avec orderProducts> }`

#### `PATCH /restaurants/:restaurantId/orders/:orderId/status`
**Permission** : `👤 STAFF+`

**Body** :
```json
{
  "status": "PENDING | IN_PROGRESS | COMPLETED | DELIVERED | CANCELLED | PENDING_ON_SITE_PAYMENT"
}
```

**Réponse 200** : `{ "data": <Order> }` (sans orderProducts imbriqués)

---

### 9. Checkout Stripe — `/api/checkout`

#### `POST /checkout/create-session`
**Permission** : `🌐 Public`

**Deux comportements selon `stripeAccountId` du restaurant :**

**Body** :
```json
{
  "restaurantId": "uuid (requis)",
  "fullName": "string (1-50 chars, optionnel)",
  "phone": "string (numéro FR, optionnel)",
  "email": "string (email valide, optionnel)",
  "items": [
    {
      "productId": "uuid",
      "quantity": "number int ≥ 1",
      "optionChoiceIds": ["uuid"]
    }
  ]
}
```

**Réponse 201 — cas Stripe (restaurant avec `stripeAccountId`)** :
```json
{
  "data": {
    "sessionId": "cs_test_...",
    "url": "https://checkout.stripe.com/pay/cs_test_..."
  }
}
```

**Réponse 201 — cas paiement sur place (pas de `stripeAccountId`)** :
```json
{
  "data": {
    "order": { <Order complet avec orderProducts> },
    "paymentMethod": "on_site"
  }
}
```

Commission plateforme : 5% (`application_fee_amount` Stripe Connect).

#### `POST /checkout/webhook`
**Permission** : `🌐 Public` (Stripe uniquement, signature HMAC vérifiée)

Corps raw (`application/json` raw buffer). Traite l'événement `checkout.session.completed` pour créer l'ordre en DB.

#### `POST /checkout/restaurants/:restaurantId/orders/:orderId/refund`
**Permission** : `🛡️ ADMIN+`

Remboursement complet via Stripe + mise à jour du statut en `CANCELLED`.

**Body** : Vide (le remboursement est toujours total).

**Réponse 200** :
```json
{
  "data": {
    "order": { <Order mis à jour> },
    "refund": { "id": "re_...", "status": "succeeded" }
  }
}
```

**Erreurs** :
- `404` si ordre introuvable ou n'appartient pas au restaurant
- `400` si pas de `stripePaymentIntentId` (ordre sur place)
- `409` si déjà `CANCELLED`

---

### 10. Horaires d'ouverture — `/api/restaurants/:restaurantId/opening-hours`

#### `GET /restaurants/:restaurantId/opening-hours`
**Permission** : `🌐 Public`

**Réponse 200** :
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

`dayOfWeek` : `0` = Dimanche, `1` = Lundi, ..., `6` = Samedi (convention JS `Date.getDay()`).

#### `PUT /restaurants/:restaurantId/opening-hours`
**Permission** : `🛡️ ADMIN+`

**Remplace entièrement** tous les horaires (delete-then-insert en transaction).

**Body** :
```json
[
  {
    "dayOfWeek": "number int (0-6, requis)",
    "openTime": "string HH:MM (requis)",
    "closeTime": "string HH:MM (requis)",
    "order": "number int ≥ 0 (requis)"
  }
]
```

**Réponse 200** : `{ "data": [<OpeningHour>] }`

---

### 11. Membres — `/api/restaurants/:restaurantId/members`

#### `GET /restaurants/:restaurantId/members`
**Permission** : `🛡️ ADMIN+`

**Query params** : `?page=1&limit=20`

**Réponse 200** :
```json
{
  "data": [
    {
      "id": "uuid",
      "restaurantId": "uuid",
      "userId": "uuid",
      "role": "OWNER | ADMIN | STAFF",
      "createdAt": "...",
      "updatedAt": "...",
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "fullName": "Jean Dupont",
        "phone": null
      }
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

#### `POST /restaurants/:restaurantId/members/invite`
**Permission** : `👑 OWNER`

**Body** :
```json
{
  "email": "string (email valide, requis)",
  "role": "ADMIN | STAFF (défaut: STAFF)"
}
```

Envoie un email avec un lien d'invitation (`CLIENT_URL/invite/accept?token=<token>`). Token valide 7 jours.

**Réponse 201** : `{ "message": "Invitation sent" }`

**Erreurs** : `409` si l'utilisateur est déjà membre.

#### `PATCH /restaurants/:restaurantId/members/:memberId/role`
**Permission** : `👑 OWNER`

**Body** :
```json
{ "role": "ADMIN | STAFF" }
```

Ne peut pas modifier le rôle `OWNER`.

**Réponse 200** : `{ "data": <RestaurantMember> }`

#### `DELETE /restaurants/:restaurantId/members/:memberId`
**Permission** : `👑 OWNER`

Ne peut pas supprimer le membre `OWNER`.

**Réponse 200** : `{ "message": "Member removed successfully" }`

#### `POST /members/accept`
**Permission** : `🔑 Auth`

Accepter une invitation. L'email du token doit correspondre à l'email du compte Supabase.

**Body** :
```json
{ "token": "string (requis)" }
```

**Réponse 201** : `{ "data": <RestaurantMember> }`

**Erreurs** : `404` token invalide, `400` expiré, `403` email différent, `409` déjà membre.

---

### 12. Statistiques — `/api/restaurants/:restaurantId/stats`

#### `GET /restaurants/:restaurantId/stats`
**Permission** : `🛡️ ADMIN+`

**Query params** : `?period=day|week|month` (défaut: `month`)

Exclut les commandes `CANCELLED`.

**Réponse 200** :
```json
{
  "data": {
    "period": "month",
    "since": "2024-02-01T00:00:00.000Z",
    "totalOrders": 145,
    "revenue": 2180.50,
    "popularProducts": [
      { "name": "Poké Saumon", "count": 87 },
      { "name": "Poké Thon", "count": 62 }
    ]
  }
}
```

---

### 13. Upload — `/api/restaurants/:restaurantId/upload`

#### `POST /restaurants/:restaurantId/upload`
**Permission** : `🛡️ ADMIN+`

**Content-Type** : `multipart/form-data`

**Form field** : `image` (fichier)

**Contraintes** :
- Types autorisés : `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Taille max : 5 MB

Stocke dans Supabase Storage bucket `images`, chemin `restaurants/<restaurantId>/<timestamp>-<random>.<ext>`.

**Réponse 201** :
```json
{
  "data": {
    "url": "https://<supabase-project>.supabase.co/storage/v1/object/public/images/restaurants/..."
  }
}
```

---

### 14. Codes promo — `/api/restaurants/:restaurantId/promo-codes`

#### `POST /restaurants/:restaurantId/promo-codes/validate`
**Permission** : `🌐 Public`

À appeler avant de soumettre la commande pour afficher le rabais à l'utilisateur.

**Body** :
```json
{
  "code": "string (requis)",
  "orderTotal": "number positif (requis)"
}
```

**Réponse 200** :
```json
{
  "data": {
    "code": "SUMMER20",
    "discountType": "PERCENTAGE | FIXED",
    "discountValue": 20,
    "discountAmount": 4.90,
    "finalTotal": 19.60
  }
}
```

**Erreurs** : `404` non trouvé, `400` inactif/expiré/limite atteinte/montant minimum.

#### `GET /restaurants/:restaurantId/promo-codes`
**Permission** : `🛡️ ADMIN+`

**Réponse 200** : `{ "data": [<PromoCode>] }` (trié par `createdAt` DESC)

#### `POST /restaurants/:restaurantId/promo-codes`
**Permission** : `🛡️ ADMIN+`

**Body** :
```json
{
  "code": "string (1-50 chars, requis — stocké en MAJUSCULES)",
  "discountType": "PERCENTAGE | FIXED (requis)",
  "discountValue": "number positif (requis)",
  "minOrderAmount": "number positif (optionnel)",
  "maxUses": "number int positif (optionnel)",
  "expiresAt": "string ISO 8601 datetime (optionnel)",
  "isActive": "boolean (défaut: true)"
}
```

Unicité : `(restaurantId, code)` — erreur `409` si doublon.

**Réponse 201** : `{ "data": <PromoCode> }`

#### `DELETE /restaurants/:restaurantId/promo-codes/:promoCodeId`
**Permission** : `🛡️ ADMIN+`

**Réponse 200** : `{ "message": "Promo code deleted" }`

---

### Gestion d'erreurs — Format unifié

| Status | Cas | Format |
|--------|-----|--------|
| 400 | Validation Zod | `{ "error": "Validation failed", "details": [{ "field": "items.0.productId", "message": "Invalid uuid" }] }` |
| 400 | Logique métier | `{ "error": "Restaurant is currently closed" }` |
| 401 | Pas de token / token invalide | `{ "error": "Not authenticated" }` ou `{ "error": "Invalid token" }` |
| 403 | Permissions insuffisantes | `{ "error": "Access denied" }` |
| 404 | Ressource introuvable | `{ "error": "Resource not found" }` |
| 409 | Contrainte unique (Prisma P2002) | `{ "error": "Resource already exists" }` |
| 429 | Rate limit | `{ "error": "Too many requests, please try again later." }` |
| 500 | Erreur serveur | `{ "error": "Internal server error" }` |

**Rate limits** :
- Global : 100 req / 15 min / IP (toutes routes)
- Auth (`/api/user`) : 15 req / 15 min / IP
- Payment (`/api/checkout`) : 10 req / 15 min / IP

```xml
</endpoints_documentation>
```

---

```xml
<auth_and_state>
```

## Authentification et gestion de session

### Architecture d'authentification

```
[Client Next.js]
      |
      | 1. supabase.auth.signInWithPassword({ email, password })
      |    ou supabase.auth.signUp(...)
      |
[Supabase Auth]
      |
      | 2. Retourne { session: { access_token, refresh_token, expires_at } }
      |
[Client Next.js] — stocke la session (cookie httpOnly via @supabase/ssr)
      |
      | 3. Chaque requête API : Authorization: Bearer <access_token>
      |
[Backend v2]
      | 4. checkAuth : supabase.auth.getUser(token)
      | 5. Charge req.user depuis Prisma (avec restaurantMembers)
      |
[Controller]
```

### Ce que le frontend doit savoir

**L'authentification est gérée exclusivement par Supabase Auth côté client.** Le backend ne fournit aucun endpoint de login/signup/logout — ce sont des opérations Supabase SDK.

**Token JWT** :
- Type : `Bearer` token dans le header `Authorization`
- Le token est le `access_token` de la session Supabase
- Durée de vie : configurable dans Supabase (défaut : 1h)
- Refresh : géré par le SDK Supabase (`@supabase/ssr` pour Next.js)

**`req.user` injecté par `checkAuth`** contient :
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "Jean Dupont",
  "phone": null,
  "createdAt": "...",
  "updatedAt": "...",
  "restaurantMembers": [
    {
      "id": "uuid",
      "restaurantId": "uuid",
      "userId": "uuid",
      "role": "OWNER",
      "restaurant": { "id": "uuid", "name": "Le Pokey", ... }
    }
  ]
}
```

Ce champ `restaurantMembers` est ce que le frontend doit utiliser pour déterminer :
- À quel(s) restaurant(s) l'utilisateur appartient (`GET /user/me` expose cela)
- Son rôle pour chaque restaurant

**Hiérarchie des rôles** :

```
OWNER > ADMIN > STAFF
  |         |       |
  |         |       └── Lire commandes, changer statut commandes
  |         └── Tout STAFF + gérer menu, membres (lecture), stats, upload, codes promo, horaires
  └── Tout ADMIN + supprimer restaurant, inviter membres, supprimer membres, refund
```

### Gestion de session en Next.js avec `@supabase/ssr`

Utiliser `@supabase/ssr` pour créer un client Supabase qui persiste la session dans des cookies httpOnly, ce qui permet l'accès côté serveur (Server Components, Route Handlers, Server Actions).

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

```typescript
// app/api/[...route]/route.ts — Route Handler API avec token
export async function GET() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const res = await fetch(`${process.env.API_URL}/api/v1/user/me`, {
    headers: { Authorization: `Bearer ${session?.access_token}` }
  })
  return Response.json(await res.json())
}
```

```xml
</auth_and_state>
```

---

```xml
<nextjs_migration_tips>
```

## Recommandations pour la migration Next.js

### Règle fondamentale : où faire les appels API ?

| Type de données | Composant | Justification |
|----------------|-----------|---------------|
| Menu public (`GET /menu`) | **Server Component** | Pas d'auth, données statiques/ISR, SEO |
| Infos restaurant (`GET /restaurants/:id`) | **Server Component** | Public, SEO |
| Horaires d'ouverture | **Server Component** | Public, peu changeant |
| Dashboard commandes | **Server Component** + `revalidatePath` | Auth côté serveur via cookies |
| Statuts commandes temps réel | **Client Component** + polling ou SSE | Mutation d'état fréquente |
| Soumission commande (`POST /orders`) | **Server Action** | Mutation, validation côté serveur |
| Checkout Stripe (`POST /checkout/create-session`) | **Server Action** → redirect | Données sensibles (email, items) |
| Upload image (`POST /upload`) | **Client Component** | `multipart/form-data`, feedback UX |
| Promo code validation | **Server Action** | Évite l'exposition du résultat côté client avant soumission |

---

### Pattern recommandé : Wrapper API centralisé

Créer un module `lib/api.ts` qui centralise tous les appels avec gestion du token :

```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL + '/api/v1'

async function apiFetch(path: string, token: string | null, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'API error')
  }
  return res.json()
}
```

---

### Migration de la logique métier client → serveur

**1. Calcul de prix total**

❌ **v1 (React)** : Le frontend calculait le prix (`items.reduce(...)`)

✅ **v2 (Next.js)** : Le backend calcule le total. Le frontend envoie `items` bruts avec `optionChoiceIds`. Ne jamais afficher le "total final" avant la réponse du backend (sauf pour une estimation UX via `POST /promo-codes/validate`).

**2. Vérification disponibilité produits**

❌ **v1** : Vérification côté client sur les données en cache

✅ **v2** : Le backend rejette avec `404 "One or more products not found"` si un produit est indisponible ou inexistant. Rafraîchir le menu via `revalidatePath('/[restaurantSlug]')` après un ajout au panier si nécessaire.

**3. Vérification horaires d'ouverture**

❌ **v1** : Logique de comparaison d'heure côté client

✅ **v2** : Le backend vérifie et retourne `400 "Restaurant is currently closed"`. Le frontend peut afficher un badge "Fermé" en récupérant les horaires via un Server Component, mais ne doit pas bloquer la commande côté client — le backend est l'autorité.

**4. Panier**

Le panier doit rester en état **client uniquement** (`useState` / `zustand` / `localStorage`). Il n'y a pas d'API de panier persisté. Stocker : `Array<{ productId, quantity, optionChoiceIds, (snapshot prix UX) }>`.

**5. Authentification dans les layouts**

```typescript
// app/(dashboard)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return <>{children}</>
}
```

---

### Pattern pour la page menu (Server Component + ISR)

```typescript
// app/restaurant/[restaurantId]/page.tsx
import { unstable_cache } from 'next/cache'

const getMenu = unstable_cache(
  async (restaurantId: string) => {
    const res = await fetch(`${process.env.API_URL}/api/v1/menu/restaurants/${restaurantId}/menu`)
    return res.json()
  },
  ['menu'],
  { revalidate: 60 } // 60s ISR
)

export default async function MenuPage({ params }) {
  const { data: categories } = await getMenu(params.restaurantId)
  // Rendu Server Component, zéro JS côté client pour l'affichage
  return <MenuDisplay categories={categories} />
}
```

---

### Pattern pour la soumission de commande (Server Action)

```typescript
// app/restaurant/[restaurantId]/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'

export async function submitOrder(restaurantId: string, formData: FormData) {
  const items = JSON.parse(formData.get('items') as string)

  const res = await fetch(`${process.env.API_URL}/api/v1/restaurants/${restaurantId}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      items,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    return { error: err.error }
  }

  const { data } = await res.json()
  redirect(`/order/${data.id}/confirmation`)
}
```

---

### Pattern checkout Stripe (Server Action + redirect)

```typescript
'use server'
import { redirect } from 'next/navigation'

export async function startCheckout(payload: CheckoutPayload) {
  const res = await fetch(`${process.env.API_URL}/api/v1/checkout/create-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const { data } = await res.json()

  if (data.paymentMethod === 'on_site') {
    // Paiement sur place — ordre déjà créé
    redirect(`/order/${data.order.id}/confirmation?method=on_site`)
  }

  // Stripe Checkout — redirect externe
  redirect(data.url)
}
```

---

### Gestion des rôles dans les layouts dashboard

```typescript
// app/(dashboard)/restaurants/[restaurantId]/layout.tsx
export default async function RestaurantLayout({ params, children }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: user } = await apiFetch('/user/me', session?.access_token)

  const member = user.restaurantMembers.find(
    m => m.restaurantId === params.restaurantId
  )
  if (!member) redirect('/unauthorized')

  // Passer le rôle en contexte pour les composants enfants
  return <RoleProvider role={member.role}>{children}</RoleProvider>
}
```

---

### Points d'attention spécifiques

1. **Types des montants monétaires** : `price`, `totalPrice`, `priceModifier`, `discountValue` sont des **strings** dans les réponses JSON (type Prisma `Decimal` sérialisé). Toujours faire `parseFloat(price)` avant calcul ou affichage.

2. **Dates** : Toutes les dates sont en **ISO 8601 UTC** (`Timestamptz`). Utiliser `new Date(createdAt)` puis `toLocaleDateString('fr-FR')` pour l'affichage.

3. **`stripeAccountId` sur Restaurant** : Vérifier `restaurant.stripeAccountId !== null` avant d'afficher le bouton "Payer par carte". Si null, afficher "Payer sur place".

4. **`dayOfWeek` convention** : `0 = Dimanche` (convention `Date.getDay()`). Adapter l'affichage des horaires en conséquence.

5. **`optionGroups` est un champ aplati** : Dans les réponses produit/menu, le champ s'appelle `optionGroups` (pas `productOptionGroups`). C'est le résultat de `flattenOptionGroups()` côté backend.

6. **URL prefix `/api/menu/`** : Les routes menu ont un préfixe `/api/menu/` suivi de `/restaurants/:id/...`. Contrairement aux autres domaines qui sont directement sous `/api/restaurants/:id/...`.

7. **Pas d'endpoint de liste des restaurants** : Il n'y a pas de `GET /restaurants` (liste globale). Chaque restaurant est accédé directement par son `id`. La liste des restaurants d'un user est dans `user.restaurantMembers[].restaurant`.

```xml
</nextjs_migration_tips>
```
