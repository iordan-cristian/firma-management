#!/bin/bash
set -e

if [ ! -f .env ]; then
    echo "Error: .env file not found. Copy .env.example to .env and fill in your values."
    exit 1
fi

set -a; source .env; set +a

if [ -z "$DOMAIN" ] || [ -z "$LETSENCRYPT_EMAIL" ]; then
    echo "Error: DOMAIN and LETSENCRYPT_EMAIL must be set in .env"
    exit 1
fi

echo "==> Setting up SSL for $DOMAIN"

# Create a temporary self-signed cert so nginx can start before real certs exist
echo "==> Creating temporary certificate..."
mkdir -p ./certbot/conf/live/$DOMAIN
openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout ./certbot/conf/live/$DOMAIN/privkey.pem \
    -out ./certbot/conf/live/$DOMAIN/fullchain.pem \
    -subj "/CN=$DOMAIN" 2>/dev/null

# Start nginx with the dummy cert so it can serve the ACME challenge
echo "==> Starting nginx..."
docker compose up -d frontend
sleep 5

# Remove the dummy cert
rm -rf ./certbot/conf/live/$DOMAIN

# Get the real certificate from Let's Encrypt
echo "==> Requesting Let's Encrypt certificate..."
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path /var/www/certbot \
    --email "$LETSENCRYPT_EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN"

# Reload nginx to pick up the real cert
echo "==> Reloading nginx..."
docker compose exec frontend nginx -s reload

# Start remaining services
echo "==> Starting all services..."
docker compose up -d

echo ""
echo "Done! Your app is live at https://$DOMAIN"
echo ""
echo "Certificates renew automatically every 12 hours."
echo "After each renewal, reload nginx with:"
echo "  docker compose exec frontend nginx -s reload"
echo ""
echo "To automate reloads, add this to the server's crontab (crontab -e):"
echo "  0 3 1 * * cd $(pwd) && docker compose exec frontend nginx -s reload"