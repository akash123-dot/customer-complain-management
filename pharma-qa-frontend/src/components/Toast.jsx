import { useEffect } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

const TONE = {
  success: { color: 'var(--color-ok)', bg: 'var(--color-ok-soft)', Icon: CheckCircle2 },
  error: { color: 'var(--color-critical)', bg: 'var(--color-critical-soft)', Icon: XCircle },
}

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onDismiss, 5000)
    return () => clearTimeout(t)
  }, [toast, onDismiss])

  if (!toast) return null
  const { color, bg, Icon } = TONE[toast.tone] || TONE.success

  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        maxWidth: 380,
        background: '#fff',
        border: `1px solid ${color}`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 'var(--radius)',
        boxShadow: '0 8px 24px rgba(22,31,51,0.12)',
        padding: '12px 14px',
      }}
    >
      <Icon size={18} color={color} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1, fontSize: 13.5, lineHeight: 1.45, color: 'var(--color-ink)' }}>
        {toast.message}
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 2,
          color: 'var(--color-ink-faint)',
        }}
      >
        <X size={15} />
      </button>
    </div>
  )
}
