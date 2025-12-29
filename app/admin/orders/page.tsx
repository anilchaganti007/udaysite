'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  paymentLink: string | null
  paymentVerified: boolean
  user: {
    name: string
    email: string
  }
  items: OrderItem[]
  createdAt: string
}

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    name: string
  }
  variant: {
    name: string
  } | null
}

function OrdersContent() {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [paymentLink, setPaymentLink] = useState('')
  const [status, setStatus] = useState('')

  const fetchOrders = useCallback(async () => {
    try {
      const statusParam = searchParams.get('status')
      const url = statusParam ? `/api/orders?status=${statusParam}` : '/api/orders'
      const response = await fetch(url)
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return

    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: status || selectedOrder.status,
          paymentLink: paymentLink || selectedOrder.paymentLink,
          paymentVerified: status === 'PAYMENT_VERIFIED' || selectedOrder.paymentVerified,
        }),
      })

      if (response.ok) {
        fetchOrders()
        setSelectedOrder(null)
        setPaymentLink('')
        setStatus('')
      }
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: '#ff9800',
      PAYMENT_PENDING: '#f44336',
      PAYMENT_VERIFIED: '#2196f3',
      PROCESSING: '#2196f3',
      SHIPPED: '#9c27b0',
      DELIVERED: '#4caf50',
      CANCELLED: '#9e9e9e',
    }
    return colors[status] || '#666'
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Order Management</h1>

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
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Amount</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{order.orderNumber}</td>
                    <td style={{ padding: '1rem' }}>
                      <div>{order.user.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>{order.user.email}</div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>₹{order.totalAmount.toFixed(2)}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '3px',
                        background: getStatusColor(order.status),
                        color: 'white',
                        fontSize: '0.85rem',
                      }}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => {
                          setSelectedOrder(order)
                          setPaymentLink(order.paymentLink || '')
                          setStatus(order.status)
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
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedOrder && (
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
            <h2 style={{ marginBottom: '1rem' }}>Order Details</h2>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Order #:</strong> {selectedOrder.orderNumber}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Customer:</strong> {selectedOrder.user.name}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Email:</strong> {selectedOrder.user.email}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Total:</strong> ₹{selectedOrder.totalAmount.toFixed(2)}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong>Items:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                {selectedOrder.items.map((item) => (
                  <li key={item.id} style={{ marginBottom: '0.5rem' }}>
                    {item.product.name} {item.variant && `(${item.variant.name})`} × {item.quantity}
                  </li>
                ))}
              </ul>
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
                <option value="PENDING">PENDING</option>
                <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
                <option value="PAYMENT_VERIFIED">PAYMENT_VERIFIED</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Payment Link
              </label>
              <input
                type="text"
                value={paymentLink}
                onChange={(e) => setPaymentLink(e.target.value)}
                placeholder="Enter payment link"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
            </div>

            {selectedOrder.paymentLink && (
              <div style={{ marginBottom: '1rem' }}>
                <a
                  href={selectedOrder.paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    padding: '0.5rem',
                    background: '#e3f2fd',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    color: '#1976d2',
                    wordBreak: 'break-all',
                  }}
                >
                  {selectedOrder.paymentLink}
                </a>
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={selectedOrder.paymentVerified}
                  onChange={(e) => {
                    setStatus(e.target.checked ? 'PAYMENT_VERIFIED' : selectedOrder.status)
                  }}
                />
                Payment Verified
              </label>
            </div>

            <button
              onClick={handleUpdateOrder}
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
              Update Order
            </button>
            <button
              onClick={() => {
                setSelectedOrder(null)
                setPaymentLink('')
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

      {orders.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
          No orders found.
        </p>
      )}
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
      <OrdersContent />
    </Suspense>
  )
}

