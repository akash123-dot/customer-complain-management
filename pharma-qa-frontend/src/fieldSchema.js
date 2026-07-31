// Shape of complaint_data / the "extractor" & "editor" objects the agent returns.
export const COMPLAINT_FIELDS = [
  { key: 'complaint_source', label: 'Complaint Source', section: 'Origin & Customer Details' },
  { key: 'customer_name', label: 'Customer Name', section: 'Origin & Customer Details' },
  { key: 'product_name', label: 'Product Name', section: 'Product & Batch Identification' },
  { key: 'product_strength', label: 'Product Strength / Grade', section: 'Product & Batch Identification' },
  { key: 'batch_lot_number', label: 'Batch / Lot Number', section: 'Product & Batch Identification', mono: true },
  { key: 'affected_quantity', label: 'Affected Quantity', section: 'Product & Batch Identification' },
  { key: 'manufacturing_date', label: 'Manufacturing Date', section: 'Product & Batch Identification' },
  { key: 'expiry_date', label: 'Expiry Date', section: 'Product & Batch Identification' },
  { key: 'complaint_category', label: 'Complaint Category', section: 'Complaint Details' },
  { key: 'complaint_description', label: 'Complaint Description', section: 'Complaint Details', multiline: true },
  { key: 'complaint_date', label: 'Complaint Date', section: 'Complaint Details' },
]


export const RISK_FIELDS = [
  { key: 'severity', label: 'Severity' },
  { key: 'risk_level', label: 'Risk Level' },
  { key: 'initial_risk_assessment', label: 'Initial Risk Assessment', multiline: true },
  { key: 'suggested_next_action', label: 'Suggested Next Action', multiline: true },
  { key: 'prioritized_action', label: 'Prioritized Action', multiline: true },
]

export function emptyComplaint() {
  return Object.fromEntries(COMPLAINT_FIELDS.map((f) => [f.key, '']))
}

export function emptyRisk() {
  return Object.fromEntries(RISK_FIELDS.map((f) => [f.key, '']))
}


export function mergeAgentFields(existingValues, existingSource, incoming) {
  const values = { ...existingValues }
  const source = { ...existingSource }

  if (!incoming) return { values, source }

  for (const [key, incomingValue] of Object.entries(incoming)) {
    if (incomingValue === null || incomingValue === undefined) {
      
      continue
    }
    values[key] = incomingValue
    source[key] = 'agent'
  }

  return { values, source }
}
