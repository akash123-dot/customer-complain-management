import { useState, useCallback } from 'react'
import { FileStack, ClipboardList } from 'lucide-react'
import ComplaintForm from './components/ComplaintForm.jsx'
import CopilotPanel from './components/CopilotPanel.jsx'
import HistoryPanel from './components/HistoryPanel.jsx'
import Toast from './components/Toast.jsx'
import { emptyComplaint, emptyRisk, mergeAgentFields } from './fieldSchema.js'
import { saveData } from './api/client.js'

export default function App() {
  const [view, setView] = useState('form') // 'form' | 'history'

  const [complaintValues, setComplaintValues] = useState(emptyComplaint)
  const [complaintSource, setComplaintSource] = useState({})
  const [riskValues, setRiskValues] = useState(emptyRisk)
  const [riskSource, setRiskSource] = useState({})

  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const notify = useCallback((t) => setToast(t), [])

  function handleAgentResult(agentPayload) {
    const { extractor, editor, risk_insights } = agentPayload || {}

    setComplaintValues((prevValues) => {
      let values = prevValues
      let source = complaintSource
      if (extractor) {
        ;({ values, source } = mergeAgentFields(values, source, extractor))
      }
      if (editor) {
        ;({ values, source } = mergeAgentFields(values, source, editor))
      }
      setComplaintSource(source)
      return values
    })

    if (risk_insights) {
      setRiskValues((prevValues) => {
        const { values, source } = mergeAgentFields(prevValues, riskSource, risk_insights)
        setRiskSource(source)
        return values
      })
    }
  }

  function handleComplaintFieldChange(key, value) {
    setComplaintValues((v) => ({ ...v, [key]: value }))
    setComplaintSource((s) => ({ ...s, [key]: 'manual' }))
  }

  function handleRiskFieldChange(key, value) {
    setRiskValues((v) => ({ ...v, [key]: value }))
    setRiskSource((s) => ({ ...s, [key]: 'manual' }))
  }

  async function handleSave() {
    setSaving(true)
    const { data, error } = await saveData(complaintValues, riskValues)
    setSaving(false)

    if (error) {
      notify({ tone: 'error', message: `Couldn't commit the record: ${error.message}` })
      return
    }

    if (data === true) {
      notify({ tone: 'success', message: 'Complaint record committed.' })
    } else {
      notify({ tone: 'error', message: 'The server returned false — the record was not saved.' })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--color-bg)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '0 24px',
          height: 48,
          flexShrink: 0,
        }}
      >
        <TabButton icon={ClipboardList} label="Intake" active={view === 'form'} onClick={() => setView('form')} />
        <TabButton icon={FileStack} label="History" active={view === 'history'} onClick={() => setView('history')} />
      </div>

      <div style={{ flex: 1, minHeight: 0, padding: '0 20px 20px' }}>
        {view === 'form' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 16, height: '100%' }}>
            <div
              style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                overflow: 'hidden',
              }}
            >
              <ComplaintForm
                complaintValues={complaintValues}
                complaintSource={complaintSource}
                riskValues={riskValues}
                riskSource={riskSource}
                onFieldChange={handleComplaintFieldChange}
                onRiskFieldChange={handleRiskFieldChange}
                onSave={handleSave}
                saving={saving}
              />
            </div>
            <div
              style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                overflow: 'hidden',
              }}
            >
              <CopilotPanel
                onAgentResult={handleAgentResult}
                currentStateSnapshot={{ complaint_data: complaintValues, defect_analysis: riskValues }}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-card)',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <HistoryPanel onNotify={notify} />
          </div>
        )}
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}

function TabButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        height: 44,
        padding: '0 12px',
        background: 'none',
        border: 'none',
        borderBottom: active ? '2px solid var(--color-accent)' : '2px solid transparent',
        color: active ? 'var(--color-ink)' : 'var(--color-ink-faint)',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      <Icon size={14} />
      {label}
    </button>
  )
}