#!/usr/bin/env bash
# FlyDea SSL Setup — Certbot + Nginx + Auto-renew
# Uso: ./setup-ssl.sh <domain> [email]
# Example: ./setup-ssl.sh flydea.com.br admin@flydea.com.br
set -euo pipefail

DOMAIN="${1:-}"
EMAIL="${2:-admin@flydea.dev}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$(SCRIPT_DIR/../.." && pwd)"

[ -z "$DOMAIN" ] && echo "Uso: ./setup-ssl.sh <domain> [email]" && exit 1

echo "[ssl] Installing certbot..."
sudo apt-get update -qq
sudo apt-get install -y -qq certbot python3-certbot-nginx

echo "[ssl] Obtaining certificate for $DOMAIN..."
sudo certbot --nginx \
  --non-interactive \
  --agree-tos \
  --email "$EMAIL" \
  --domains "$DOMAIN" \
  --redirect

echo "[ssl] Testing auto-renew..."
sudo certbot renew --dry-run

# Add cron for auto-renewal (certbot adds this by default, but ensure it's there)
CRON_EXISTS=$(sudo crontab -l 2>/dev/null | grep -c "certbot renew" || true)
if [ "$CRON_EXISTS" -eq 0 ]; then
  echo "[ssl] Adding certbot renewal to cron (daily)..."
  (sudo crontab -l 2>/dev/null; echo "0 3 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx") | sudo crontab -
fi

echo "[ssl] Done! Certificate installed and auto-renew configured."
echo "[ssl] Domain: https://$DOMAIN"
