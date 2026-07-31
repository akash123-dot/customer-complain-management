import { COMPLAINT_FIELDS, RISK_FIELDS } from '../fieldSchema.js'

const SOURCE_STYLE = {
  agent: { border: 'var(--color-accent)', tag: 'AGENT', tagColor: 'var(--color-accent)' },
  manual: { border: 'var(--color-manual)', tag: 'MANUAL', tagColor: 'var(--color-manual)' },
}

function Field({ field, value, sourceTag, onChange }) {
  const style = SOURCE_STYLE[sourceTag]
  const InputTag = field.multiline ? 'textarea' : 'input'

  return (
    <div
      style={{
        borderLeft: `3px solid ${style ? style.border : 'var(--color-line)'}`,
        paddingLeft: 12,
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 5 }}>
        <label
          htmlFor={field.key}
          style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-ink-soft)', letterSpacing: 0.2 }}
        >
          {field.label}
        </label>
        {style && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9.5,
              fontWeight: 600,
              letterSpacing: 0.6,
              color: style.tagColor,
            }}
          >
            {style.tag}
          </span>
        )}
      </div>
      <InputTag
        id={field.key}
        value={value ?? ''}
        onChange={(e) => onChange(field.key, e.target.value)}
        rows={field.multiline ? 3 : undefined}
        placeholder="Not provided"
        style={{
          width: '100%',
          fontFamily: field.mono ? 'var(--font-mono)' : 'var(--font-ui)',
          fontSize: 13.5,
          padding: '8px 10px',
          border: '1px solid var(--color-line)',
          borderRadius: 'var(--radius)',
          background: 'var(--color-surface)',
          color: 'var(--color-ink)',
          resize: field.multiline ? 'vertical' : 'none',
        }}
      />
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 0.8,
          color: 'var(--color-ink-faint)',
          textTransform: 'uppercase',
          marginBottom: 12,
          paddingBottom: 6,
          borderBottom: '1px solid var(--color-line-soft)',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

export default function ComplaintForm({
  complaintValues,
  complaintSource,
  riskValues,
  riskSource,
  onFieldChange,
  onRiskFieldChange,
  onSave,
  saving,
}) {
  const sections = [...new Set(COMPLAINT_FIELDS.map((f) => f.section))]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid var(--color-line-soft)',
          background: 'var(--color-surface)',
        }}
      >
        <div>
          <div style={{ fontSize: 19, fontWeight: 700 }}>Log Customer Complaint</div>
          <div style={{ fontSize: 12.5, color: 'var(--color-ink-faint)', marginTop: 2 }}>
            API &amp; FDF Quality Assurance Module
          </div>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          style={{
            fontSize: 13,
            fontWeight: 600,
            padding: '9px 18px',
            background: saving ? 'var(--color-ink-faint)' : 'var(--color-accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: saving ? 'default' : 'pointer',
          }}
        >
          {saving ? 'Committing…' : 'Commit Record'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {sections.map((section) => (
          <Section key={section} title={section}>
            {COMPLAINT_FIELDS.filter((f) => f.section === section).map((field) => (
              <Field
                key={field.key}
                field={field}
                value={complaintValues[field.key]}
                sourceTag={complaintSource[field.key]}
                onChange={onFieldChange}
              />
            ))}
          </Section>
        ))}

        <Section title="Risk Insights">
          {RISK_FIELDS.map((field) => (
            <Field
              key={field.key}
              field={field}
              value={riskValues[field.key]}
              sourceTag={riskSource[field.key]}
              onChange={onRiskFieldChange}
            />
          ))}
        </Section>

        <div
          style={{
            display: 'flex',
            gap: 14,
            fontSize: 11,
            color: 'var(--color-ink-faint)',
            paddingTop: 4,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, background: 'var(--color-accent)', display: 'inline-block' }} />
            agent-filled
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, background: 'var(--color-manual)', display: 'inline-block' }} />
            manually edited
          </span>
        </div>
      </div>
    </div>
  )
}
