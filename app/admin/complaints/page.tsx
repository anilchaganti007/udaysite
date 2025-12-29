'use client'

import { useEffect, useState } from 'react'

interface Complaint {
  id: string
  orderNumber: string
  subject: string
  description: string
  status: string
  resolution: string | null
  user: {
    name: string
    email: string
  }
  createdAt: string
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [resolution, setResolution] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const response = await fetch('/api/complaints')
      const data = await response.json()
      setComplaints(data)
    } catch (error) {
      console.error('Error fetching complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return

    try {
      const response = await fetch('/api/complaints', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedComplaint.id,
          status: status || selectedComplaint.status,
          resolution,
        }),
      })

      if (response.ok) {
        fetchComplaints()
        setSelectedComplaint(null)
        setResolution('')
        setStatus('')
      }
    } catch (error) {
      console.error('Error updating complaint:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: '#f44336',
      IN_PROGRESS: '#ff9800',
      RESOLVED: '#2ecc71',
      CLOSED: '#95a5a6',
    }
    return colors[status] || '#666'
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Complaint Management</h1>

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
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Order #</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Customer</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Subject</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{complaint.orderNumber}</td>
                    <td style={{ padding: '1rem' }}>
                      <div>{complaint.user.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>{complaint.user.email}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{complaint.subject}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '3px',
                        background: getStatusColor(complaint.status),
                        color: 'white',
                        fontSize: '0.85rem',
                      }}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => {
                          setSelectedComplaint(complaint)
                          setResolution(complaint.resolution || '')
                          setStatus(complaint.status)
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
                        View/Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedComplaint && (
          <div style={{
            width: '400px',
            background: 'white',
            padding: '1.5rem',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: '2rem',
            height: 'fit-content',
            maxHeight: 'calc(100vh - 4rem)',
            overflowY: 'auto',
          }}>
            <h2 style={{ marginBottom: '1rem' }}>Complaint Details</h2>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Order #:</strong> {selectedComplaint.orderNumber}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Customer:</strong> {selectedComplaint.user.name}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Email:</strong> {selectedComplaint.user.email}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Subject:</strong> {selectedComplaint.subject}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Description:</strong>
              <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                {selectedComplaint.description}
              </p>
            </div>

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
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Resolution
              </label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={4}
                placeholder="Enter resolution details..."
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
            </div>

            <button
              onClick={handleUpdateComplaint}
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
              Update Complaint
            </button>
            <button
              onClick={() => {
                setSelectedComplaint(null)
                setResolution('')
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

      {complaints.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
          No complaints found.
        </p>
      )}
    </div>
  )
}

