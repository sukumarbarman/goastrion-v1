# 🚀 GoAstrion Deployment & Rollback Guide

**Location:** `/srv/goastrion/deploy.sh`  
**Environment:** Ubuntu 20.04+ / systemd-based server  
**Services:**
- `goastrion-gunicorn` → Django backend  
- `goastrion-frontend` → Next.js frontend  

---

## ⚙️ 1. Server Layout

| Component | Path | Description |
|------------|------|-------------|
| Root directory | `/srv/goastrion` | Main app folder |
| Git repos | `/srv/goastrion/repo/` | Both backend & frontend live here |
| Backend repo | `/srv/goastrion/repo/goastrion-backend` | Django + REST API |
| Frontend repo | `/srv/goastrion/repo/goastrion-frontend` | Next.js + Tailwind + TypeScript |
| Python venv | `/srv/goastrion/venv` | Backend virtual environment |
| Helper scripts | `/srv/goastrion/release/ensure_port_free.sh` | Frees ports (kills stale Next.js) |
| Deploy state | `/srv/goastrion/.deploy_state` | Tracks last deployed commit |
| Deployment script | `/srv/goastrion/deploy.sh` | Main orchestrator |
| Logs (systemd) | `/var/log/syslog` + `journalctl` | Persistent logs via systemd |

---

## 🌐 2. Network & Service Overview

| Component | Service | Port | Host | URL / Proxy |
|------------|----------|------|------|--------------|
| **Frontend (Next.js)** | `goastrion-frontend.service` | `3001/tcp` | `127.0.0.1` | Nginx reverse-proxies to `https://goastrion.com` |
| **Backend (Django Gunicorn)** | `goastrion-gunicorn.service` | `8001/tcp` | `127.0.0.1` | Accessed via `/api/...` through Nginx |
| **Public site** | *(Nginx virtual host)* | `443/tcp` | `0.0.0.0` | Serves HTTPS via Let’s Encrypt |
| **Internal API URL** | `BACKEND_URL=http://127.0.0.1:8001` | – | Used by frontend’s server runtime |
| **Public API URL** | `NEXT_PUBLIC_API_BASE=https://api.goastrion.com` | – | Used by browser-side JS |

---

## 🧩 3. Environment Variables

### 🌍 Global Variables
| Variable | Typical Value | Used By |
|-----------|----------------|---------|
| `NODE_ENV` | `production` | Frontend |
| `NEXT_TELEMETRY_DISABLED` | `1` | Frontend |
| `NEXT_PUBLIC_API_BASE` | `https://api.goastrion.com` | Frontend |
| `BACKEND_URL` | `http://127.0.0.1:8001` | Frontend SSR calls |
| `NEXT_PUBLIC_SITE_URL` | `https://goastrion.com` | Frontend (canonical site) |
| `NEXTAUTH_URL` | `https://goastrion.com` | Auth redirects |
| `DJANGO_SETTINGS_MODULE` | `goastrion_backend.settings` | Backend |
| `DATABASE_URL` | `postgres://user:pass@localhost:5432/goastrion` | Backend |
| `SECRET_KEY` | `<secure key>` | Backend |
| `ALLOWED_HOSTS` | `["goastrion.com", "localhost"]` | Backend |
| `TIME_ZONE` | `Asia/Kolkata` | Backend |

---

## 🧱 4. Systemd Service Files

### 🟦 `/etc/systemd/system/goastrion-gunicorn.service`
```ini
[Unit]
Description=GoAstrion Backend (Django + Gunicorn)
After=network-online.target

[Service]
Type=simple
User=apps
Group=apps
WorkingDirectory=/srv/goastrion/repo/goastrion-backend
Environment=DJANGO_SETTINGS_MODULE=goastrion_backend.settings
Environment=PYTHONUNBUFFERED=1
ExecStart=/srv/goastrion/venv/bin/gunicorn goastrion_backend.wsgi:application --bind 127.0.0.1:8001 --workers 4 --timeout 90
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### 🟩 `/etc/systemd/system/goastrion-frontend.service`
```ini
[Unit]
Description=GoAstrion Frontend (Next.js)
After=network-online.target

[Service]
Type=simple
User=apps
Group=apps
WorkingDirectory=/srv/goastrion/repo/goastrion-frontend
Environment=NODE_ENV=production
Environment=NEXT_TELEMETRY_DISABLED=1
Environment=PORT=3001
Environment=HOST=127.0.0.1
Environment=NEXT_PUBLIC_API_BASE=https://api.goastrion.com
Environment=BACKEND_URL=http://127.0.0.1:8001
Environment=NEXT_PUBLIC_SITE_URL=https://goastrion.com
Environment=NEXTAUTH_URL=https://goastrion.com

ExecStartPre=/usr/bin/env bash -lc 'if [ ! -f .next/BUILD_ID ]; then npm ci && npm run build; fi'
ExecStartPre=/usr/bin/env bash /srv/goastrion/release/ensure_port_free.sh
ExecStart=/usr/bin/env bash -lc 'cd /srv/goastrion/repo/goastrion-frontend && ./node_modules/.bin/next start -p 3001 -H 127.0.0.1'
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

---

## 🚀 5. Deployment

### Deploy latest master
```bash
cd /srv/goastrion
./deploy.sh
```

---

## ♻️ 6. Rollback
```bash
cd /srv/goastrion
ROLLBACK=true ./deploy.sh
```

---

## 🧰 7. Manual Checks
```bash
sudo systemctl status goastrion-gunicorn --no-pager
sudo systemctl status goastrion-frontend --no-pager
sudo ss -ltnp | grep 8001
sudo ss -ltnp | grep 3001
sudo journalctl -u goastrion-gunicorn -n 30 --no-pager
sudo journalctl -u goastrion-frontend -n 30 --no-pager
```

---

## ⚡ 8. Quick Reference
```bash
./deploy.sh                    # Normal deploy
ROLLBACK=true ./deploy.sh      # Rollback previous build
SKIP_SMOKE=1 ./deploy.sh       # Skip smoke test
BRANCH=feature/astro ./deploy.sh  # Custom branch
```

---

**Author:** GoAstrion DevOps  
**Maintainer:** `ubuntu@ip-172-31-29-104`  
**Last Updated:** October 2025  
