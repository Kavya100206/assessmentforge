# Deployment guide

Deploys the backend to **Render** and the frontend to **Vercel**. Both have a free tier that's enough for the assignment.

Total time: **~30 minutes** the first time, most of it waiting on builds.

---

## Before you start

### 1. Rotate any secrets that were exposed during development

If you ever pasted real credentials into a chat / log / screenshot during this build, regenerate them now before they go into production env vars:

- **Mongo Atlas password** — Database Access → Edit user → Edit password.
- **Redis password** — Upstash / Redis Cloud dashboard → Database → Reset password.
- **Groq API key** — <https://console.groq.com/keys> → revoke the old key, create a new one.

Update `backend/.env` locally so you can re-test before deploying.

### 2. Open Mongo Atlas to inbound traffic

Render's outbound IPs are not static on the free tier. Easiest path:

- Atlas → **Network Access** → Add IP Address → **Allow access from anywhere** (`0.0.0.0/0`).

If your org requires tighter rules, use Render's static-outbound-IPs feature (paid) and whitelist those.

### 3. Push the repo to GitHub

Render and Vercel both deploy from a Git repository. If the repo isn't on GitHub yet:

```
cd ai-assessment-creator
git init
git add .
git commit -m "Initial VedaAI build"
gh repo create vedaai --private --source=. --push
```

(or create the repo on github.com manually and `git remote add origin … && git push -u origin main`)

---

## Part 1 — Deploy the backend to Render

1. Go to <https://dashboard.render.com>.
2. **New +** → **Web Service**.
3. Connect your GitHub repo, pick the `vedaai` repo.
4. Fill in the form:

| Field              | Value                                                       |
|--------------------|-------------------------------------------------------------|
| **Name**           | `vedaai-backend` (anything you like)                        |
| **Region**         | Singapore (closest to India) or your nearest region         |
| **Branch**         | `main`                                                      |
| **Root Directory** | `backend`                                                   |
| **Runtime**        | Node                                                        |
| **Build Command**  | `npm install && npm run build`                              |
| **Start Command**  | `npm start`                                                 |
| **Instance Type**  | Free                                                        |

5. Click **Advanced** → add the environment variables below.

### Backend environment variables on Render

| Key              | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| `MONGODB_URI`    | Your Atlas connection string (URL-encode `@` in passwords as `%40`)    |
| `REDIS_URL`      | Your Upstash / Redis Cloud URL (use `rediss://` for Upstash)           |
| `GROQ_API_KEY`   | Your new Groq key                                                      |
| `GROQ_MODEL`     | `llama-3.3-70b-versatile`                                              |
| `PORT`           | `10000` (Render injects this; explicit is fine)                        |
| `FRONTEND_URL`   | `https://placeholder.vercel.app` — we'll fill this in after Vercel     |
| `UPLOADS_DIR`    | `uploads`                                                              |
| `START_WORKER`   | `true`                                                                 |
| `NODE_VERSION`   | `20` (Render reads this to pick the runtime)                           |

6. **Create Web Service**. First build takes ~3–5 minutes. Watch the logs until you see `[server] listening on http://localhost:10000`.

7. **Verify**: Render gives you a URL like `https://vedaai-backend.onrender.com`. Hit `/health`:

```
curl https://vedaai-backend.onrender.com/health
# → {"status":"ok","mongo":"connected","redis":"connected"}
```

If `mongo` is `disconnected`, double-check the Atlas whitelist. If `redis`, recheck the URL scheme (`rediss://` for Upstash TLS).

> **Free-tier caveat:** Render's free web services sleep after 15 min of inactivity and take ~30 s to wake on the next request. Acceptable for a demo; pay $7/mo for always-on if you want snappier first hits.

> **File uploads on Render's free tier are ephemeral.** Each deploy / sleep wipes `uploads/`. Fine for the demo (PDF is read at job-time, not after). For long-term storage, swap multer-disk for S3 / R2.

---

## Part 2 — Deploy the frontend to Vercel

1. Go to <https://vercel.com/new>.
2. Import the same GitHub repo.
3. Configure:

| Field                | Value                                                  |
|----------------------|--------------------------------------------------------|
| **Framework Preset** | Next.js (autodetected)                                 |
| **Root Directory**   | `frontend`                                             |
| **Build Command**    | (leave default — `next build`)                         |
| **Output Directory** | (leave default — `.next`)                              |
| **Install Command**  | (leave default — `npm install`)                        |

4. **Environment Variables** — add these:

| Key                    | Value                                                  |
|------------------------|--------------------------------------------------------|
| `NEXT_PUBLIC_API_URL`  | `https://vedaai-backend.onrender.com`                  |
| `NEXT_PUBLIC_WS_URL`   | `https://vedaai-backend.onrender.com`                  |

(Use the exact URL Render gave you, no trailing slash.)

5. **Deploy**. First build ~2 minutes. Vercel gives you a URL like `https://vedaai.vercel.app`.

---

## Part 3 — Wire the two together (CORS)

The backend was deployed with `FRONTEND_URL=https://placeholder.vercel.app` as a placeholder. Update it now so CORS allows your real Vercel origin:

1. Render dashboard → `vedaai-backend` → **Environment** → edit `FRONTEND_URL` → set to your Vercel URL (e.g. `https://vedaai.vercel.app`, no trailing slash).
2. Save. Render auto-redeploys (~1 min).

If you set up a custom domain on Vercel later, repeat this step with the production domain.

---

## Part 4 — Final smoke test (on deployed URLs)

1. Open your Vercel URL.
2. **Home** loads with "Live" indicator green next to the date (socket connected).
3. **Create Assignment** → fill the form → **Generate**. Watch the overlay progress through stages → land on `/output/<id>`.
4. Click **Download as PDF** → print dialog opens → save.
5. Click **Regenerate** → overlay reappears → new paper renders → "Last regenerated: just now" line appears under the banner.
6. **My Library** shows the paper with a green **Ready** pill.
7. Open `<vercel-url>/output/<id>?download=1` in a new tab — print dialog opens automatically.

If any step fails, check:
- **Browser console** for CORS errors → `FRONTEND_URL` mismatch.
- **Render logs** for Mongo / Redis disconnects → env values typo'd or whitelist missing.
- **Network tab** for `502` on `/api/...` → backend sleeping (free tier); first request wakes it.

---

## Summary of URLs to drop into the submission form

| Item              | URL                                                        |
|-------------------|------------------------------------------------------------|
| Live frontend     | `https://vedaai.vercel.app`                                |
| Backend health    | `https://vedaai-backend.onrender.com/health`               |
| Code repo         | `https://github.com/<you>/vedaai`                          |

---

## Updating after deploy

Both Render and Vercel watch `main`. Push and they redeploy automatically:

```
git add .
git commit -m "Tweak X"
git push
```

Render: ~2-3 min rebuild. Vercel: ~1 min.
