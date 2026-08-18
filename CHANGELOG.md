# Changelog SecureMessage

Toutes les modifications notables apportées à ce projet sont documentées ici. Le format est basé
sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

## [Unreleased]

### À faire

- Ajout de la rotation des signed prekeys
- Implémentation du chiffrement des clés privées au repos (AES-256-GCM + PBKDF2)
- Migration vers `@signalapp/libsignal-client` (SDK officiel Rust/WASM)
- Mécanisme de révocation des JWT
- Audit d'accessibilité RGAA complet

---

## [0.2] - 2026-08-17

### Ajouté

- **Supervision (BC04 · C4.1.2)** :
    - Stack Prometheus + Grafana + Alertmanager + exporters (node, mongodb, blackbox) via
      `docker-compose.monitoring.yml`
    - Métriques backend exposées via Actuator + `micrometer-registry-prometheus` (`/actuator/prometheus`)
    - 11 règles d'alerte (disponibilité, latence P95, taux d'erreur 5xx, saturation JVM/CPU/RAM/disque, expiration TLS)
    - Notifications d'incident et de résolution vers un webhook Discord (Alertmanager)
- **Maintenance (BC04)** :
    - Mises à jour des dépendances automatisées via Dependabot (Maven, npm, GitHub Actions, Docker)
    - Formulaire de consignation d'anomalie GitHub Issues (`bug_report.yml`) + redirection des vulnérabilités vers un
      advisory privé

### Sécurité

- Endpoints Actuator restreints à `health,info,prometheus` en lecture seule ; interfaces de supervision exposées
  uniquement sur `127.0.0.1` (accès par tunnel SSH)

---

## [0.1] - 2026-07-20

### Ajouté

- **Authentification anonyme** : Inscription via UUID sans identifiants personnels
- **Protocole Signal** : Intégration de `@privacyresearch/libsignal-protocol-typescript` v0.0.16
    - X3DH pour l'établissement de clé initial
    - Double Ratchet pour le chiffrement de bout en bout des messages
- **Stockage des clés** :
    - Sessions Signal persistantes dans IndexedDB (frontend)
    - One-Time PreKeys (5 par défaut) persistés dans MongoDB
- **Infrastructure** :
    - Orchestration Docker Compose (`docker-compose.prod.yml`, `docker-compose.dev.yml`)
    - Reverse proxy nginx avec TLS 1.3 (Let's Encrypt)
    - CI/CD GitHub Actions vers Docker Hub (`elias18/securemessage-backend`, `elias18/securemessage-frontend`)
- **Sécurité** :
    - Headers HTTP renforcés (HSTS, CSP, Referrer-Policy, Permissions-Policy, COOP, CORP, COEP)
    - CORS verrouillé à `https://secure-mess.fr`
    - Licence GPL-3.0 (compatibilité libsignal)

### Modifié

- Configuration Vite : Variables d'environnement passées en ARG Docker (build time)
- nginx : `proxy_pass` ajusté pour préservation du path prefix Spring Boot
- WebSocket : Location `/ws/` dédié avec headers Upgrade/Connection pour le passage en production HTTPS

### Corrections

- Bug prékeys : Correction du flux AuthController.java → UserService (les prékeys étaient construits mais jamais
  persistés)
- Redux : Harmonisation des clés de conversation (utilisation systématique de `conversationId` MongoDB)
- React StrictMode : Double-appels gérés pour éviter la duplication de `processPreKey`

### Sécurité (connu)

- `isTrustedIdentity` retourne toujours `true` (TOFU sans détection de changement) — **délibéré pour V1**
- Clés privées stockées en clair côté client — **défini pour V2 (chiffrement AES-256-GCM)**
- `registrationId` codé en dur à `1` — **défini pour V2 (généré aléatoirement)**
- Pas de recharge automatique des One-Time PreKeys après épuisement des 5 — **défini pour V2**
