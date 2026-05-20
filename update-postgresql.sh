#!/bin/bash

echo "🔄 Updating PostgreSQL..."

# Update package list
sudo apt update

# Upgrade PostgreSQL
sudo apt upgrade postgresql postgresql-contrib -y

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
