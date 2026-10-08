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

## 3. Build, start and verify

```bash
chmod +x deploy_setup.sh
./deploy_setup.sh --seed      # first deploy: also loads initial data
```

The script checks Docker and both `.env` files, creates the Docker network, builds the images (dependencies and the React build are installed inside Docker), waits for MongoDB, starts everything, and checks that the site and `/api/clubs` respond on port 6600. It stops with a red `[FAIL]` line explaining what to fix. `./deploy_setup.sh --help` lists the options.

There are no database migrations: MongoDB is used through Mongoose, which creates collections and indexes on startup.

## Updating

Rebuild the bundle, upload it over the old files (your `.env` files are not in the bundle, so they stay), then run:

```bash
./deploy_setup.sh
```

## Database admin UI (optional)

mongo-express is not publicly reachable. Start it on demand and open it through an SSH tunnel:

```bash
./deploy_setup.sh --with-tools --no-build             # on the server
ssh -L 8081:127.0.0.1:8081 user@server              # on your machine → http://localhost:8081
```

## Seeding

`--seed` loads the BPCL inventory tools (existing tools are skipped) and the team members, but the team seed runs only while the `teammembers` collection is empty, because it overwrites matching members with the seed file's values, including photos uploaded in the admin portal. `--force-team-seed` runs it anyway.

The seed HTTP endpoints (`/api/clubs/projects`, `/api/clubs/seedclubs`, `/api/team/seed`) require an admin token.
