# Complaint Intake — React frontend for your FastAPI app

A two-pane app: a regulatory complaint form on the left, an AI copilot chat
on the right that fills the form for you, plus a History tab for browsing
and deleting saved records.

## Setup

```bash
npm install
cp .env.example .env   # then edit VITE_API_BASE_URL if FastAPI isn't on :8000
npm run dev
```

Opens on `http://localhost:5173`.

### CORS — do this on the FastAPI side

React (port 5173) and FastAPI (port 8000) are different origins, so FastAPI
needs to explicitly allow the frontend:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Without this, every request from the browser will fail silently at the
network level (you'll see it as a "couldn't reach the API" toast here, and
a CORS error in the browser console).

## How each endpoint maps to the UI

| Endpoint | Used by | Notes |
|---|---|---|
| `POST /complain/generate_response` | Copilot chat (`CopilotPanel.jsx`) | Sends `{ user_query, user_data }`. `user_data` is the uploaded file's text if a file is attached, otherwise a JSON snapshot of the current form (so "batch number is X" style edits have context). |
| `POST /complain/save_data` | "Commit Record" button (`ComplaintForm.jsx` → `App.jsx: handleSave`) | Sends the current form state as `{ complaint_data, defect_analysis }`. Shows a toast based on the boolean response. |
| `GET /complain/show_data` | History tab (`HistoryPanel.jsx`) | Cursor-based pagination via `limit` / `cursor` / `cursor_id`. "Older →" pushes the returned `next_cursor` onto a stack; "← Newer" pops it. |
| `DELETE /complain/delete_data/{complain_id}` | Trash icon in History tab | Confirms first, then removes the row locally on a truthy response. |

## The null-merge rule (important)

Per your spec: `generate_response` can run just the extractor step, just
the risk/editor step, or both — and whichever step *didn't* run comes back
with those fields as `null`. `null` must never be treated as "clear this
field"; it means "the agent had no opinion this turn."

That logic lives in one place: `src/fieldSchema.js` → `mergeAgentFields()`.
It's a pure function: given the current field values/sources and an
incoming agent object, it only overwrites keys where the incoming value is
non-null. `editor` and `extractor` are folded through the same function in
`App.jsx: handleAgentResult`, so an edit-turn updates the same fields an
extraction-turn would, on the same rule.

Each form field also carries a small **AGENT** / **MANUAL** tag and a
colored left rail, so you can see at a glance whether a value came from the
agent or was typed in by hand — that's what determines the border color.

## Known gaps / things to wire up for your real backend

- **PDF uploads**: the contract you gave me only has a JSON body for
  `generate_response` (`user_query` + `user_data`, both strings) — there's
  no dedicated file-upload endpoint. Non-PDF text files are read directly
  via `FileReader.readAsText`. For PDFs, the frontend currently just sends
  `[PDF attached: name.pdf]` plus whatever you typed, since extracting PDF
  text client-side (e.g. with `pdfjs-dist`) or server-side is a decision
  your backend team should make. Swap the PDF branch in
  `CopilotPanel.jsx: handleSend` once that's decided.
- **`show_data` response shape**: your OpenAPI example shows
  `complaint_data` / `defect_analysis` as JSON-encoded *strings* inside each
  item. `HistoryPanel.jsx: safeParse` handles both that and a future world
  where the backend returns real nested objects — but double check against
  your actual response once the backend is live.
- **Error handling**: `src/api/client.js` normalizes 422 (validation, with
  FastAPI's `detail` array flattened into a readable string), 404, 5xx, and
  network-level failures into one `{ status, message }` shape, surfaced as
  toasts everywhere. Adjust the wording if you want it more end-user-facing.
