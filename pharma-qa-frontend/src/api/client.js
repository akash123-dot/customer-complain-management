import axios from 'axios'

// Point this at your FastAPI instance via .env -> VITE_API_BASE_URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, 
})


function normalizeError(err) {
  if (err.response) {
    const { status, data } = err.response
    let message

    if (status === 422) {
      
      const detail = data?.detail
      if (Array.isArray(detail)) {
        message = detail.map((d) => `${d.loc?.slice(-1)[0] ?? 'field'}: ${d.msg}`).join('; ')
      } else {
        message = data?.detail || 'The server rejected the request (422 — validation error).'
      }
    } else if (status === 404) {
      message = data?.detail || 'Not found (404).'
    } else if (status >= 500) {
      message = data?.detail || `Server error (${status}). Try again in a moment.`
    } else {
      message = data?.detail || `Request failed (${status}).`
    }

    return { status, message }
  }

  if (err.request) {
    return {
      status: 0,
      message: `Couldn't reach the API at ${BASE_URL}. Is FastAPI running, and is CORS configured for this origin?`,
    }
  }

  return { status: -1, message: err.message || 'Unexpected error.' }
}

async function call(fn) {
  try {
    const res = await fn()
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: normalizeError(err) }
  }
}


export function generateResponse(userQuery, userData, pdfFile = null) {
  const form = new FormData()
  form.append('user_query', userQuery)

  if (pdfFile) {
    form.append('pdf_file', pdfFile)
  } else if (userData !== null && userData !== undefined) {
    form.append('user_data', userData)
  }

  return call(() => http.post('/complain/generate_response', form))
}


export function saveData(complaintData, defectAnalysis) {
  return call(() =>
    http.post('/complain/save_data', {
      complaint_data: complaintData,
      defect_analysis: defectAnalysis,
    })
  )
}


export function fetchComplaints({ limit = 20, cursor = null, cursorId = null } = {}) {
  const params = { limit }
  if (cursor) params.cursor = cursor
  if (cursorId !== null && cursorId !== undefined) params.cursor_id = cursorId

  return call(() => http.get('/complain/show_data', { params }))
}


export function deleteComplaint(complainId) {
  return call(() => http.delete(`/complain/delete_data/${complainId}`))
}