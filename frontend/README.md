# Decode-Book

**Decode-Book** is a web application that helps users search and understand the **Canadian Electrical Code (CEC)** using semantic search and retrieval-augmented generation (RAG).

Instead of relying on keyword matching, Decode-Book embeds sections of the CEC and retrieves the most relevant rules based on meaning and context, then presents them in a clear, structured response.

This project is intended as a **technical exploration and portfolio piece**, not a replacement for the official CEC or professional judgment.

---

## What It Does

- Performs **semantic search** over CEC content using vector embeddings
- Retrieves relevant rules and clauses from a vector database
- Uses **RAG** to ground AI responses in actual code text
- Clearly distinguishes **general requirements** from **special-condition rules**
- Avoids assumptions about occupancy, environment, or system type unless explicitly stated

---

## How It Works

1. **CEC content** is chunked and embedded using OpenAI embeddings
2. Embeddings are stored in **Supabase (Postgres + pgvector)**
3. User queries are embedded and matched by similarity
4. Relevant code sections are retrieved
5. The AI generates a response **only using retrieved content**

This approach keeps answers traceable to specific rules and avoids hallucinated code references.

---

## Tech Stack

### Frontend

- **React 19** – UI and application state
- **Vite** – Fast local development and builds
- **@tanstack/react-query** – Server state, caching, and request lifecycle
- **motion** – Lightweight UI animation for feedback and transitions
- **react-icons** – Consistent iconography
- **react-toastify** – Non-intrusive user notifications
- **ldrs** – Minimal loading indicators

### Backend

- **Supabase Edge Functions** – Serverless backend logic
- **@supabase/supabase-js** – Database and auth client

### AI & Search

- **ai-sdk** – Model-agnostic AI orchestration
- **OpenAI** – Embeddings and response generation
- **Supabase pgvector** – Vector similarity search for RAG

### Utilities

- **nanoid** – Stable, collision-resistant IDs for UI and request tracking

---

## Design Goals

- Grounded, citation-based answers
- No guessing or invented code rules
- Explicit handling of **special conditions** vs general wiring rules
- Fast iteration and transparent logic for learning and debugging

---

## Important Disclaimer

This project is **not an official interpretation** of the Canadian Electrical Code.

- Always consult the **current CEC** and the **Authority Having Jurisdiction (AHJ)**
- This tool is for learning, exploration, and developer experimentation only

---

## Status

Active development.  
The data pipeline, embedding strategy, and prompt rules continue to evolve as the project grows.
