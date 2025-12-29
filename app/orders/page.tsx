'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
  items: OrderItem[]
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

export default function OrdersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    fetchOrders()
  }, [session, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
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
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem' }}>My Orders</h1>
      
      {orders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1rem' }}>
            You haven&apos;t placed any orders yet.
          </p>
          <Link
            href="/products"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
            }}
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}>
                <div>
                  <h2 style={{ marginBottom: '0.5rem' }}>Order #{order.orderNumber}</h2>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    padding: '0.5rem 1rem',
                    background: getStatusColor(order.status),
                    color: 'white',
                    borderRadius: '5px',
                    display: 'inline-block',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                  }}>
                    {order.status.replace('_', ' ')}
                  </div>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    ₹{order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Items:</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {order.items.map((item) => (
                    <li key={item.id} style={{ marginBottom: '0.5rem', color: '#666' }}>
                      {item.product.name} {item.variant && `(${item.variant.name})`} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

