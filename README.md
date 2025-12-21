# Decode-Book ⚡  
**AI-assisted electrical code search, reasoning, and citation engine**

Decode-Book is a portfolio project that explores how **retrieval-augmented generation (RAG)** can be applied to structured regulatory text (electrical code material) to produce **accurate, scoped, and fully-qualified answers** instead of hallucinated summaries.

The project combines **semantic search, keyword search, and deterministic rule-gating logic** to answer electrical code questions with citations and conditions, similar to how a knowledgeable electrician or inspector would reason through a code book.

---

## 🚀 Core Features

### 🔍 Hybrid Search (Semantic + Lexical)
Decode-Book does not rely on a single search strategy.

- **Embedding-based semantic search**
  - Uses vector embeddings to retrieve conceptually related rules
  - Handles paraphrased questions and non-exact wording
- **Full-text keyword search**
  - Ensures exact code language is not missed
  - Ranked by number of matched terms rather than repetition
- **Deterministic ranking**
  - Results that match *more distinct query terms* are ranked higher
  - Prevents long, irrelevant rules from dominating results

---

### 🧠 Tool-Driven RAG (No Blind LLM Guessing)

The AI **never answers directly from the model alone**.

Instead, Decode-Book uses a **tool-first RAG pipeline** defined in `prompt.txt`, where the language model is constrained to act as an *orchestrator* rather than a source of truth.

The model can only reason using information returned by explicit tool calls.

---

### 🛠️ Tooling and Execution Model

Decode-Book exposes a small, purpose-built set of tools that the AI must use to retrieve information:

- **`semanticSearch`**
  - Performs embedding-based similarity search
  - Used to find conceptually relevant rules when exact wording is unknown
- **`keywordSearch`**
  - Uses full-text search to locate rules containing specific terms
  - Results are ranked by how many distinct query terms are present
- **`getCode(ruleNumber)`**
  - Fetches authoritative rule text for a known rule number
  - Used to verify exact language, subrules, and limitations

The AI is explicitly forbidden from using prior knowledge or assumptions.  
All conclusions must be grounded in tool output.

---

### 🔁 RAG Control Flow

At a high level, the reasoning loop works as follows:

1. **Search**
   - Run semantic and/or keyword search to locate candidate rules
2. **Confirm**
   - Use `getCode` to retrieve full rule text when a rule is identified
3. **Filter**
   - Discard rules that do not apply under the stated assumptions
4. **Answer**
   - Generate a concise, human-readable conclusion
   - Cite rule numbers inline (e.g. `[12-3016]`)
   - Include all required conditions (bonding, fittings, environment ratings, etc.)

If the tools do not return sufficient evidence, the system **returns an explicit “cannot determine” response** instead of guessing.

---

### 📜 Constraint-Based Prompt Engineering

The heart of the project is a **constraint-heavy instructional prompt** (`prompt.txt`) that enforces:

- Mandatory use of retrieval tools
- No unstated assumptions or extrapolation
- Explicit labeling of conditional rules
- Clear separation between:
  - *Rule explanation* and
  - *Compliance answers*
- A strict JSON output schema for predictable downstream handling

This prompt acts as a **lightweight rule engine** layered on top of the language model.

---

### 🗂️ Structured Data & Search Indexing

- Electrical code text is:
  - Parsed and normalized
  - Stored as structured records
- Search infrastructure uses:
  - Full-text indexing for fast keyword lookup
  - Vector embeddings for semantic retrieval
- Ranking prioritizes:
  - Coverage of query terms
  - Not raw frequency or verbosity

---

## 🛠️ Tech Stack

- **Frontend**

- **Backend**
  - Supabase (Postgres + RPC)
  - Edge Functions for AI orchestration
- **Search**
  - PostgreSQL full-text search
  - Vector embeddings for semantic similarity
- **AI**
  - Retrieval-Augmented Generation (RAG)
  - Tool-constrained, deterministic reasoning
- **Language**
  - TypeScript
  - SQL (PostgreSQL)

---

## 🎯 Why This Project Exists

Most AI-assisted code tools:
- Hallucinate rules
- Ignore applicability and conditions
- Fail to include required installation details

Decode-Book was built to explore:
- **How to safely apply AI to regulatory text**
- **How to constrain language models with explicit tooling**
- **How to blend symbolic rule logic with probabilistic retrieval**

The guiding principle behind the project is:

> *“If someone followed this advice in the field, would it still be correct?”*

---

## ⚠️ Disclaimer

This project is for **educational and portfolio purposes only**.  
It is **not a substitute** for official electrical code publications or professional judgment.

---

## 👤 Author

**John Elenis**  


