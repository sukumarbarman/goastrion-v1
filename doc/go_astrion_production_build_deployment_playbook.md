# GoAstrion – Production Build & Deployment Playbook

> **Purpose**: This document is the *single source of truth* for building, deploying, and debugging GoAstrion in production.  
> Follow this step-by-step to avoid environment, PM2, and Next.js App Router issues.

---

## 1. Architecture Overview (IMPORTANT)

GoAstrion uses a **3-layer architecture**:

### 1️⃣ Browser (Client-side)
- Runs React code
- Uses **public environment variables only**
- Never accesses backend directly

### 2️⃣ Frontend Server (Next.js App Router)
- Runs via **PM2 + `next start`**
- Hosts:
  - SSR pages
  - Route handlers (`app/api/*`)
- Proxies requests to Django backend

### 3️⃣ Backend Server (Django)
- Runs via **systemd**
- Listens on `127.0.0.1:8001`

---

## 2. Environment Variables – Canonical Truth

### 🔹 A. Browser / Build-time (PUBLIC)

**File (source of truth):**
```
/srv/goastrion/config/frontend.env
```

```env
NODE_ENV=production
PORT=3001

NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://goastrion.com
NEXT_PUBLIC_API_BASE=https://goastrion.com
```

Rules:
- Must start with `NEXT_PUBLIC_`
- Available to browser + build
- Safe to expose

---

### 🔹 B. Server-only (PRIVATE)

**Used by:** Next.js route handlers (`app/api/*`)

```env
BACKEND_URL=http://127.0.0.1:8001
```

Rules:
- ❌ Never prefixed with `NEXT_PUBLIC_`
- ❌ Never put in `frontend.env`
- ✅ Must exist at **BUILD TIME + RUNTIME**

---

## 3. PM2 Configuration (MANDATORY)

### ❗ NEVER run GoAstrion frontend via `npm start` in PM2

Reason:
- `npm` does **not forward env vars reliably**

### ✅ Correct PM2 ecosystem file

**File:**
```
/srv/goastrion/pm2/ecosystem.goastrion.config.js
```

```js
module.exports = {
  apps: [
    {
      name: "goastrion-frontend",
      cwd: "/srv/goastrion/repo/goastrion-frontend",
      script: "node_modules/.bin/next",
      args: "start -p 3001",
      env: {
        NODE_ENV: "production",
        BACKEND_URL: "http://127.0.0.1:8001",
      },
    },
  ],
};
```

---

## 4. Correct Production Build Process (CRITICAL)

### ❗ App Router rule
> **Route handlers read `process.env` at BUILD TIME**

So `BACKEND_URL` **MUST be present during `next build`**.

---

### ✅ Canonical build steps

```bash
cd /srv/goastrion/repo/goastrion-frontend

# Inject server-only env for build
export BACKEND_URL=http://127.0.0.1:8001

# Build
npx cross-env NEXT_USE_TURBOPACK=0 next build
```

---

## 5. Starting / Restarting Frontend

```bash
pm2 delete goastrion-frontend
pm2 start /srv/goastrion/pm2/ecosystem.goastrion.config.js
pm2 save
```

---

## 6. Verification Checklist (ALWAYS DO THIS)

### 1️⃣ Check PM2 process
```bash
pm2 list
```

### 2️⃣ Verify runtime env
```bash
pm2 exec goastrion-frontend -- printenv | grep BACKEND_URL
```
Expected:
```
BACKEND_URL=http://127.0.0.1:8001
```

### 3️⃣ Test API routes
```bash
curl -i http://127.0.0.1:3001/api/shubhdin
```
Expected:
- `200 OK` or `405 Method Not Allowed`
- ❌ NOT `500`

---

## 7. Common Errors & Exact Fixes

### ❌ Error: `BACKEND_URL is not defined`

**Cause:**
- Missing at build time

**Fix:**
```bash
export BACKEND_URL=http://127.0.0.1:8001
next build
```

---

### ❌ Warning: `No NEXT_PUBLIC_API_BASE set`

**Cause:**
- Missing browser env

**Fix:**
Add to `frontend.env`:
```env
NEXT_PUBLIC_API_BASE=https://goastrion.com
```
Rebuild.

---

### ❌ `/api/*` returns 500

**Cause:**
- Env not wired into PM2 OR build

**Fix:**
- Use ecosystem file
- Rebuild with BACKEND_URL

---

## 8. Robots & Sitemap (FYI)

- Sitemap URL: `https://goastrion.com/sitemap.xml`
- Source file: `app/sitemap.ts`
- Robots source: `app/robots.ts`

XML styling warning is NORMAL.

---

## 9. Golden Rules (PRINT THIS)

1. **Build-time env ≠ runtime env**
2. App Router route handlers need env at build
3. PM2 must run `next start`, not `npm start`
4. `NEXT_PUBLIC_*` → browser
5. `BACKEND_URL` → server only
6. Always rebuild after env change

---

## 10. One-Line Recovery (Emergency)

```bash
export BACKEND_URL=http://127.0.0.1:8001 && next build && pm2 restart goastrion-frontend
```

---

✅ If you follow this doc, **production will never break again due to env issues**.

