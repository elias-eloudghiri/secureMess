# Système de supervision — SecureMessage (RNCP 39583 · BC04 · C4.1.2)

> Compétence C4.1.2 : *« Concevoir un système de supervision et d'alerte en déterminant le
> périmètre de supervision et en identifiant les indicateurs de suivi pertinents, en mettant en
> place des sondes, en configurant la modalité des signalements afin de garantir une
> disponibilité permanente du logiciel. »*

## 1. Périmètre de supervision
| Cible            | Ce qu'on surveille                                  |
|------------------|-----------------------------------------------------|
| Backend Spring Boot | Santé applicative, HTTP (latence/erreurs/débit), JVM |
| MongoDB          | Disponibilité, connexions, opérations                |
| Hôte / VPS       | CPU, RAM, disque, réseau                              |
| Site public HTTPS| Disponibilité externe + validité du certificat TLS   |

## 2. Indicateurs de suivi (KPIs)
Basés sur les 4 *golden signals* + saturation :
- **Disponibilité** : `up`, `probe_success`, `mongodb_up`
- **Latence** : P95 via `histogram_quantile` sur `http_server_requests_seconds_bucket`
- **Taux d'erreur** : ratio des réponses `5xx`
- **Débit** : `rate(http_server_requests_seconds_count[...])`
- **Saturation** : heap JVM, CPU/RAM/disque hôte

## 3. Sondes mises en place (exporters)
| Sonde                | Rôle                                  | Port |
|----------------------|---------------------------------------|------|
| Micrometer (Actuator)| Métriques applicatives backend        | 8080 |
| node_exporter        | Métriques système du VPS              | 9100 |
| mongodb_exporter     | Métriques MongoDB                     | 9216 |
| blackbox_exporter    | Probe HTTPS externe (disponibilité)   | 9115 |

Prometheus (`prometheus.yml`) scrape ces sondes toutes les 15 s.

## 4. Modalité des signalements
- Règles d'alerte : `prometheus/rules/alerts.yml` (évaluées en continu par Prometheus).
- Routage / notifications : **Alertmanager → webhook Discord** (`alertmanager/alertmanager.yml`).
- `send_resolved: true` : notification aussi à la résolution de l'incident.
- Les critiques sont ré-envoyées toutes les heures, les warnings toutes les 4 h.

## Démarrage
```bash
# 1. Créer l'utilisateur de supervision Mongo (une fois)
mongosh ... ../spring-snippets/4-mongo-monitor-user.js

# 2. Renseigner les secrets (non commités)
echo "https://discord.com/api/webhooks/XXX/YYY" > alertmanager/secrets/discord_webhook_url
# + .env : GRAFANA_ADMIN_PASSWORD, MONGODB_MONITOR_URI

# 3. Lancer
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d

# 4. Accès (tunnel SSH conseillé) :
#    Prometheus  http://127.0.0.1:9090
#    Alertmanager http://127.0.0.1:9093
#    Grafana     http://127.0.0.1:3000  (admin / $GRAFANA_ADMIN_PASSWORD)
```

## Preuves à capturer pour le dossier (annexes)
- [ ] Prometheus → **Status → Targets** : toutes les sondes en `UP`
- [ ] Grafana : dashboards Node Exporter / Spring Boot / MongoDB peuplés
- [ ] Prometheus → **Alerts** : règles chargées (état `inactive`/`firing`)
- [ ] **Test réel** : arrêter le backend (`docker stop <backend>`) → capture de l'alerte
      `BackendDown` reçue dans Discord → redémarrage → capture de la notif de résolution
- [ ] `alertmanager.yml` + `alerts.yml` (extraits commentés) dans le dossier
