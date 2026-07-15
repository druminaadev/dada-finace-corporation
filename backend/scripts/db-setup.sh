#!/usr/bin/env bash
# =============================================================================
# scripts/db-setup.sh
# Dada Finance Corporation — Full Database Setup (All 3 Phases)
#
# Usage:
#   ./scripts/db-setup.sh                    # Full setup (all phases)
#   ./scripts/db-setup.sh --phase 1          # Run only phase 1
#   ./scripts/db-setup.sh --phase 2          # Run only phase 2
#   ./scripts/db-setup.sh --phase 3          # Run only phase 3
#   ./scripts/db-setup.sh --seed             # Run seed only
#   ./scripts/db-setup.sh --reset            # DROP and recreate (dev only!)
# =============================================================================

set -euo pipefail

# ─── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'

log()     { echo -e "${BLUE}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }
header()  { echo -e "\n${CYAN}══════════════════════════════════════════${NC}"; echo -e "${CYAN}  $*${NC}"; echo -e "${CYAN}══════════════════════════════════════════${NC}"; }

# ─── Load .env ────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  source "$ROOT_DIR/.env"
  set +a
  log "Loaded .env"
else
  warn ".env not found — using environment variables"
fi

# ─── Validate required vars ───────────────────────────────────────────────────
if [ -z "${DATABASE_URL:-}" ]; then
  error "DATABASE_URL is not set. Copy .env.example to .env and configure it."
  exit 1
fi

# Parse DATABASE_URL into psql connection args
# Format: postgresql://user:password@host:port/dbname
DB_USER=$(echo "$DATABASE_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
DB_PASS=$(echo "$DATABASE_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')

export PGPASSWORD="$DB_PASS"

PSQL="psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
MIGRATIONS_DIR="$ROOT_DIR/prisma/migrations"

# ─── Parse arguments ──────────────────────────────────────────────────────────
RUN_PHASE=""
RUN_SEED=false
RUN_RESET=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --phase) RUN_PHASE="$2"; shift 2 ;;
    --seed)  RUN_SEED=true; shift ;;
    --reset) RUN_RESET=true; shift ;;
    *) error "Unknown argument: $1"; exit 1 ;;
  esac
done

# ─── Functions ────────────────────────────────────────────────────────────────

run_migration() {
  local phase="$1"
  local file="$2"
  local label="$3"

  header "Phase $phase: $label"

  if [ ! -f "$file" ]; then
    error "Migration file not found: $file"
    exit 1
  fi

  log "Running: $file"

  # Run inside a transaction — rollback everything if any statement fails
  if $PSQL -v ON_ERROR_STOP=1 --single-transaction -f "$file" 2>&1; then
    success "Phase $phase completed successfully"
  else
    error "Phase $phase FAILED. Transaction rolled back. Database is unchanged."
    exit 1
  fi
}

check_db_connection() {
  log "Testing database connection..."
  if $PSQL -c "SELECT 1" > /dev/null 2>&1; then
    success "Database connection OK (${DB_HOST}:${DB_PORT}/${DB_NAME})"
  else
    error "Cannot connect to database. Check DATABASE_URL."
    exit 1
  fi
}

check_phase_completed() {
  local table="$1"
  $PSQL -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$table')" 2>/dev/null | grep -q 't'
}

# ─── Reset (dev only) ─────────────────────────────────────────────────────────

if [ "$RUN_RESET" = true ]; then
  if [ "${NODE_ENV:-development}" = "production" ]; then
    error "RESET is not allowed in production!"
    exit 1
  fi
  warn "⚠️  RESET MODE: This will DROP all tables and recreate from scratch."
  read -p "Type 'yes' to confirm: " confirm
  if [ "$confirm" != "yes" ]; then
    log "Reset cancelled."
    exit 0
  fi
  log "Dropping all tables..."
  $PSQL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" > /dev/null
  success "Schema reset complete"
fi

# ─── Main execution ───────────────────────────────────────────────────────────

header "Dada Finance — Database Setup"
log "Target: ${DB_HOST}:${DB_PORT}/${DB_NAME}"
log "User:   ${DB_USER}"

check_db_connection

if [ -n "$RUN_PHASE" ]; then
  # Run specific phase only
  case "$RUN_PHASE" in
    1) run_migration 1 "$MIGRATIONS_DIR/phase1_master_users/migration.sql" "Master Data, Users, Sessions, OTP" ;;
    2) run_migration 2 "$MIGRATIONS_DIR/phase2_customers_loans_emi/migration.sql" "Customers, Loans, EMI, Payments" ;;
    3) run_migration 3 "$MIGRATIONS_DIR/phase3_security_audit/migration.sql" "Security, Audit, RLS, Triggers" ;;
    *) error "Invalid phase: $RUN_PHASE. Use 1, 2, or 3."; exit 1 ;;
  esac
elif [ "$RUN_SEED" = true ]; then
  log "Running seed only..."
else
  # Full setup — run all phases in order
  log "Running full setup (all 3 phases)..."

  # Phase 1 — only if not already done
  if check_phase_completed "users"; then
    warn "Phase 1 already applied (users table exists) — skipping"
  else
    run_migration 1 "$MIGRATIONS_DIR/phase1_master_users/migration.sql" "Master Data, Users, Sessions, OTP"
  fi

  # Phase 2 — only if not already done
  if check_phase_completed "customers"; then
    warn "Phase 2 already applied (customers table exists) — skipping"
  else
    run_migration 2 "$MIGRATIONS_DIR/phase2_customers_loans_emi/migration.sql" "Customers, Loans, EMI, Payments"
  fi

  # Phase 3 — only if not already done
  if check_phase_completed "audit_logs"; then
    warn "Phase 3 already applied (audit_logs table exists) — skipping"
  else
    run_migration 3 "$MIGRATIONS_DIR/phase3_security_audit/migration.sql" "Security, Audit, RLS, Triggers"
  fi
fi

# ─── Seed ─────────────────────────────────────────────────────────────────────

if [ "$RUN_SEED" = true ] || [ -z "$RUN_PHASE" ]; then
  header "Seeding Database"
  log "Running Prisma seed..."
  cd "$ROOT_DIR"
  if node prisma/seed.js; then
    success "Seed completed"
  else
    error "Seed failed"
    exit 1
  fi
fi

# ─── Generate Prisma Client ───────────────────────────────────────────────────

header "Generating Prisma Client"
cd "$ROOT_DIR"
if npx prisma generate; then
  success "Prisma client generated"
else
  error "Prisma generate failed"
  exit 1
fi

# ─── Summary ──────────────────────────────────────────────────────────────────

header "Setup Complete ✓"
echo ""
echo -e "  ${GREEN}✓${NC} Phase 1: Master data, Users, Sessions, OTP"
echo -e "  ${GREEN}✓${NC} Phase 2: Customers, Loans, EMI, Payments, Documents"
echo -e "  ${GREEN}✓${NC} Phase 3: Audit log, DB roles, RLS, Security triggers"
echo -e "  ${GREEN}✓${NC} Seed data loaded"
echo -e "  ${GREEN}✓${NC} Prisma client generated"
echo ""
echo -e "  ${YELLOW}Next steps:${NC}"
echo -e "  1. Update DB role passwords in Phase 3 migration"
echo -e "  2. Set SEED_*_PASSWORD env vars before running seed in production"
echo -e "  3. Run: npm run dev"
echo ""
