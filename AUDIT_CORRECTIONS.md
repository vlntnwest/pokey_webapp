# AUDIT COMPLET - POKEY WEBAPP (BACKEND + FRONTEND)

> **Date d'audit:** 25 Janvier 2026
> **Version analysée:** 1.0.0
> **Objectif:** Migration Supabase, nettoyage, tests, production-ready

---

## RESUME EXECUTIF

### Backend

| Catégorie | Score | Commentaire |
|-----------|-------|-------------|
| **Sécurité** | 3/10 | Vulnérabilités critiques, secrets exposés |
| **Architecture** | 6/10 | MVC basique, couplage fort |
| **Qualité de code** | 5/10 | Duplication, code mort, inconsistances |
| **Testabilité** | 1/10 | Aucun test, Jest configuré mais vide |
| **Production-ready** | 2/10 | **NON VENDABLE en l'état** |

### Frontend

| Catégorie | Score | Commentaire |
|-----------|-------|-------------|
| **Sécurité** | 4/10 | Tokens exposés dans .env committé |
| **Architecture** | 5/10 | Redux + Context mélangés, composants trop gros |
| **Qualité de code** | 4/10 | Duplication massive (600+ lignes), code mort |
| **Testabilité** | 1/10 | Aucun test, Testing Library installé mais non utilisé |
| **Performance** | 5/10 | Pas de lazy loading, N requêtes API pour panier |
| **Accessibilité** | 3/10 | Alt textes incorrects, pas d'ARIA labels |
| **Production-ready** | 2/10 | **NON VENDABLE en l'état** |

### Verdict: Application NON vendable professionnellement

**Raisons principales (Backend):**
1. 23 vulnérabilités NPM dont 2 critiques
2. Secrets exposés dans le repository (.env committé)
3. Aucun test automatisé
4. Pas de rate limiting (vulnérable aux attaques)
5. Gestion d'erreurs exposant des détails internes
6. Architecture trop couplée à un type de restaurant spécifique (Poké bowl)

**Raisons principales (Frontend):**
1. Tokens/clés exposés dans .env committé
2. Duplication de code massive (6 formulaires quasi identiques)
3. Aucun test automatisé
4. Performance dégradée (N requêtes API par item dans le panier)
5. Accessibilité non conforme WCAG
6. Pas d'error boundaries (crash = app entière down)

---

## NIVEAU 1 - CRITIQUE (Bloquant pour production)

### 1.1 🔴 Vulnérabilités NPM (23 vulnérabilités)

**Fichier:** `package.json`, `package-lock.json`

**Critiques (2):**
- `form-data` - Génération de boundary non sécurisée

**Hautes (13):**
- `axios@1.7.9` - SSRF & credential leakage
- `jws` - Faille de vérification de signature HMAC
- `qs` - Bypass de arrayLimit (DoS)
- `validator@13.12.0` - Bypass de validation d'URL
- `tar` - Écrasement de fichiers & symlink poisoning

**Action:**
```bash
npm audit fix --force
# OU migration vers des alternatives sécurisées
```

---

### 1.2 🔴 Secrets exposés dans le repository

**Fichier:** `.env` (committé!)

```env
# TOUS CES SECRETS SONT EXPOSÉS PUBLIQUEMENT
DB_USER_PASS=95s6dZIDtjN7bioj
AUTH0_CLIENT_SECRET=QLdK7EW...
STRIPE_SECRET_KEY=sk_test_51RCfcpLGvuYIK...
STRIPE_WEBHOOK_SECRET_KEY=whsec_c95f219d4c...
GMAIL_NODEMAILER_PASSWORD=kuiz ihgt rjut zpvo
```

**Actions:**
1. Ajouter `.env` au `.gitignore` IMMÉDIATEMENT
2. Régénérer TOUS les secrets (Stripe, Auth0, Gmail, MongoDB)
3. Utiliser un gestionnaire de secrets (Supabase Vault, Hostinger secrets)
4. Nettoyer l'historique git: `git filter-branch` ou BFG Repo-Cleaner

---

### 1.3 🔴 Pas de validation des inputs

**Fichiers:** Tous les controllers

**Problème:** Aucune validation des données entrantes

```javascript
// ACTUEL - Pas de validation
module.exports.createOrder = async (req) => {
  const newOrder = new OrderModel({
    ...req.body,  // Injection directe sans validation!
  });
};
```

**Risques:**
- Injection de données malformées
- Crash serveur sur types inattendus
- Données corrompues en base

