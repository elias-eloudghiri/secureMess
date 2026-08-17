# Dashboards à déposer ici (fichiers .json)

Grafana provisionne automatiquement tout `.json` de ce dossier.
Deux options :

## Option A — Import par ID (le plus rapide pour le dossier)
Dans Grafana : **Dashboards → New → Import → coller l'ID → Load**, choisir la datasource Prometheus.

| Dashboard                         | ID Grafana.com | Couvre                          |
|-----------------------------------|----------------|---------------------------------|
| Node Exporter Full                | `1860`         | CPU / RAM / disque / réseau VPS |
| Spring Boot (Micrometer)          | `12900`        | JVM, HTTP, latence, erreurs     |
| MongoDB (Percona)                 | `2583`         | Connexions, ops/s, mémoire      |
| Prometheus Blackbox Exporter      | `13659`        | Disponibilité HTTPS + expiry TLS|

## Option B — Provisioning versionné
Exporter chaque dashboard (Share → Export → Save to file), déposer le `.json` ici,
puis commit. Avantage : reproductible et traçable (bon pour le dossier BC04).
