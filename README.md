# 🏥 Pharma QA Intelligent Complaint Intake & Risk Engine

An asynchronous, multi-agent AI system designed for pharmaceutical Quality Assurance (QA). The platform automates the extraction, risk assessment, and editing of customer complaint records from raw text prompts or PDF reports, using FastAPI, LangChain/LangGraph, and React.

---

## 🌟 Key Features

* **🤖 Multi-Agent Architecture (Supervisor Pattern):** Powered by an orchestrating Supervisor Agent that routes tasks to specialized sub-agents based on user intent.
* **📄 Dual Input Support (Text & PDF):** Log complaints by typing unstructured text into the Copilot or attaching formal QA PDF documents.
* **🛡 Strict Pydantic Data Validation:** Form schema and data structures are strictly validated using Pydantic models to ensure complete data integrity before database commits.
* **💡 Automated Defect & Risk Assessment:** Automatically analyzes defect descriptions to generate risk insights, priority levels, and recommended actions.
* **⚡ Selective In-Place Editing (Mutations):** Update specific fields (e.g., batch numbers, dates, quantities) using conversational instructions without wiping existing form state.
* **💰 Token Optimization Design:** The Supervisor Agent never sees the full record data on mutation/edit turns, drastically reducing LLM token consumption and costs.
* **⚡ 100% Asynchronous Architecture:** Built from top to bottom with non-blocking asynchronous Python (`async`/`await`) for high concurrency and fast performance.
* **📖 Paginated Complaint History:** Features cursor-based pagination for history records to prevent loading heavy database payloads all at once.
* **🛡 Resilience & Defensive Error Handling:** Gracefully handles LLM rate limits, exhausted context limits, database connection drops, and validation errors without crashing the application.

---

## 🏗 Multi-Agent Architecture

The core AI engine uses a **Supervisor-Worker Pattern** to orchestrate workflows efficiently:


                      +-------------------------+
                      |    Supervisor Agent     |
                      |  (Router & Orchestrator)|
                      +------------+------------+
                                   |
      +----------------------------+----------------------------+
      |                            |                            |
      v                            v                            v
+-------------------+        +-------------------+        +-------------------+
|  Extractor Agent  |        |  Mutator Agent    |        |  Risk Assessment  |
| (Structured Log)  |        | (Targeted Edits)  |        |       Agent       |
+-------------------+        +-------------------+        +-------------------+



### Agent Roles:
1. **Supervisor Agent (Orchestrator):** Analyzes the incoming prompt/request and decides which specialized worker agent should handle the payload. 
   * *Token Saver:* Does not inspect the full form state on editing turns—it only reviews user intent.
2. **Extractor Agent:** Parses unstructured text prompts or PDF files to extract core complaint details (Customer name, Product name, Batch/Lot number, Manufacturing/Expiry dates, Quantities).
3. **Mutator Agent:** Performs precision edits on target fields (e.g., *"Change batch number to MX240602"*) without altering unrelated data.
4. **Risk Assessment Agent:** Evaluates defect descriptions to produce risk ratings, insights, and next-step action plans.

---



## ⚙️ Key Engineering & Architectural Highlights

### 1. Token-Efficient Supervisor Routing
To optimize LLM token usage and reduce operational cost:
* **Payload Isolation:** The **Supervisor Agent** acts as an orchestrator using only lightweight user intent prompts.
* **Targeted Context:** Large JSON payloads and form states are never passed to the Supervisor. Instead, full record state is scoped exclusively to sub-agents (**Mutator** and **Risk Assessment**), saving up to 60–70% in prompt token overhead on editing turns.

### 2. High-Concurrency Asynchronous Backend
* **Non-blocking Pipelines:** Built fully asynchronously using FastAPI and `asyncpg` / `AsyncSession` in SQLAlchemy.
* **DB Connection Efficiency:** Non-blocking database operations ensure high throughput when handling simultaneous complaints, PDF parsing tasks, and agent executions.

### 3. Cursor-Based Pagination
* **Scalable Data Retrieval:** History records use cursor-based pagination rather than OFFSET/LIMIT pagination.
* **Optimized Payload Sizes:** Prevents heavy database memory footprint and keeps frontend initial load times fast as historical records grow into thousands.

### 4. Enterprise-Grade Defensive Error Handling
The backend is designed to handle edge cases gracefully without crashing:
* **LLM Failures:** Intercepts rate-limiting, context length window limits, and API timeouts, returning clean error responses to the UI.
* **Validation Guards:** Strict Pydantic parsing guarantees that malformed agent JSON outputs are rejected before touching the database.
* **Transaction Rollbacks:** Async database transactions ensure clean rollbacks on failure, maintaining data consistency.


### 💡 Example Usage Flow

Logging a Complaint:

Enter a prompt in the Copilot:

"Apollo Pharmacy reported discolored capsule in amoxicillin capsule 500 mg, batch number MX240602, manufacturing date March 2026, expiry date February 2028. Please log this complaint."

Result: Extractor & Risk Agents populate form fields and generate risk scores automatically.

Editing Specific Data:

Enter a prompt in the Copilot:

"Can you update the batch number to MX99999 and increase quantity to 100 boxes?"

Result: Supervisor routes to the Mutator Agent, which selectively updates those two fields while preserving the rest.

Committing to Database:

Click Commit Record to save the verified form into PostgreSQL. View historical logs under the History tab.




## 🛠 Tech Stack

### Backend
* **FastAPI:** Asynchronous Web Framework for Python
* **SQLAlchemy (Async):** Object-Relational Mapping (ORM) for PostgreSQL
* **Pydantic:** Data validation and structured LLM parsing
* **LangChain / LangGraph:** Multi-agent orchestration and tool calling

### Frontend
* **React.js (Vite):** User interface with real-time UI updates
* **Lucide React:** UI Icon set
* **Axios / Fetch:** API client integration

---

## 🚀 Getting Started

### Prerequisites
* Python 3.10+
* Node.js 18+
* PostgreSQL Database

### 1. Backend Setup

```bash
# Clone the repository
git clone [https://github.com/your-username/pharma-qa-engine.git](https://github.com/your-username/pharma-qa-engine.git)
cd pharma-qa-engine

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env

Configure your .env file:

DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/pharma_qa
API_KEY=your_llm_api_key

# Run the FastAPI server:

uvicorn app.main:app --reload --port 8000

# Frontend Setup

cd pharma-qa-frontend

# Install dependencies
npm install

# Set environment variables
cp .env.example .env

Configure pharma-qa-frontend/.env:


VITE_API_BASE_URL=http://localhost:8000
Run the development server:

Bash
npm run dev





```