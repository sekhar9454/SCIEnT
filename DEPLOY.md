# Deploying SCIEnT

The site runs as four Docker containers on one network: `frontend` (React build served by nginx), `backend` (Express API), `db` (MongoDB) and `nginx` (public reverse proxy on port 6600).

## 1. Build the upload folder (on your machine)

```bash
git status                      # commit everything you want deployed first
./scripts/make-deploy-bundle.sh # creates deploy/scient/
```

Upload the **contents** of `deploy/scient/` to the server, e.g. `/opt/scient`. The bundle never contains `node_modules`, `build/`, `.git`, database dumps or `.env` files, and the script stops if it finds a private key.

## 2. Create the secrets (on the server, first deploy only)

```bash
cd /opt/scient

cp .env.example .env                 # Mongo root user/password for compose
cp server/.env.example server/.env   # JWT, email, Google, Cloudinary, Firebase, Resend
nano .env                            # MONGO_ROOT_PASSWORD: openssl rand -hex 24
nano server/.env                     # leave MONGO_URI_ATLAS unset to use the db container
chmod 600 .env server/.env
```

`MONGO_ROOT_*` is only applied when the `db-data` volume is first created. If the volume already exists, keep the password it was created with, or change it inside Mongo with `mongosh`.

## 3. Build and start

```bash
docker network create scient-network 2>/dev/null || true
docker compose build --pull
docker compose up -d
docker compose -f nginx/compose.yaml up -d
```

## 4. Check it works

```bash
docker compose ps                                  # db shows "healthy", others "running"
docker compose logs backend --tail=30              # "Connected to ..." and "Server running on port 3001"
curl -fsS http://localhost:6600/ | head -c 200     # React index.html
curl -fsS http://localhost:6600/api/clubs | head -c 200
```

## Updating

Rebuild the bundle, upload it over the old files (your `.env` files are not in the bundle, so they stay), then run:

```bash
docker compose up -d --build
```

## Database admin UI (optional)

mongo-express is not publicly reachable. Start it on demand and open it through an SSH tunnel:

```bash
docker compose --profile tools up -d db-client      # on the server
ssh -L 8081:127.0.0.1:8081 user@server              # on your machine → http://localhost:8081
```

## Seeding

The seed endpoints (`/api/clubs/projects`, `/api/clubs/seedclubs`, `/api/team/seed`) require an admin token. To seed team members from the server:

```bash
docker compose exec backend node scripts/seedTeamMembers.js
```
