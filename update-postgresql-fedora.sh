#!/bin/bash

echo "🔄 Updating PostgreSQL on Fedora..."

# Update package list
sudo dnf check-update

# Upgrade PostgreSQL
sudo dnf upgrade postgresql postgresql-server postgresql-contrib -y

# Restart PostgreSQL service
sudo systemctl restart postgresql

# Check version
echo ""
echo "✅ PostgreSQL updated successfully!"
echo ""
echo "Current PostgreSQL version:"
psql --version

echo ""
echo "PostgreSQL service status:"
sudo systemctl status postgresql --no-pager -l