**Action:** Implémenter Zod ou Joi pour validation des schémas

---

### 1.4 🔴 Pas de rate limiting

**Fichier:** `index.js`

**Risques:**
- Attaques par force brute
- DDoS applicatif
- Abus des endpoints de paiement

**Action:**
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite par IP
});
app.use(limiter);
```

---

### 1.5 🔴 Gestion d'erreurs exposant des détails

**Fichiers:** Tous les controllers

**Problème:**
```javascript
// ACTUEL - Expose les détails internes
} catch (error) {
  console.error("Error while fetching item:", error);
  res.status(500).send("Internal Server Error");
  // Stack trace visible dans les logs publics
}

// PIRE - Expose le message d'erreur
res.status(400).json({ error: err.message });
```

**Action:** Middleware d'erreur centralisé avec sanitization

---

### 1.6 🔴 Version Stripe Beta en production

**Fichier:** `package.json`

```json
"stripe": "^17.4.0-beta.2"  // VERSION BETA!
```

**Risques:**
- API instable
- Breaking changes sans préavis
- Pas de support Stripe officiel

**Action:** Migrer vers version stable

---

## NIVEAU 2 - MAJEUR (Important pour qualité)

### 2.1 🟠 Architecture couplée au type de restaurant

**Fichiers:** `models/bowl.model.js`, `models/menuItem.model.js`

**Problème:** Le modèle est spécifique aux Poké bowls

```javascript
// Hardcodé pour poké bowls
const BowlSchema = new mongoose.Schema({
  type: { type: String, enum: ["signature", "custom"] },
  proteins: [String],
  garnishes: [String],  // Spécifique poké
  toppings: [String],   // Spécifique poké
});

