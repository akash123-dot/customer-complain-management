import { useRef, useState } from 'react'
import { Sparkles, Paperclip, ArrowUp, FileText, X } from 'lucide-react'
import { generateResponse } from '../api/client.js'

export default function CopilotPanel({ onAgentResult, currentStateSnapshot }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [pendingFile, setPendingFile] = useState(null)
  const [sending, setSending] = useState(false)
  const [focused, setFocused] = useState(false)
  const fileInputRef = useRef(null)

  function handleFileSelect(file) {
    if (!file) {
      setPendingFile(null)
      return
    }
    
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setMessages((m) => [
        ...m,
        { role: 'agent', text: `Only .pdf files are accepted — "${file.name}" isn't one.`, id: crypto.randomUUID(), isError: true },
      ])
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setPendingFile(file)
  }

  
  const canSend = Boolean(input.trim()) && !sending

  async function handleSend() {
    if (!canSend) return

    const userQuery = input.trim()
    const fileLabel = pendingFile?.name || null

  
    const userData = pendingFile ? null : currentStateSnapshot ? JSON.stringify(currentStateSnapshot) : ''

    const userMsg = { role: 'user', text: userQuery, fileName: fileLabel, id: crypto.randomUUID() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setPendingFile(null)
    setSending(true)

    const { data, error } = await generateResponse(userQuery, userData, pendingFile)

    if (error) {
      setMessages((m) => [
        ...m,
        { role: 'agent', text: `Couldn't process that: ${error.message}`, id: crypto.randomUUID(), isError: true },
      ])
      setSending(false)
      return
    }

    onAgentResult(data)

    const filledCount =
      Object.values(data.extractor || {}).filter((v) => v !== null).length +
      Object.values(data.risk_insights || {}).filter((v) => v !== null).length

    setMessages((m) => [
      ...m,
      {
        role: 'agent',
        text:
          filledCount > 0
            ? `Updated ${filledCount} field${filledCount === 1 ? '' : 's'} on the form from this turn.`
            : `No fields changed this turn.`,
        id: crypto.randomUUID(),
      },
    ])
    setSending(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px 14px' }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: 'var(--color-accent-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Sparkles size={15} color="var(--color-accent)" />
        </div>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>Copilot</div>
          <div style={{ fontSize: 11.5, color: 'var(--color-ink-faint)' }}>Fills the form from your complaint</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 18px 12px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.length === 0 && (
          <div
            style={{
              fontSize: 12.5,
              lineHeight: 1.6,
              color: 'var(--color-ink-faint)',
              background: 'var(--color-bg)',
              borderRadius: 10,
              padding: '12px 14px',
              marginTop: 4,
            }}
          >
            Attach a PDF complaint report with a short note, or just type — e.g.{' '}
            <span style={{ color: 'var(--color-ink-soft)' }}>
              “batch number is CHG 260712A, quantity 50 kg (2 HDPE drums)”
            </span>{' '}
            to update just those fields.
          </div>
        )}

        {messages.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div
                style={{
                  maxWidth: '82%',
                  fontSize: 13,
                  lineHeight: 1.5,
                  padding: '9px 13px',
                  borderRadius: '14px 14px 3px 14px',
                  background: 'var(--color-accent-soft)',
                  color: 'var(--color-ink)',
                }}
              >
                {m.fileName && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 6,
                      color: 'var(--color-accent)',
                      fontSize: 11.5,
                      fontWeight: 500,
                    }}
                  >
                    <FileText size={13} />
                    {m.fileName}
                  </div>
                )}
                {m.text}
              </div>
            </div>
          ) : (
            <div key={m.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: m.isError ? 'var(--color-critical-soft)' : 'var(--color-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <Sparkles size={11} color={m.isError ? 'var(--color-critical)' : 'var(--color-ink-faint)'} />
              </div>
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: m.isError ? 'var(--color-critical)' : 'var(--color-ink-soft)',
                  paddingTop: 2,
                }}
              >
                {m.text}
              </div>
            </div>
          )
        )}

        {sending && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'var(--color-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={11} color="var(--color-ink-faint)" />
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--color-ink-faint)' }}>Reading…</div>
          </div>
        )}
      </div>

      <div style={{ padding: '10px 16px 16px' }}>
        {pendingFile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: 'var(--color-ink-soft)',
              marginBottom: 8,
              background: 'var(--color-bg)',
              padding: '6px 10px',
              borderRadius: 8,
            }}
          >
            <FileText size={13} color="var(--color-accent)" />
            {pendingFile.name}
            <button
              onClick={() => setPendingFile(null)}
              aria-label="Remove attachment"
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink-faint)', display: 'flex' }}
            >
              <X size={13} />
            </button>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 4,
            background: 'var(--color-bg)',
            border: focused ? '1px solid var(--color-accent)' : '1px solid transparent',
            borderRadius: 'var(--radius-pill)',
            padding: '6px 6px 6px 14px',
            transition: 'border-color 120ms',
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={pendingFile ? 'Add a note about this file…' : 'Message the copilot…'}
            rows={1}
            style={{
              flex: 1,
              resize: 'none',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 13.5,
              fontFamily: 'inherit',
              maxHeight: 100,
              padding: '7px 0',
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach PDF"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-ink-faint)',
              padding: 6,
              display: 'flex',
              flexShrink: 0,
            }}
          >
            <Paperclip size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            hidden
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          />
          <button
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send"
            style={{
              background: canSend ? 'var(--color-accent)' : '#d3d7de',
              border: 'none',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: canSend ? 'pointer' : 'default',
              flexShrink: 0,
              transition: 'background 120ms',
            }}
          >
            <ArrowUp size={15} color="#fff" />
          </button>
        </div>
        {pendingFile && (
          <div style={{ fontSize: 10.5, color: 'var(--color-ink-faint)', marginTop: 6, paddingLeft: 14 }}>
            Add a note above, then send — a PDF alone won't submit.
          </div>
        )}
      </div>
    </div>
  )
}
