'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Inventory {
  id: string
  quantity: number
  qrCode: string | null
  location: string | null
  product: {
    name: string
  }
  variant: {
    name: string
  } | null
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(true)
  const [qrCode, setQrCode] = useState('')
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory')
      const data = await response.json()
      setInventory(data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQRScan = async (action: 'add' | 'remove') => {
    if (!qrCode.trim()) {
      alert('Please enter a QR code')
      return
    }

    setScanning(true)
    try {
      const response = await fetch('/api/inventory/qr-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCode: qrCode.trim(),
          action,
          quantity: 1,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to process QR code')
        return
      }

      alert(`Inventory ${action === 'add' ? 'added' : 'removed'} successfully!`)
      setQrCode('')
      fetchInventory()
    } catch (error) {
      alert('An error occurred')
    } finally {
      setScanning(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inventory entry?')) return

    try {
      const response = await fetch(`/api/inventory?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchInventory()
      }
    } catch (error) {
      console.error('Error deleting inventory:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Inventory Management</h1>
        <Link
          href="/admin/inventory/new"
          style={{
            padding: '0.75rem 1.5rem',
            background: '#2ecc71',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
          }}
        >
          Add Inventory
        </Link>
      </div>

      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
      }}>
        <h2 style={{ marginBottom: '1rem' }}>QR Code Scanner</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
            placeholder="Enter or scan QR code"
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
          <button
            onClick={() => handleQRScan('add')}
            disabled={scanning}
            style={{
              padding: '0.75rem 1.5rem',
              background: scanning ? '#ccc' : '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: scanning ? 'not-allowed' : 'pointer',
            }}
          >
            Add
          </button>
          <button
            onClick={() => handleQRScan('remove')}
            disabled={scanning}
            style={{
              padding: '0.75rem 1.5rem',
              background: scanning ? '#ccc' : '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: scanning ? 'not-allowed' : 'pointer',
            }}
          >
            Remove
          </button>
        </div>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Product</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Variant</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Quantity</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>QR Code</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Location</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem' }}>{item.product.name}</td>
                <td style={{ padding: '1rem' }}>{item.variant?.name || '-'}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '3px',
                    background: item.quantity > 0 ? '#2ecc71' : '#e74c3c',
                    color: 'white',
                    fontWeight: 'bold',
                  }}>
                    {item.quantity}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                  {item.qrCode || '-'}
                </td>
                <td style={{ padding: '1rem' }}>{item.location || '-'}</td>
                <td style={{ padding: '1rem' }}>
                  <Link
                    href={`/admin/inventory/${item.id}`}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#3498db',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      marginRight: '0.5rem',
                    }}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {inventory.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
          No inventory entries found.
        </p>
      )}
    </div>
  )
}