// Enum hardcodé
type: {
  enum: ["bowl", "side", "drink", "dessert", "custom"],
}
```

**Action:** Refactoriser vers une architecture générique:
- Catégories dynamiques
- Attributs configurables par catégorie
- Options et variantes flexibles

---

### 2.2 🟠 Code mort et fonctions cassées

**Fichier:** `controllers/order.controller.js:128-137`

```javascript
// FONCTION MORTE - Variables 'id' et 'data' non définies!
module.exports.isSuccess = async (req, res) => {
  try {
    const order = await OrderModel.findById(id);  // ❌ id undefined
    order.isSuccess = data;                        // ❌ data undefined
    await order.save();
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
```

**Action:** Supprimer ou corriger cette fonction

---

### 2.3 🟠 Route malformée

**Fichier:** `routes/private.orders.routes.js:9`

```javascript
// ACTUEL - Pas de slash au début!
router.get("tables/:tableNumber", orderController.getOrdersByTable);

// DEVRAIT ÊTRE
router.get("/tables/:tableNumber", orderController.getOrdersByTable);
```

**Action:** Ajouter le slash manquant

---

### 2.4 🟠 Dépendances non utilisées

**Fichier:** `package.json`

```json
{
  "bcrypt": "^5.1.1",        // Jamais utilisé dans le code
  "crypto": "^1.0.1",        // Module built-in, pas besoin
  "ws": "^8.18.0",           // WebSocket non utilisé
  "esc-pos-encoder": "...",  // Dépend de canvas (supprimé)
}
```

**Action:** Nettoyer les dépendances inutiles

---

### 2.5 🟠 Aucun test automatisé

**Fichier:** `package.json`

```json
"scripts": {
  "test": "jest"  // Jest configuré mais 0 tests!
}
```

**Tests manquants:**
- Tests unitaires des controllers
- Tests d'intégration des routes
- Tests du webhook Stripe
- Tests de validation des modèles

---

### 2.6 🟠 Incohérence des types de données

**Fichiers:** Modèles variés

```javascript
// Dans menuItem.model.js - price est String
price: {
  type: String,  // ❌ Devrait être Number
  required: true,
},

// Dans order.model.js - totalPrice est Number
totalPrice: {
  type: Number,  // ✓ Correct
},
```

**Action:** Unifier tous les prix en Number (ou Decimal128 pour précision)

---

### 2.7 🟠 Duplication de code massive

**Pattern répété 9 fois:**
```javascript
if (!ObjectID.isValid(id)) return res.status(400).send("ID unknown : " + id);
```

**Nodemailer transporter recréé à chaque email:**
```javascript
// Créé à chaque appel au lieu d'être singleton
const transporter = nodemailer.createTransport({...});
```

**Action:** Créer middlewares et singletons réutilisables

---

### 2.8 🟠 Pas de vérification d'ownership

**Fichier:** `controllers/order.controller.js`

**Problème:** Un utilisateur peut accéder aux commandes d'autres utilisateurs

```javascript
// ACTUEL - Pas de vérification que l'ordre appartient à l'utilisateur
module.exports.getOrderById = async (req, res) => {
  const order = await OrderModel.findById(req.params.id);
  // Renvoie la commande sans vérifier le propriétaire!
};
```

**Action:** Vérifier `order.userId === req.auth.sub`

---

## NIVEAU 3 - MINEUR (Améliorations recommandées)

### 3.1 🟡 Nommage incohérent (FR/EN mélangés)

**Collections MongoDB:**
- `"Allergène"` (français)
- `"Order"` (anglais)
- `"MenuItem"` (anglais)
- `"CustomDetails"` (anglais)

**Action:** Uniformiser en anglais

---

### 3.2 🟡 Console.log en production (38 occurrences)

```javascript
console.log(`[🧾 THERMAL] Connected to printer`);  // Emoji!
console.error("Erreur serveur :", err.response?.data || err.message);
```

**Action:** Utiliser Winston ou Pino avec niveaux de log

---

### 3.3 🟡 Messages d'erreur incohérents

```javascript
// Parfois .send()
res.status(400).send("ID unknown : " + id)

// Parfois .json()
res.status(400).json({ error: "..." })

// Mix français/anglais
"Commande créée avec succès"
"Internal Server Error"
```

**Action:** Standardiser format de réponse JSON

---

### 3.4 🟡 Magic strings/numbers

```javascript
// Enum répété dans plusieurs fichiers
enum: ["bowl", "side", "drink", "dessert", "custom"]

// Chunk size Stripe sans explication
const chunkSize = 490;
```

**Action:** Extraire dans fichier de constantes

---

### 3.5 🟡 Logique métier dans les controllers

**Fichier:** `controllers/order.controller.js`

```javascript
// Une fonction fait: création + impression + email
module.exports.handleOrderCreation = async (req, res) => {
  const order = await module.exports.createOrder(req);
  await module.exports.printOrder(order);
  if (req.body.orderType === "clickandcollect") {
    await module.exports.sendOrderConfirmation(order);
  }
  // ...
};
```

**Action:** Créer une couche service séparée

---

### 3.6 🟡 CORS avec credentials:true

**Fichier:** `index.js`

```javascript
const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,  // Risque si mal configuré
};
```

**Action:** Évaluer si vraiment nécessaire

---

### 3.7 🟡 Pas de documentation API

**Manquant:**
- Swagger/OpenAPI spec
- Documentation des endpoints
- Exemples de requêtes/réponses

**Action:** Générer documentation avec swagger-jsdoc

---

## NIVEAU 4 - SUGGESTIONS (Nice to have)

### 4.1 🔵 Migration TypeScript

Améliorerait:
- Type safety
- Autocomplétion IDE
- Détection d'erreurs à la compilation

---

### 4.2 🔵 Conteneurisation Docker

Permettrait:
- Déploiement reproductible
- Isolation des dépendances
- CI/CD facilité

---

### 4.3 🔵 Monitoring et observabilité

À ajouter:
- Health check endpoint
- Métriques Prometheus
- Tracing distribué

---

### 4.4 🔵 Caching

Opportunités:
- Cache Redis pour menu items
- Cache des allergènes (données statiques)

---

---

# PARTIE 2 - FRONTEND (pokey_app_frontend)

---

## ARCHITECTURE FRONTEND

**Stack technique:**
- React 18.3.1 + JavaScript (pas TypeScript)
- Redux Toolkit 2.2.7 + Context API (double gestion d'état)
- React Router DOM v6.26.2
- Material-UI (MUI) v6.1.0 + Emotion
- Axios pour les appels API
- Auth0 pour l'authentification
- Stripe pour les paiements
- Vercel pour le déploiement

**Structure:**
```
/src
├── /actions          # Redux actions
├── /reducers         # Redux reducers
├── /components       # Composants React (admin, user, Context, Buttons, Icons)
├── /hooks            # Custom hooks
├── /pages            # Pages principales
├── /utils            # Utilitaires
├── api.js            # Configuration Axios
├── App.js            # Composant racine
└── Theme.js          # Configuration MUI Theme
```

---

## NIVEAU 1 - CRITIQUE (Frontend)

### F1.1 🔴 Tokens/clés exposés dans .env committé

**Fichier:** `.env`

```env
REACT_APP_API_URL="http://localhost:5001/"
REACT_APP_STRIPE_PUBLIC_KEY="pk_test_51RCfcpLGvuYIK..."
REACT_APP_AUTH0_AUDIENCE="..."
REACT_APP_AUTH0_CLIENT_ID="..."
REACT_APP_AUTH0_DOMAIN="..."
BLOB_READ_WRITE_TOKEN="vercel_blob_..."  # TOKEN CRITIQUE!
```

**Actions:**
1. Ajouter `.env` au `.gitignore`
2. Créer `.env.example` sans valeurs sensibles
3. Régénérer le `BLOB_READ_WRITE_TOKEN` Vercel

---

### F1.2 🔴 Duplication de code massive (600+ lignes)

**Fichiers:** `src/components/user/Form/*.js`

6 formulaires quasi identiques avec le même pattern:

```javascript
// BaseForm.js, ProtForm.js, SaucesForm.js, GarnishesForm.js, ToppingsForm.js, SideForm.js
// TOUS font la même chose:
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  axios.get(`/api/item/custom/${category}`)
    .then(res => setData(res.data))
    .catch(err => setError(err))
    .finally(() => setLoading(false));
}, []);

if (loading) return <CircularProgress />;
if (error) return <Alert severity="error" />;
return <List>{data.map(item => ...)}</List>;
```

**Action:** Créer un hook `useFetchCustomItems(category)` réutilisable

---

### F1.3 🔴 Validation dupliquée en 3 endroits

**Fichiers:**
- `src/utils/index.js` (export principal)
- `src/components/user/Settings/AccountDetails.js` (redéfini)
- `src/components/user/Onboarding.js` (redéfini)

```javascript
// 3 versions DIFFÉRENTES de validatePhone!
// utils/index.js
export const validatePhone = (phone) => validator.isMobilePhone(phone, "fr-FR");

// AccountDetails.js
const validatePhone = (phone) => validator.isMobilePhone(phone);  // Sans locale!

// Onboarding.js
const validatePhone = (phone) => validator.isMobilePhone(phone, "fr-FR");
```

**Action:** Centraliser toute validation dans `utils/validation.js`

---

### F1.4 🔴 useStripeItems: N requêtes API par item

**Fichier:** `src/hooks/useStripeItems.js`

```javascript
// ACTUEL - Pour 5 items = 5 requêtes HTTP!
const fetchItemsData = async (cartData) => {
  const itemsData = await Promise.all(
    cartData.map(async (item) => {
      const response = await axios.get(`/api/item/${item.itemId}`);
      return response.data;
    })
  );
  return itemsData;
};
```

**Impact:** Panier de 10 items = 10 requêtes réseau en parallèle

**Actions:**
1. Option A: Créer endpoint batch `/api/items/batch` côté backend
2. Option B: Stocker les infos complètes dans sessionStorage lors de l'ajout au panier

---

### F1.5 🔴 Aucun test frontend

**État:** Testing Library installé mais 0 fichiers de test

```json
// package.json
"@testing-library/react": "^13.4.0",  // Installé
"@testing-library/jest-dom": "^5.17.0",  // Installé
// Mais aucun fichier *.test.js ou *.spec.js!
```

**Action:** Implémenter tests pour:
- Composants critiques (Cart, CheckoutForm)
- Hooks personnalisés (useStripeItems, useShoppingCart)
- Flux de commande E2E

---

## NIVEAU 2 - MAJEUR (Frontend)

### F2.1 🟠 Pas d'Error Boundaries

**Problème:** Une erreur dans un composant fait crasher toute l'application

**Action:**
```javascript
// Créer ErrorBoundary.js
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

---

### F2.2 🟠 Pas de lazy loading des routes

**Fichier:** `src/components/Routes/index.js`

```javascript
// ACTUEL - Tout chargé d'un coup
import ClickAndCollect from "../../pages/ClickAndCollect";
import Admin from "../../pages/Admin";
import Confirmation from "../../pages/Confirmation";
import Table from "../../pages/Table";

// DEVRAIT ÊTRE
const ClickAndCollect = React.lazy(() => import("../../pages/ClickAndCollect"));
const Admin = React.lazy(() => import("../../pages/Admin"));
// + <Suspense fallback={<Loading />}>
```

**Impact:** Bundle initial plus lourd, temps de chargement augmenté

---

### F2.3 🟠 window.location au lieu de useNavigate

**Fichiers:** `Header.js`, `AccountDetails.js`, `AboutBtn.js`

```javascript
// MAUVAISE PRATIQUE - Recharge toute l'app
window.location.href = "/";
window.location = "/";

// BONNE PRATIQUE - Navigation SPA
const navigate = useNavigate();
navigate("/");
```

**Impact:** Perte d'état React, rechargement inutile

---

### F2.4 🟠 Composants trop gros

| Fichier | Lignes | Problème |
|---------|--------|----------|
| `MealDetails.js` | 297 | Gère état complexe customisation |
| `CheckoutForm.js` | 288 | Logique paiement + form invité |
| `ClickAndCollect.js` | 260 | Page entière monolithique |

**Action:** Extraire en sous-composants et hooks

---

### F2.5 🟠 Double gestion d'état (Redux + Context)

**Problème:** Redux pour certaines données, Context pour d'autres

```javascript
// Redux: meals, orders, users, tables, details, food
// Context: ShoppingCartContext, ShopContext, GuestContext, UidContext

// Résultat: Confusion sur où trouver l'état
```

**Action:** Choisir une seule approche (recommandé: tout en Context ou tout en Zustand)

---

### F2.6 🟠 Accessibilité non conforme

**Problèmes identifiés:**

1. **Alt textes incorrects:**
```javascript
// Logo avec alt hors-sujet!
<img src={logo} alt="The house from the offer." />  // ???
```

2. **Pas d'aria-labels sur icônes:**
```javascript
<IconButton onClick={handleClose}>
  <CloseIcon />  // Pas de aria-label!
</IconButton>
```

3. **Couleur seule pour information:**
```javascript
// OrderCard - success/error sans texte alternatif
<Chip color={isArchived ? "success" : "error"} />
```

---

### F2.7 🟠 Math.random() pour génération d'IDs

**Fichier:** `MealDetails.js`

```javascript
// Risque de collision (faible mais présent)
id: `${_id}-${Math.floor(Math.random() * timestamp)}`
```

**Action:** Utiliser `crypto.randomUUID()` ou package `uuid`

---

## NIVEAU 3 - MINEUR (Frontend)

### F3.1 🟡 49 console.log/error à nettoyer

```javascript
// À supprimer en production
console.log("User data:", userData);
console.error("Error fetching meals:", error);
```

---

### F3.2 🟡 Code mort

| Fichier | Problème |
|---------|----------|
| `UidContext.js` | Contexte créé mais jamais utilisé |
| `Photobooth.js` | Composant non référencé |
| `CheckIcon.js` | Pourrait être remplacé par MUI Icon |

---

### F3.3 🟡 Dépendances non utilisées

```json
{
  "js-cookie": "^3.0.5",      // Jamais importé
  "react-mobile-picker": "^1.0.1"  // Version de 2019, usage minimal
}
```

---

### F3.4 🟡 sessionStorage parsé à chaque render

**Fichier:** `ShoppingCartContext.js`

```javascript
// Appelé à chaque render
const cartItems = JSON.parse(sessionStorage.getItem("Cart") || "[]");
```

**Action:** Initialiser une seule fois avec useState lazy init

---

### F3.5 🟡 Sorting à chaque render

**Fichiers:** `OrdersList.js`, `ArchivedOrders.js`

```javascript
// new Date() créé à chaque tri, à chaque render
orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
```

**Action:** Memoizer avec useMemo

---

## CHECKLIST TESTS FRONTEND

### Tests Unitaires
- [ ] Hook `useStripeItems`
- [ ] Hook `useShoppingCart` (Context)
- [ ] Utilitaires validation
- [ ] Utilitaire `formatPrice`

### Tests Composants
- [ ] Cart - ajout/suppression items
- [ ] CheckoutForm - validation formulaire
- [ ] MealDetails - sélection options
- [ ] OrderCard - affichage données

### Tests d'Intégration
- [ ] Flux ajout au panier
- [ ] Flux checkout invité
- [ ] Flux checkout authentifié

### Tests E2E (Cypress/Playwright)
- [ ] Parcours commande complet
- [ ] Authentification Auth0
- [ ] Paiement Stripe (sandbox)

---

## PLAN DE MIGRATION SUPABASE

### Phase 1: Base de données PostgreSQL

```
MongoDB → PostgreSQL (Supabase)
├── users → auth.users (Supabase Auth)
├── Order → public.orders
├── MenuItem → public.menu_items
├── Bowl → public.bowl_details (ou JSONB)
├── Custom → public.custom_options
├── Food → public.foods
├── Allergen → public.allergens
└── Table → public.tables
```

### Phase 2: Authentification Supabase

```
Auth0 → Supabase Auth
├── JWT verification via @supabase/supabase-js
├── Row Level Security (RLS) pour ownership
├── Magic link / OAuth providers
└── Suppression users.model.js
```

### Phase 3: Refactorisation produits

```
Architecture générique:
├── categories (dynamiques)
├── products (avec category_id)
├── product_options (attributs configurables)
├── option_choices (valeurs possibles)
└── order_items (avec options sélectionnées JSONB)
```

---

## CHECKLIST IMPLEMENTATION TESTS

### Tests Unitaires
- [ ] Validation des schémas Zod/Joi
- [ ] Fonctions utilitaires (printer, error)
- [ ] Transformation des données

### Tests d'Intégration
- [ ] CRUD menu items
- [ ] CRUD orders
- [ ] CRUD users
- [ ] Webhook Stripe (mock)

### Tests E2E
- [ ] Flow complet de commande
- [ ] Authentification
- [ ] Paiement (sandbox Stripe)

### Couverture cible
- Minimum: 70%
- Idéal: 85%

---

## ESTIMATION EFFORT

### Backend

| Tâche | Complexité | Priorité |
|-------|------------|----------|
| Fix vulnérabilités NPM | Faible | P0 |
| Sécuriser secrets (.env) | Faible | P0 |
| Validation inputs (Zod) | Moyenne | P0 |
| Rate limiting | Faible | P0 |
| Error handling centralisé | Moyenne | P1 |
| Migration Supabase DB | Haute | P1 |
| Migration Supabase Auth | Moyenne | P1 |
| Refacto produits génériques | Haute | P2 |
| Tests unitaires backend | Moyenne | P2 |
| Tests intégration backend | Moyenne | P2 |
| Nettoyage code mort | Faible | P3 |
| Documentation API (Swagger) | Faible | P3 |

### Frontend

| Tâche | Complexité | Priorité |
|-------|------------|----------|
| Sécuriser secrets (.env) | Faible | P0 |
| Hook useFetchCustomItems (dédupliquer) | Moyenne | P0 |
| Centraliser validation | Faible | P0 |
| Optimiser useStripeItems (batch) | Moyenne | P1 |
| Error Boundaries | Faible | P1 |
| Lazy loading routes | Faible | P1 |
| Remplacer window.location | Faible | P1 |
| Migration Supabase Auth | Moyenne | P1 |
| Accessibilité (WCAG AA) | Moyenne | P2 |
| Tests unitaires frontend | Moyenne | P2 |
| Tests E2E (Cypress) | Haute | P2 |
| Refacto composants trop gros | Moyenne | P2 |
| Unifier gestion état | Moyenne | P3 |
| Nettoyage code mort/console.log | Faible | P3 |

---

## CONCLUSION

Cette application (backend + frontend) est un **bon prototype** pour un premier projet, mais elle n'est **pas prête pour une utilisation commerciale** en raison de:

### Backend
1. **Problèmes de sécurité critiques** - 23 vulnérabilités NPM, secrets exposés, pas de rate limiting
2. **Architecture trop spécifique** - Couplée aux Poké bowls, non réutilisable
3. **Absence totale de tests** - Maintenance risquée
4. **Dette technique** - Code mort, duplication, inconsistances

### Frontend
1. **Secrets exposés** - Tokens Vercel et clés dans .env committé
2. **Duplication massive** - 600+ lignes de code dupliqué dans les formulaires
3. **Performance** - N requêtes API par item, pas de lazy loading
4. **Accessibilité** - Non conforme WCAG, bloquant pour clients professionnels
5. **Aucun test** - Risque élevé de régression
6. **Pas de gestion d'erreurs** - Un crash = toute l'app down

### Verdict final

| Critère | Évaluation |
|---------|------------|
| **Vendable à un client?** | NON |
| **Utilisable en production?** | NON (risques sécurité) |
| **Base pour refonte?** | OUI (architecture compréhensible) |
| **Effort pour production-ready** | Moyen-Élevé |

**Recommandation:** Effectuer une refonte complète avec:
1. Migration Supabase (DB + Auth)
2. Correction des failles de sécurité
3. Refactorisation de l'architecture produits
4. Implémentation des tests (couverture min 70%)
5. Audit accessibilité WCAG 2.1 AA

Le code existant peut servir de référence, mais certaines parties devront être réécrites entièrement.
