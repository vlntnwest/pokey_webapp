# Roadmap - Pokey Bar (Servr)
## Application Web Click & Collect / Commande à table

**Dernière mise à jour :** 27/02/2026

---

## Vue d'ensemble

Cette roadmap est organisée en **5 phases**, de la stabilisation de l'existant jusqu'aux fonctionnalités avancées. Chaque phase est priorisée par criticité et impact métier.

```
Phase 1 ████████████████████ CRITIQUE - Sécurité & Stabilisation
Phase 2 ██████████████████   HAUTE   - Fonctionnalités métier essentielles
Phase 3 ████████████████     MOYENNE - Expérience utilisateur
Phase 4 ██████████████       BASSE   - Fonctionnalités avancées
Phase 5 ████████████         FUTURE  - Évolutions long terme
```

---

## Phase 1 - Sécurité & Stabilisation (CRITIQUE)

> Objectif : Corriger les failles de sécurité, stabiliser le paiement, fiabiliser le système existant.

### 1.1 Sécurité des routes API
- [ ] Protéger les routes d'écriture du menu (`POST/PUT/DELETE /api/item`) par `checkJwt`
- [ ] Protéger les routes tables (`POST /api/table`, `PUT /api/table/:id/toggle`) par `checkJwt`
- [ ] Protéger les routes food/allergen (`POST/PUT/DELETE`) par `checkJwt`
- [ ] Protéger `DELETE /api/order/:id` et `PUT /api/order/:id/toggle` par `checkJwt`
- [ ] Protéger `POST /api/order/print-order` par `checkJwt`
- [ ] Garder publiques uniquement : `GET` menu, `GET` tables, `GET /api/order/confirmed/:id`, `POST /api/checkout/*`

### 1.2 Sécurité du paiement Stripe
- [ ] Migrer de la version beta Stripe (`17.4.0-beta.2`) vers une version stable
- [ ] Migrer l'API version de `custom_checkout_beta=v1` vers la version stable
- [ ] Ajouter une vérification côté serveur que le `totalPrice` correspond aux `items` envoyés (éviter la manipulation de prix côté client)
- [ ] Ajouter un mécanisme d'idempotence pour éviter la double création de commande sur webhook replay
- [ ] Logger les événements webhook dans une collection dédiée pour audit
- [ ] Ajouter un monitoring des webhooks échoués (alerting)
- [ ] Vérifier que le montant payé dans le webhook correspond au montant attendu

### 1.3 Sécurité des données
- [ ] Déplacer l'URL complète MongoDB dans `.env` (retirer le host en dur de `config/db.js`)
- [ ] Ajouter `express-rate-limit` sur toutes les routes (anti-brute-force, anti-spam)
- [ ] Ajouter `helmet` pour les headers de sécurité HTTP
- [ ] Ajouter `express-validator` ou `joi` pour la validation/sanitization des inputs
- [ ] Vérifier que `.env` est bien exclu du déploiement
- [ ] Auditer les dépendances (`npm audit`)

### 1.4 Stabilisation
- [ ] Corriger le bug dans `isSuccess()` controller (`id` et `data` non définis)
- [ ] Corriger la route `private.orders.routes.js` : `tables/:tableNumber` manque le `/` initial
- [ ] Ajouter une gestion d'erreur globale (middleware Express error handler)
- [ ] Remplacer `console.log/error` par un logger structuré (pino)
- [ ] Ajouter des tests unitaires (vitest ou jest) pour les controllers critiques
- [ ] Ajouter des tests d'intégration pour le flux de paiement

**Livrables Phase 1 :**
- Toutes les routes admin protégées par auth
- Version stable de Stripe
- Validation des prix côté serveur
- Rate limiting actif
- Bug fixes critiques
- Logger structuré

---

## Phase 2 - Fonctionnalités métier essentielles (HAUTE)

> Objectif : Compléter les fonctionnalités manquantes pour un service de production robuste.

