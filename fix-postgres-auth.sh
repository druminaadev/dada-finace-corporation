#!/bin/bash

# Fix PostgreSQL authentication for postgres user

echo "Fixing PostgreSQL authentication..."

# Backup pg_hba.conf
sudo cp /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/pg_hba.conf.backup

# Change peer to md5 for local connections
sudo sed -i 's/local   all             postgres                                peer/local   all             postgres                                md5/' /etc/postgresql/*/main/pg_hba.conf

# Restart PostgreSQL
sudo systemctl restart postgresql

echo "✅ PostgreSQL authentication updated to md5"
echo "Now set postgres password:"
echo "sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'your_password';\""
