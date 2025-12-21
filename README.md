# Decode-Book ⚡

**AI-assisted electrical code search, reasoning, and citation engine**

Decode-Book is a portfolio project that looks at how retrieval-augmented generation (RAG) can be used to work with structured regulatory text and produce clear, accurate answers instead of vague or hallucinated summaries.
It combines semantic search, keyword search, and rule-based logic to answer electrical code questions with proper citations and the conditions that actually matter in real installations.
The system also adds important follow-up details that users often don’t realize they need to ask about, helping turn simple questions into complete, usable answers.

![Screenshot of the results produced by asking the application an electrical question](/docs/example.png)
---

## 🚀 Core Features

- Hybrid search: semantic (embeddings) + full-text keyword search
- Deterministic ranking that favors coverage of distinct query terms
- Tool-driven RAG pipeline that enforces verification before answering
- Schema-only output for machine-parseable, auditable results
- Clear handling of default assumptions vs conditional (special-case) rules

---

## How it works (high level)

1. Content is parsed and chunked into passages suitable for embedding.
2. Each passage is converted to a dense vector (OpenAI embeddings in this project) and stored along with metadata in Supabase Postgres with `pgvector`.
3. User queries are embedded and nearest neighbors (top-K) are retrieved by similarity.
4. Retrieved passages are verified via keyword search and `getCode` where applicable.
5. A constrained prompt combines the retrieved evidence and returns a JSON schema-backed response.

This tool-first workflow prevents the model from answering without explicit evidence.

---

## RAG & Prompting

The project uses a detailed prompt (see `backend/supabase/functions/decode-book/prompt.txt`) that enforces:

- Use of `semanticSearch`, `keywordSearch`, and `getCode` tools in a specific order
- A final keyword verification step to catch missing companion requirements or exceptions
- Default assumptions (ordinary occupancy, typical wiring, utilization voltage ≤ 750 V) and explicit labeling of any special-condition rules as conditional notes
- Mandatory JSON-schema output for predictable downstream handling

These measures improve traceability and reduce hallucination by tying responses directly to retrieved code excerpts.

---

## Embeddings & Semantic Search

- Chunking: content is split to balance context and recall.
- Embedding: passages are embedded with an embeddings model and stored as vectors.
- Storage: Supabase Postgres + `pgvector` stores vectors and source metadata (rule numbers, section titles, raw text).
- Querying: queries are embedded and compared (cosine similarity) to stored vectors to retrieve the most relevant passages.
- Verification: retrieved passages are verified using keyword search and authoritative `getCode` lookups when rule numbers are present.

---

## Tech Stack

- Frontend: React (Vite), TypeScript, `@tanstack/react-query`, `react-toastify`, `react-icons`, motion
- Backend: Supabase Edge Functions (Deno) for RAG orchestration
- Database: Supabase Postgres with `pgvector` for vector search and PostgreSQL full-text search
- AI: OpenAI embeddings + generation (or other providers via `ai-sdk`)
- Clients: `@supabase/supabase-js`

---

## Local development

Frontend (dev):

```bash
cd frontend
npm install
npm run dev
```

Build frontend:

```bash
cd frontend
npm run build
```

Deploy Supabase function (example):

```bash
cd backend
npx supabase functions deploy decode-book
```

Notes:
- Set environment variables for OpenAI and Supabase keys before running or deploying functions.
- The embedding pipeline and function code live under `backend/supabase/functions/decode-book/`.

---

## Files of interest

- `frontend/` — React app and UI components
- `backend/supabase/functions/decode-book/` — RAG function, `index.ts`, and `prompt.txt`
- `backend/deno.json`, `backend/package.json` — backend configuration

---

## Design goals & disclaimer

This repository is a technical exploration and portfolio piece demonstrating grounded RAG, embedding-powered semantic search, and disciplined prompt/verification engineering. It is NOT a substitute for the official Canadian Electrical Code or professional judgment. Always consult the current CEC and the Authority Having Jurisdiction.

---

## 👤 Author

John Elenis


