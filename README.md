# VedaAI — AI Assessment Creator

A full-stack AI-powered web application that allows teachers to upload source material (PDF/text), configure question formats, and automatically generate structured, exam-ready assessment papers with answer keys using LLMs.

---

## Live Demo

- Link: [https://web-production-44b3a.up.railway.app/ui](https://assessmentforge-en7b.vercel.app/)

---
## Demo flow

1. From the **Home** dashboard, click **Create Assignment**.
2. (Optional) drop a PDF / text file with the source content.
3. Pick a due date, adjust the question-type table, and add any notes.
4. **Next** → **Generate**.
5. A live progress overlay shows each stage (`starting → reading_source → calling_llm → storing`). Total time is usually 10–30 s.
6. On completion, you're redirected to **/output/[id]** — a printable question paper with section-by-section questions, inline difficulty badges, and an answer key.
7. Open **My Library** to find every paper you've generated, with search + subject / status filters + Download / Copy-link actions.

---

## Tech stack

| Layer       | Choice                                                       |
|-------------|--------------------------------------------------------------|
| Frontend    | Next.js 14 (App Router) · TypeScript · Tailwind CSS          |
| State       | Zustand                                                      |
| Realtime    | socket.io-client                                             |
| Icons       | lucide-react (icons only — no component library)             |
| Backend     | Node.js · Express · TypeScript                               |
| Persistence | MongoDB Atlas (Mongoose)                                     |
| Queue       | BullMQ on Upstash / Redis Cloud (ioredis)                    |
| LLM         | Groq SDK (`llama-3.3-70b-versatile`, JSON-mode)              |
| Realtime    | Socket.io                                                    |
| File upload | multer (disk storage)                                        |
| PDF parsing | pdf-parse v2                                                 |

---

## Architecture

```
┌──────────────────┐        REST + multipart        ┌─────────────────────┐
│  Next.js 14 App  │ ─────────────────────────────► │  Express HTTP API   │
│  (Vercel)        │                                │  /api/assignments…  │
│                  │ ◄──────  Socket.io  ─────────► │  /health            │
│  Zustand store   │      (rooms keyed by id        │                     │
│  socket.io       │       + global broadcasts)     └────────┬────────────┘
└──────────────────┘                                         │
                                                             │ add job
                                                             ▼
                                                    ┌─────────────────┐
                                                    │  BullMQ queue   │
                                                    │  (Redis)        │
                                                    └────────┬────────┘
                                                             │
                                                             ▼
                                                    ┌─────────────────┐
                                                    │  Generation     │
                                                    │  Worker         │
                                                    │  - pdf-parse    │
                                                    │  - Groq SDK     │
                                                    │  - validate +   │
                                                    │    persist      │
                                                    └────────┬────────┘
                                                             │
                                                             ▼
                                                    ┌─────────────────┐
                                                    │ MongoDB Atlas   │
                                                    └─────────────────┘
```

### Request flow (create + generate)

1. Client POSTs `multipart/form-data` to `/api/assignments` (title, dueDate, questionTypes JSON, optional file, additionalInfo).
2. Route validates input, persists an Assignment with `status: 'pending'`, and enqueues a BullMQ job with `jobId = assignmentId` (idempotent).
3. Route emits `assignment:updated` globally so dashboards refresh in real time.
4. Worker picks up the job, marks the Assignment `processing`, optionally extracts text from the uploaded PDF, calls Groq in JSON mode with a deterministic schema prompt, validates the parsed output, and updates the Assignment with `status: 'completed'` + `generatedOutput`.
5. Each stage emits `generation:progress` to the room `<assignmentId>`; completion emits `generation:complete` (+ a global `assignment:updated`).
6. The client (joined to that room) renders a live progress overlay, then redirects to `/output/[id]`.

### Regenerate flow

`POST /api/assignments/:id/regenerate` resets `status` to `'pending'`, removes any stale BullMQ job with the same id, re-enqueues, and broadcasts `assignment:updated`. The output page reuses the same overlay component used during creation.

---

## API

| Method | Path                                       | Purpose                                                   |
|--------|--------------------------------------------|-----------------------------------------------------------|
| GET    | `/health`                                  | Liveness + Mongo/Redis status                             |
| POST   | `/api/assignments`                         | Create + enqueue (multipart, optional `file`)             |
| GET    | `/api/assignments`                         | List all (includes `generatedOutput` for dashboard stats) |
| GET    | `/api/assignments/:id`                     | Single assignment                                         |
| GET    | `/api/assignments/:id/status`              | Lightweight status poll                                   |
| POST   | `/api/assignments/:id/regenerate`          | Re-run the LLM for an existing assignment                 |
| DELETE | `/api/assignments/:id`                     | Remove assignment + cancel pending job + delete file      |
| GET    | `/uploads/<filename>`                      | Serves uploaded source files                              |

### Socket events

| Event                  | Direction      | Payload                                                   |
|------------------------|----------------|-----------------------------------------------------------|
| `join`                 | client→server  | `assignmentId: string` — joins a per-assignment room      |
| `generation:progress`  | server→client  | `{ assignmentId, stage, progress }`                       |
| `generation:complete`  | server→client  | `{ assignmentId, output }`                                |
| `generation:error`     | server→client  | `{ assignmentId, error }`                                 |
| `assignment:updated`   | server→client  | `{ id, status }` — global broadcast, drives live dashboards |


---

## Project structure

```
ai-assessment-creator/
├── backend/
│   ├── src/
│   │   ├── config/         env.ts, mongo.ts, redis.ts
│   │   ├── models/         Assignment.ts
│   │   ├── prompts/        questionPaper.ts
│   │   ├── queues/         generationQueue.ts
│   │   ├── routes/         assignments.ts
│   │   ├── sockets/        io.ts
│   │   ├── workers/        generationWorker.ts
│   │   └── index.ts
│   ├── scripts/            smokeTest.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                  Home dashboard
│   │   ├── assignments/page.tsx      Assignments grid
│   │   ├── assignments/create/       Multi-step form
│   │   ├── output/[id]/              Generated paper
│   │   ├── library/                  Archive
│   │   ├── groups/                   Coming soon
│   │   ├── ai-toolkit/               Toolkit hub
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/                   Sidebar, Header, AppShell, form/, output/, library/, home/, brand/
│   ├── lib/                          api.ts, socket.ts, types.ts
│   ├── store/                        assignmentStore.ts
│   ├── .env.local.example
│   ├── package.json
│   └── tailwind.config.ts
│
├── CONTEXT.md     ← original assignment spec
├── PHASES.md      ← build plan checked off through phase 6
├── README.md      ← you are here
└── DEPLOY.md      ← step-by-step Render + Vercel deploy
```

---

## Local setup

### Prerequisites

- Node.js 20+
- A MongoDB connection string (Atlas free tier is fine)
- A Redis URL (Upstash or Redis Cloud free tier)
- A Groq API key (free tier at console.groq.com)

### 1. Install

```
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment

Copy the example files and fill them in:

```
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

**`backend/.env`:**

```
MONGODB_URI=mongodb+srv://...        # URL-encode special chars in your password (@ → %40)
REDIS_URL=redis://default:...        # use rediss:// for Upstash
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile
PORT=8000
FRONTEND_URL=http://localhost:3000
UPLOADS_DIR=uploads
START_WORKER=true                    # in-process worker by default
```

**`frontend/.env.local`:**

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=http://localhost:8000
```

### 3. Run

Two terminals:

```
# terminal 1 — backend (Express + Socket.io + in-process worker)
cd backend && npm run dev

# terminal 2 — frontend (Next.js)
cd frontend && npm run dev
```

Verify the backend with:

```
curl http://localhost:8000/health
# → {"status":"ok","mongo":"connected","redis":"connected"}
```

Then open <http://localhost:3000>.

### Optional: end-to-end smoke test

A self-contained Node script POSTs an assignment, subscribes to socket events, waits for completion, verifies storage, and deletes:

```
cd backend
npx tsx scripts/smokeTest.ts
```

Expected last line: `[smoke] ✅ ALL CHECKS PASSED`.

---

## Approach & key decisions

**BullMQ + a queue (not a synchronous LLM call).** The HTTP request returns in ~50 ms with an `assignmentId`; the heavy lifting happens out-of-band. This means the form can immediately show a progress overlay (driven by socket events) and the request doesn't time out on free-tier hosts. The worker has a retry-once policy on parse failures.

**Sockets, with rooms per assignment + a global broadcast.** Per-assignment rooms drive the inline progress overlay during create / regenerate. A separate global `assignment:updated` event lets every dashboard (Home, Library, Assignments) live-refresh when any paper completes — no polling needed.

**In-process worker by default, separable for production.** During development the same `npm run dev` boots Express + Socket.io + the BullMQ worker, so the local loop has one command. Set `START_WORKER=false` and run `npm run worker` as a separate process if you want to scale workers independently in production.

**JSON-mode LLM with strict schema validation.** The prompt sends the exact TypeScript shape required, asks for JSON only, and the worker re-validates every field (including the `difficulty` enum) before persisting. One retry on parse failure. Bad responses never reach the UI.

**Custom inline SVG illustrations.** The empty-state, groups, and library illustrations are inline SVGs, so there's no asset pipeline, no broken image links on deploy, and they scale perfectly on retina.

**PDF export via `window.print()` + targeted print CSS.** Hides chrome (sidebar, header, banner, buttons), flattens the question paper card, adds proper `@page` margins. Zero dependencies, works in every browser, and the result is a real PDF via the system print-to-PDF dialog.

**Server-derived stats, real-time updates.** The list endpoint returns the full `generatedOutput`, so Home / Library stats are computed on the client from the canonical Mongo data — never out of sync. Updates flow via the global `assignment:updated` broadcast plus refetch-on-focus.

**File uploads.** multer to disk under `uploads/`, served via Express static. PDFs are parsed at job-time with `pdf-parse` v2 (class-based `PDFParse` API); image uploads are accepted but skipped during extraction.

---
