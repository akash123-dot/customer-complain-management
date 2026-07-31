import { useEffect, useState, useCallback } from 'react'
import { Trash2, ChevronRight, RefreshCw } from 'lucide-react'
import { fetchComplaints, deleteComplaint } from '../api/client.js'

function safeParse(value) {
  if (value == null) return null
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch {
    return { raw: value }
  }
}

export default function HistoryPanel({ onNotify }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [cursorStack, setCursorStack] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [hasNext, setHasNext] = useState(false)

  const load = useCallback(
    async (cursor = null, isStale = () => false) => {
      setLoading(true)
      const { data, error } = await fetchComplaints({
        limit: 20,
        cursor: cursor?.cursor ?? null,
        cursorId: cursor?.cursor_id ?? null,
      })

      if (isStale()) return
      setLoading(false)

      if (error) {
        onNotify?.({ tone: 'error', message: `Couldn't load complaint history: ${error.message}` })
        return
      }

      setItems(data?.items || [])
      setHasNext(Boolean(data?.has_next))
      setNextCursor(data?.next_cursor || null)
    },
    [onNotify]
  )

  useEffect(() => {
    let cancelled = false
    load(null, () => cancelled)
    return () => {
      cancelled = true
    }
  }, [load])

  function goNext() {
    if (!nextCursor) return
    setCursorStack((s) => [...s, nextCursor])
    load(nextCursor)
  }

  function goBack() {
    setCursorStack((s) => {
      const copy = [...s]
      copy.pop()
      const prev = copy[copy.length - 1] || null
      load(prev)
      return copy
    })
  }

  async function handleDelete(id) {
    if (deletingId === id) return
    if (!window.confirm(`Delete complaint record #${id}? This can't be undone.`)) return
    
    setDeletingId(id)
    const { data, error } = await deleteComplaint(id)
    setDeletingId(null)

    if (error) {
      const alreadyGone = error.status === 404 && !items.some((it) => it.id === id)
      if (alreadyGone) {
        setItems((prev) => prev.filter((it) => it.id !== id))
        return
      }
      onNotify?.({ tone: 'error', message: `Delete failed for #${id}: ${error.message}` })
      return
    }

    if (data === false) {
      onNotify?.({ tone: 'error', message: `Server declined to delete #${id}.` })
      return
    }

    onNotify?.({ tone: 'success', message: `Complaint #${id} deleted.` })
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 700 }}>Complaint Records</div>
          <div style={{ fontSize: 12.5, color: 'var(--color-ink-faint)', marginTop: 2 }}>Committed to the database</div>
        </div>
        <button
          onClick={() => load(cursorStack[cursorStack.length - 1] || null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12.5,
            padding: '7px 12px',
            border: '1px solid var(--color-line)',
            borderRadius: 'var(--radius)',
            background: '#fff',
            cursor: 'pointer',
            color: 'var(--color-ink-soft)',
          }}
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {loading && <div style={{ fontSize: 13, color: 'var(--color-ink-faint)' }}>Loading…</div>}

      {!loading && items.length === 0 && (
        <div style={{ fontSize: 13, color: 'var(--color-ink-faint)' }}>
          No complaints committed yet. Records you save from the form show up here.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item) => {
          const complaint = safeParse(item.complaint_data)
          const risk = safeParse(item.defect_analysis)
          const expanded = expandedId === item.id

          return (
            <div
              key={item.id}
              style={{
                border: '1px solid var(--color-line)',
                borderRadius: 'var(--radius)',
                background: '#fff',
                overflow: 'hidden',
              }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => setExpandedId(expanded ? null : item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setExpandedId(expanded ? null : item.id)
                  }
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <ChevronRight
                  size={15}
                  style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 120ms', flexShrink: 0 }}
                  color="var(--color-ink-faint)"
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--color-ink-faint)' }}>
                  #{item.id}
                </span>
                <span style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>
                  {complaint?.product_name || (complaint?.raw ? 'Unparsed record' : 'Untitled complaint')}
                </span>
                {risk?.risk_level && (
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      letterSpacing: 0.3,
                      padding: '3px 8px',
                      borderRadius: 'var(--radius)',
                      background: 'var(--color-warn-soft)',
                      color: 'var(--color-warn)',
                    }}
                  >
                    {risk.risk_level.toUpperCase()}
                  </span>
                )}
                <span style={{ fontSize: 11, color: 'var(--color-ink-faint)' }}>
                  {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(item.id)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDelete(item.id)
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 4,
                    color: deletingId === item.id ? 'var(--color-ink-faint)' : 'var(--color-critical)',
                    cursor: deletingId === item.id ? 'not-allowed' : 'pointer',
                    opacity: deletingId === item.id ? 0.5 : 1,
                  }}
                >
                  <Trash2 size={15} />
                </span>
              </div>

              {expanded && (
                <div style={{ padding: '4px 14px 16px 39px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px' }}>
                    {complaint && !complaint.raw
                      ? Object.entries(complaint).map(([k, v]) => (
                          <div key={k} style={{ fontSize: 12 }}>
                            <span style={{ color: 'var(--color-ink-faint)' }}>{k.replace(/_/g, ' ')}: </span>
                            <span>{v ?? '—'}</span>
                          </div>
                        ))
                      : complaint?.raw && (
                          <div style={{ fontSize: 12, gridColumn: '1 / -1', color: 'var(--color-ink-faint)' }}>{complaint.raw}</div>
                        )}
                  </div>

                  {risk && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--color-line-soft)' }}>
                      <div
                        style={{
                          fontSize: 10.5,
                          fontWeight: 600,
                          letterSpacing: 0.6,
                          color: 'var(--color-ink-faint)',
                          textTransform: 'uppercase',
                          marginBottom: 6,
                        }}
                      >
                        Risk Insights
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px' }}>
                        {!risk.raw
                          ? Object.entries(risk).map(([k, v]) => (
                              <div key={k} style={{ fontSize: 12 }}>
                                <span style={{ color: 'var(--color-ink-faint)' }}>{k.replace(/_/g, ' ')}: </span>
                                <span>{v ?? '—'}</span>
                              </div>
                            ))
                          : (
                              <div style={{ fontSize: 12, gridColumn: '1 / -1', color: 'var(--color-ink-faint)' }}>{risk.raw}</div>
                            )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
        <button
          onClick={goBack}
          disabled={cursorStack.length === 0 || loading}
          style={{
            fontSize: 12.5,
            padding: '7px 14px',
            border: '1px solid var(--color-line)',
            borderRadius: 'var(--radius)',
            background: '#fff',
            cursor: cursorStack.length === 0 ? 'default' : 'pointer',
            opacity: cursorStack.length === 0 ? 0.4 : 1,
          }}
        >
          ← Newer
        </button>
        <button
          onClick={goNext}
          disabled={!hasNext || loading}
          style={{
            fontSize: 12.5,
            padding: '7px 14px',
            border: '1px solid var(--color-line)',
            borderRadius: 'var(--radius)',
            background: '#fff',
            cursor: !hasNext ? 'default' : 'pointer',
            opacity: !hasNext ? 0.4 : 1,
          }}
        >
          Older →
        </button>
      </div>
    </div>
  )
}