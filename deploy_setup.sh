#!/usr/bin/env bash
# deploy_setup.sh – first-time setup and redeploy for the SCIEnT website.
#
# Stack (all in Docker; nothing is installed on the host except Docker):
#   frontend  React (CRA) build served by nginx      docker-compose.yml
#   backend   Express API, Node 22                   docker-compose.yml
#   db        MongoDB 8 (named volume db-data)       docker-compose.yml
#   nginx     public reverse proxy, port 6600        nginx/compose.yaml
# Dependencies (npm ci) and the frontend build run inside the Docker builds.
# MongoDB is used through Mongoose, so there are no schema migrations to run.
#
# Usage: ./deploy_setup.sh [--seed] [--force-team-seed] [--with-tools] [--no-build] [--help]

set -euo pipefail

# ── Settings ──────────────────────────────────────────────────────────────────
PUBLIC_PORT="${PUBLIC_PORT:-6600}"    # host port published by nginx/compose.yaml
NETWORK="scient-network"
DB_WAIT_SECONDS=120
APP_WAIT_SECONDS=120

RUN_SEED=false
FORCE_TEAM_SEED=false
WITH_TOOLS=false
DO_BUILD=true

# ── Output helpers ────────────────────────────────────────────────────────────
if [[ -t 1 ]]; then
  C_INFO='\033[0;36m' C_OK='\033[0;32m' C_WARN='\033[0;33m' C_ERR='\033[0;31m' C_OFF='\033[0m'
else
  C_INFO='' C_OK='' C_WARN='' C_ERR='' C_OFF=''
fi
info() { echo -e "${C_INFO}[INFO]${C_OFF} $*"; }
ok()   { echo -e "${C_OK}[ OK ]${C_OFF} $*"; }
warn() { echo -e "${C_WARN}[WARN]${C_OFF} $*" >&2; }
die()  { echo -e "${C_ERR}[FAIL]${C_OFF} $*" >&2; exit 1; }
step() { echo; echo -e "${C_INFO}==>${C_OFF} $*"; }

on_error() {
  local code=$? line=$1
  echo -e "${C_ERR}[FAIL]${C_OFF} deploy_setup.sh stopped at line ${line} (exit ${code})." >&2
  echo "       Inspect with: docker compose ps && docker compose logs --tail=50" >&2
}
trap 'on_error $LINENO' ERR

usage() {
  cat <<'EOF'
Usage: ./deploy_setup.sh [options]

  --seed              Seed data after deploy: BPCL inventory tools (skips existing
                      tools) and team members (only if the collection is empty).
  --force-team-seed   With --seed, run the team seed even if members exist. It
                      overwrites matching members with the seed file's values,
                      including photos uploaded through the admin portal.
  --with-tools        Also start mongo-express on 127.0.0.1:8081 (SSH tunnel only).
  --no-build          Restart with the existing images instead of rebuilding.
  -h, --help          Show this help.

Environment: PUBLIC_PORT (default 6600) must match nginx/compose.yaml.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --seed) RUN_SEED=true ;;
    --force-team-seed) FORCE_TEAM_SEED=true ;;
    --with-tools) WITH_TOOLS=true ;;
    --no-build) DO_BUILD=false ;;
    -h|--help) usage; exit 0 ;;
    *) usage; die "Unknown option: $1" ;;
  esac
  shift
done

cd "$(dirname "$(readlink -f "$0")")"
APP_DIR="$(pwd)"

compose() {
  if [[ "$WITH_TOOLS" == true ]]; then
    docker compose --profile tools "$@"
  else
    docker compose "$@"
  fi
}

