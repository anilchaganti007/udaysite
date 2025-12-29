'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SupportPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [formData, setFormData] = useState({
    orderId: '',
    orderNumber: '',
    subject: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (session) {
      fetchOrders()
    }
  }, [session])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!session) {
      router.push('/auth/login')
      return
    }

    if (!formData.orderNumber) {
      setError('Order number is required')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to submit complaint')
        return
      }

      setSuccess(true)
      setFormData({
        orderId: '',
        orderNumber: '',
        subject: '',
        description: '',
      })
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          textAlign: 'center',
        }}>
          <p style={{ marginBottom: '1rem' }}>Please login to submit a complaint.</p>
          <button
            onClick={() => router.push('/auth/login')}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
    }}>
      <h1 style={{ marginBottom: '2rem' }}>Customer Support / Complaint</h1>

      {success && (
        <div style={{
          padding: '1rem',
          background: '#d4edda',
          color: '#155724',
          borderRadius: '5px',
          marginBottom: '1rem',
        }}>
          Complaint submitted successfully! We&apos;ll get back to you soon.
        </div>
      )}

      <form onSubmit={handleSubmit} style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        {error && (
          <div style={{
            padding: '0.75rem',
            background: '#fee',
            color: '#c33',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Order Number *
          </label>
          {orders.length > 0 ? (
            <select
              value={formData.orderId}
              onChange={(e) => {
                const selectedOrder = orders.find(o => o.id === e.target.value)
                setFormData({
                  ...formData,
                  orderId: e.target.value,
                  orderNumber: selectedOrder?.orderNumber || '',
                })
              }}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            >
              <option value="">Select an order</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.orderNumber} - ₹{order.totalAmount}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={formData.orderNumber}
              onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
              placeholder="Enter your order number"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            />
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Subject *
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              resize: 'vertical',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: loading ? '#ccc' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  )
}

