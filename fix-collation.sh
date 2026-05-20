#!/bin/bash

# Fix PostgreSQL collation version mismatch

echo "Fixing PostgreSQL collation version mismatch..."

# Run as postgres user
sudo -u postgres psql << EOF
-- Fix template1 database
ALTER DATABASE template1 REFRESH COLLATION VERSION;

-- Fix template0 database
ALTER DATABASE template0 REFRESH COLLATION VERSION;

-- Fix postgres database
ALTER DATABASE postgres REFRESH COLLATION VERSION;

-- Reindex system catalogs
REINDEX DATABASE template1;
REINDEX DATABASE postgres;

-- Now create the loan_management database
CREATE DATABASE loan_management;

-- Verify
\l loan_management

EOF

echo "✅ Collation fixed and loan_management database created!"
