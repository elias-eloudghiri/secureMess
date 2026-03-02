# Instructions de Lancement

Ce repository contient le code source pour le frontend, le backend et la configuration de la base de données.

## Lancer l'app en prod

Utilise l'environnement de production en construisant les images via les Dockerfiles à chaque lancement (pas de liaisons avec les sources de la machine hôte) :

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## Lancer l'app en dev

Utilise l'environnement de développement, qui relie directement le `.jar` du backend et le dossier `dist/` du frontend de votre machine hôte, ce qui évite de reconstruire l'image Docker entièrement :

```bash
# Assurez-vous d'avoir build le projet sur votre machine au préalable :
cd backend && mvn clean package -DskipTests && cd ..
cd front && npm run build && cd ..

# Lancez l'environnement de dev :
docker compose -f docker-compose.dev.yml up -d
```

### Lancement manuel depuis l'hôte : MongoDB seul

Idéal pour lancer les applications backend et frontend manuellement via votre IDE ou vos terminaux :

```bash
docker compose -f docker-compose.dev.yml up -d mongodb
```

### Backend (en manuel sur l'hôte)

```bash
cd backend
mvn spring-boot:run
```

### Frontend (en manuel sur l'hôte)

```bash
cd front
npm run dev
```
