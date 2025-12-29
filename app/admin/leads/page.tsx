'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  message: string | null
  status: string
  notes: string | null
  product: {
    name: string
  } | null
  createdAt: string
}

function LeadsContent() {
  const searchParams = useSearchParams()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('')

  const fetchLeads = useCallback(async () => {
    try {
      const statusParam = searchParams.get('status')
      const url = statusParam ? `/api/leads?status=${statusParam}` : '/api/leads'
      const response = await fetch(url)
      const data = await response.json()
      setLeads(data)
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleUpdateLead = async () => {
    if (!selectedLead) return

    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedLead.id,
          status: status || selectedLead.status,
          notes,
        }),
      })

      if (response.ok) {
        fetchLeads()
        setSelectedLead(null)
        setNotes('')
        setStatus('')
      }
    } catch (error) {
      console.error('Error updating lead:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: '#3498db',
      CONTACTED: '#f39c12',
      CONVERTED: '#2ecc71',
      CLOSED: '#95a5a6',
    }
    return colors[status] || '#666'
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Lead Management</h1>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{
            background: 'white',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Contact</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Product</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem' }}>{lead.name}</td>
                    <td style={{ padding: '1rem' }}>
                      <div>{lead.email}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>{lead.phone}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{lead.product?.name || '-'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '3px',
                        background: getStatusColor(lead.status),
                        color: 'white',
                        fontSize: '0.85rem',
                      }}>
                        {lead.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => {
                          setSelectedLead(lead)
                          setNotes(lead.notes || '')
                          setStatus(lead.status)
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#3498db',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                        }}
                      >
                        View/Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedLead && (
          <div style={{
            width: '400px',
            background: 'white',
            padding: '1.5rem',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: '2rem',
            height: 'fit-content',
          }}>
            <h2 style={{ marginBottom: '1rem' }}>Lead Details</h2>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Name:</strong> {selectedLead.name}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Email:</strong> {selectedLead.email}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Phone:</strong> {selectedLead.phone}
            </div>
            {selectedLead.product && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Product:</strong> {selectedLead.product.name}
              </div>
            )}
            {selectedLead.message && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Message:</strong>
                <p style={{ marginTop: '0.5rem', color: '#666' }}>{selectedLead.message}</p>
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              >
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="CONVERTED">CONVERTED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
            </div>

            <button
              onClick={handleUpdateLead}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginBottom: '0.5rem',
              }}
            >
              Update Lead
            </button>
            <button
              onClick={() => {
                setSelectedLead(null)
                setNotes('')
                setStatus('')
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>

      {leads.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
          No leads found.
        </p>
      )}
    </div>
  )
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
      <LeadsContent />
    </Suspense>
  )
}