# Read KEY from an env file without sourcing it (values may contain spaces/quotes)
env_get() {
  local file=$1 key=$2 line val
  line=$(grep -E "^[[:space:]]*${key}[[:space:]]*=" "$file" | tail -n 1 || true)
  val=${line#*=}
  val=${val#"${val%%[![:space:]]*}"}
  val=${val%"${val##*[![:space:]]}"}
  val=${val#\"}; val=${val%\"}
  val=${val#\'}; val=${val%\'}
  printf '%s' "$val"
}

is_placeholder() {
  [[ -z "$1" || "$1" == your_* || "$1" == change_me* || "$1" == *'\n...\n'* ]]
}

# ── 1. Host prerequisites ─────────────────────────────────────────────────────
step "Checking host prerequisites"
info "App directory: ${APP_DIR}"

for f in docker-compose.yml Dockerfile server/Dockerfile nginx/compose.yaml nginx/nginx.conf \
         package.json package-lock.json server/package.json server/package-lock.json; do
  [[ -f "$f" ]] || die "Missing ${f}. Upload the full contents of deploy/scient/ to ${APP_DIR}."
done
if [[ -d node_modules || -d server/node_modules ]]; then
  warn "node_modules/ was uploaded. It is not used (Docker installs dependencies) and can be deleted."
fi

command -v docker >/dev/null 2>&1 || die "Docker is not installed. Install Docker Engine: https://docs.docker.com/engine/install/"
docker compose version >/dev/null 2>&1 || die "Docker Compose v2 plugin is missing (the 'docker compose' command)."
docker info >/dev/null 2>&1 || die "Cannot talk to the Docker daemon. Start it (sudo systemctl start docker) or add this user to the 'docker' group."
command -v curl >/dev/null 2>&1 || die "curl is required for the final health check (apt install curl / dnf install curl)."
ok "Docker $(docker version --format '{{.Server.Version}}'), $(docker compose version --short 2>/dev/null || echo 'compose v2')"

# ── 2. Environment files ──────────────────────────────────────────────────────
step "Validating environment files"

[[ -f .env ]] || die ".env not found. Create it: cp .env.example .env && nano .env  (set MONGO_ROOT_USERNAME / MONGO_ROOT_PASSWORD)"
[[ -f server/.env ]] || die "server/.env not found. Create it: cp server/.env.example server/.env && nano server/.env"

missing=()
for key in MONGO_ROOT_USERNAME MONGO_ROOT_PASSWORD; do
  if is_placeholder "$(env_get .env "$key")"; then missing+=(".env: ${key}"); fi
done
if [[ "$WITH_TOOLS" == true ]] && is_placeholder "$(env_get .env ME_BASICAUTH_PASSWORD)"; then
  missing+=(".env: ME_BASICAUTH_PASSWORD")
fi

# Required by the backend: admin login, image uploads (Cloudinary + Firebase)
REQUIRED_SERVER_KEYS=(
  JWT_SECRET
  CLOUD_NAME CLOUD_API_KEY CLOUD_API_SECRET
  FIREBASE_PROJECT_ID FIREBASE_CLIENT_EMAIL FIREBASE_PRIVATE_KEY FIREBASE_STORAGE_BUCKET
)
# Optional: features degrade without them but the app still runs
OPTIONAL_SERVER_KEYS=(
  "RESEND_API_KEY|admin password-reset OTP emails are not sent"
  "RESEND_FROM_EMAIL|OTP emails use the default sender"
  "CLIENT_EMAIL|Inventive/Contrive form submissions to Google Sheets fail"
  "PRIVATE_KEY|Inventive/Contrive form submissions to Google Sheets fail"
)

for key in "${REQUIRED_SERVER_KEYS[@]}"; do
  if is_placeholder "$(env_get server/.env "$key")"; then missing+=("server/.env: ${key}"); fi
done
if (( ${#missing[@]} > 0 )); then
  printf '       - %s\n' "${missing[@]}" >&2
  die "Required environment values are missing or still placeholders (listed above)."
fi

for entry in "${OPTIONAL_SERVER_KEYS[@]}"; do
  key=${entry%%|*}
  if is_placeholder "$(env_get server/.env "$key")"; then warn "server/.env: ${key} not set; ${entry#*|}."; fi
done

jwt=$(env_get server/.env JWT_SECRET)
if (( ${#jwt} < 32 )); then warn "JWT_SECRET is shorter than 32 characters. Generate one with: openssl rand -hex 32"; fi
if [[ -n "$(env_get server/.env MONGO_URI_ATLAS)" ]]; then
  warn "MONGO_URI_ATLAS is set in server/.env, so the backend uses Atlas instead of the db container."
fi

chmod 600 .env server/.env
ok "Environment files present; permissions set to 600"

# ── 3. Docker network ─────────────────────────────────────────────────────────
step "Preparing Docker network"
if docker network inspect "$NETWORK" >/dev/null 2>&1; then
  ok "Network ${NETWORK} exists"
else
  docker network create "$NETWORK" >/dev/null
  ok "Created network ${NETWORK}"
fi

compose config -q || die "docker-compose.yml failed validation (see above)."

# ── 4. Install dependencies and build ─────────────────────────────────────────
if [[ "$DO_BUILD" == true ]]; then
  step "Building images (npm ci + React production build run inside Docker)"
  compose build --pull
  ok "Images built"
else
  info "Skipping build (--no-build)"
fi

# ── 5. Database ───────────────────────────────────────────────────────────────
step "Starting MongoDB"
compose up -d db

db_id=$(compose ps -q db)
[[ -n "$db_id" ]] || die "db container did not start."
info "Waiting up to ${DB_WAIT_SECONDS}s for MongoDB to report healthy..."
deadline=$((SECONDS + DB_WAIT_SECONDS))
until [[ "$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{end}}' "$db_id")" == "healthy" ]]; do
  (( SECONDS < deadline )) || { compose logs --tail=40 db >&2; die "MongoDB did not become healthy."; }
  sleep 3
done
ok "MongoDB is healthy"

# Credentials in .env only apply when the db-data volume is first created;
# check they still match the existing database.
if ! compose exec -T db sh -c \
  'mongosh --quiet -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --eval "db.adminCommand({ ping: 1 }).ok"' \
  >/dev/null 2>&1; then
  die "MongoDB rejected MONGO_ROOT_USERNAME/MONGO_ROOT_PASSWORD from .env. The db-data volume keeps the credentials it was created with; restore those in .env."
fi
ok "MongoDB authentication works"

info "Migrations: none. Mongoose creates collections and indexes when the backend starts."

# ── 6. Application ────────────────────────────────────────────────────────────
step "Starting backend and frontend"
compose up -d --remove-orphans
ok "Application containers started"

step "Starting public nginx proxy (port ${PUBLIC_PORT})"
docker compose -f nginx/compose.yaml up -d
nginx_id=$(docker compose -f nginx/compose.yaml ps -q nginx)
[[ -n "$nginx_id" ]] || die "nginx container did not start."
docker exec "$nginx_id" nginx -t >/dev/null 2>&1 || { docker exec "$nginx_id" nginx -t; die "nginx/nginx.conf is invalid."; }
docker exec "$nginx_id" nginx -s reload >/dev/null
ok "nginx config valid and reloaded"

# ── 7. Verification ───────────────────────────────────────────────────────────
step "Verifying the deployment"
base="http://127.0.0.1:${PUBLIC_PORT}"
deadline=$((SECONDS + APP_WAIT_SECONDS))
frontend_ok=false
api_ok=false
while (( SECONDS < deadline )); do
  if [[ "$frontend_ok" != true ]] && curl -fsS -o /dev/null "${base}/"; then frontend_ok=true; fi
  if [[ "$api_ok" != true ]] && curl -fsS -o /dev/null "${base}/api/clubs"; then api_ok=true; fi
  if [[ "$frontend_ok" == true && "$api_ok" == true ]]; then break; fi
  sleep 3
done

[[ "$frontend_ok" == true ]] || { compose logs --tail=40 frontend >&2; die "Frontend did not respond at ${base}/"; }
ok "Frontend responds at ${base}/"
[[ "$api_ok" == true ]] || { compose logs --tail=60 backend >&2; die "API did not respond at ${base}/api/clubs"; }
ok "API responds at ${base}/api/clubs"

# ── 8. Seed data (optional) ───────────────────────────────────────────────────
if [[ "$RUN_SEED" == true ]]; then
  step "Seeding data"

  info "BPCL inventory tools (existing tools are skipped)..."
  compose exec -T backend node scripts/seedBpclTools.js
  ok "BPCL tools seeded"

  members=$(compose exec -T db sh -c \
    'mongosh --quiet -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin scient --eval "db.teammembers.countDocuments()"' \
    | tr -dc '0-9')
  members=${members:-0}
  if [[ "$members" == "0" || "$FORCE_TEAM_SEED" == true ]]; then
    info "Team members (${members} existing)..."
    compose exec -T backend node scripts/seedTeamMembers.js
    ok "Team members seeded"
  else
    warn "Skipped team seed: ${members} team members already exist and the seed would overwrite admin edits. Use --force-team-seed to run it anyway."
  fi
else
  info "Seeding skipped (pass --seed on the first deploy to load initial data)."
fi

# ── Summary ───────────────────────────────────────────────────────────────────
step "Deployment status"
compose ps
docker compose -f nginx/compose.yaml ps
echo
ok "SCIEnT is live on port ${PUBLIC_PORT}: ${base}/"
if [[ "$WITH_TOOLS" == true ]]; then
  info "mongo-express: ssh -L 8081:127.0.0.1:8081 <user>@<server>, then open http://localhost:8081"
fi
info "Logs: docker compose logs -f backend    Stop: docker compose down && docker compose -f nginx/compose.yaml down"