### 2.1 Gestion des commandes améliorée
- [ ] Ajouter un statut de commande (reçue → en préparation → prête → servie/récupérée)
- [ ] Notification temps réel au client quand la commande est prête (WebSocket - `ws` déjà installé)
- [ ] Dashboard temps réel pour la cuisine (WebSocket)
- [ ] Ajout d'un son/notification côté dashboard à la réception d'une commande
- [ ] Filtrage des commandes par date, statut, type (dine-in/C&C)

### 2.2 Gestion des créneaux Click & Collect
- [ ] Définir les créneaux horaires disponibles (configurable par l'admin)
- [ ] Limiter le nombre de commandes par créneau (capacité cuisine)
- [ ] Bloquer les créneaux complets
- [ ] Ajouter les jours de fermeture / congés

### 2.3 Gestion du menu avancée
- [ ] Gestion de la disponibilité en temps réel (rupture de stock)
- [ ] Gestion des prix par taille (S/M/L pour les bowls)
- [ ] Gestion des suppléments avec prix dynamique
- [ ] Upload d'images pour les articles (stockage cloud type S3/Vercel Blob)
- [ ] Tri et ordre d'affichage des articles

### 2.4 Gestion des tables améliorée
- [ ] Associer un QR code unique par table (génération automatique)
- [ ] Vérifier que la table est ouverte avant d'accepter une commande
- [ ] Historique des commandes par session de table (ouverture/fermeture)
- [ ] Calcul de l'addition totale par table

**Livrables Phase 2 :**
- Statuts de commande avec notifications temps réel
- Gestion des créneaux C&C
- Disponibilité menu en temps réel
- QR codes tables

---

## Phase 3 - Expérience utilisateur (MOYENNE)

> Objectif : Améliorer l'expérience client et admin.

### 3.1 Compte client
- [ ] Inscription / connexion client (Auth0 social login : Google, Apple)
- [ ] Historique des commandes client
- [ ] Commandes favorites / recomander
- [ ] Profil client avec préférences allergènes
- [ ] Consentement RGPD granulaire (marketing email, SMS, données)

### 3.2 Notifications
- [ ] Email de rappel 30 min avant le créneau C&C
- [ ] SMS de confirmation (Twilio ou alternative)
- [ ] Push notifications (PWA)

### 3.3 Dashboard admin amélioré
- [ ] Statistiques de vente (CA journalier, hebdo, mensuel)
- [ ] Top des ventes (articles les plus commandés)
- [ ] Graphiques de fréquentation par créneau
- [ ] Export des données (CSV/PDF)
- [ ] Gestion multi-utilisateurs admin avec rôles (manager, cuisine, caisse)

### 3.4 UX Client
- [ ] Recherche dans le menu
- [ ] Filtrage par allergènes
- [ ] Affichage des calories / informations nutritionnelles
- [ ] Mode sombre
- [ ] Multi-langue (FR/EN/DE pour Strasbourg)

**Livrables Phase 3 :**
- Comptes clients avec historique
- Dashboard admin avec statistiques
- Notifications multi-canal
- UX enrichie

---

## Phase 4 - Fonctionnalités avancées (BASSE)

> Objectif : Différenciation et fidélisation.

### 4.1 Programme de fidélité
- [ ] Système de points par commande
- [ ] Récompenses / articles gratuits
- [ ] Offre anniversaire
- [ ] Parrainage

### 4.2 Promotions
- [ ] Codes promo / réductions
- [ ] Happy hour (réduction par créneau horaire)
- [ ] Offres combinées (menu complet à prix réduit)
- [ ] Offres flash (notification push)

### 4.3 Paiement avancé
- [ ] Paiement partagé à la table (split bill)
- [ ] Pourboire numérique
- [ ] Apple Pay / Google Pay (via Stripe Payment Request)
- [ ] Facturation entreprise

### 4.4 Intégrations tierces
- [ ] Intégration avec les plateformes de livraison (Uber Eats, Deliveroo) - agrégation des commandes
- [ ] Intégration comptable (export pour expert-comptable)
- [ ] Intégration caisse enregistreuse (NF525 pour conformité fiscale française)
- [ ] Google My Business (mise à jour automatique des horaires)

**Livrables Phase 4 :**
- Programme de fidélité
- Système de promotions
- Moyens de paiement supplémentaires
- Intégrations tierces

---

## Phase 5 - Évolutions long terme (FUTURE)

> Objectif : Scalabilité et expansion.

### 5.1 Multi-restaurant
- [ ] Architecture multi-tenant (plusieurs restaurants sur la même plateforme)
- [ ] Configuration par restaurant (menu, horaires, imprimante)
- [ ] Dashboard centralisé multi-établissements
- [ ] Gestion des équipes par restaurant

### 5.2 Infrastructure
- [ ] Migration vers une architecture microservices (si la charge l'exige)
- [ ] Migration base de données vers PostgreSQL/Supabase (schéma Prisma déjà initié dans l'historique git)
- [ ] Cache Redis pour les performances (menu, sessions)
- [ ] CDN pour les assets statiques (images menu)
- [ ] CI/CD pipeline complet (tests automatisés, déploiement continu)
- [ ] Monitoring applicatif (Sentry, Datadog)

### 5.3 Mobile natif
- [ ] Application PWA complète (offline-first)
- [ ] Application native iOS/Android (React Native) si besoin

### 5.4 IA & Data
- [ ] Recommandations personnalisées basées sur l'historique
- [ ] Prévision de la demande par créneau (optimisation stocks)
- [ ] Chatbot pour la prise de commande

**Livrables Phase 5 :**
- Plateforme multi-restaurant
- Infrastructure scalable
- PWA/App native
- Intelligence artificielle

---

## Résumé des priorités

| Phase | Priorité | Focus | Estimation |
|-------|----------|-------|------------|
| **Phase 1** | CRITIQUE | Sécurité, bugs, stabilisation | Sprint 1-2 |
| **Phase 2** | HAUTE | Fonctionnalités métier core | Sprint 3-6 |
| **Phase 3** | MOYENNE | UX, dashboard, notifications | Sprint 7-10 |
| **Phase 4** | BASSE | Fidélité, promos, intégrations | Sprint 11-14 |
| **Phase 5** | FUTURE | Multi-restaurant, infra, IA | Après validation Phase 4 |

---

## Notes techniques

### Dettes techniques identifiées
1. **Stripe beta** : Version beta en production - à migrer en priorité
2. **MongoDB host en dur** : Sécurité - à déplacer dans `.env`
3. **Bug `isSuccess()`** : Variables `id` et `data` non définies dans le scope
4. **Route manquante** : `/` manquant sur `tables/:tableNumber` dans `private.orders.routes.js`
5. **`upsert: true`** dans `updateItem` : Peut créer des documents inattendus - à retirer
6. **Pas de pagination** : `getAllOrders`, `getAllItems` retournent tout - problème de perf à terme
7. **WebSocket (`ws`)** : Installé mais non utilisé - à implémenter en Phase 2
8. **bcrypt** : Installé mais non utilisé (auth déléguée à Auth0)
9. **sharp** : Installé mais pas de pipeline d'upload d'images implémenté

### Stack recommandée pour les évolutions
| Besoin | Recommandation |
|--------|---------------|
| Rate limiting | `express-rate-limit` |
| Validation | `zod` (typesafe) ou `joi` |
| Logger | `pino` + `pino-pretty` |
| Tests | `vitest` (déjà initié) |
| Cache | `ioredis` |
| Upload images | Vercel Blob (déjà utilisé pour le logo) ou AWS S3 |
| SMS | Twilio |
| Monitoring | Sentry |
| CI/CD | GitHub Actions |
