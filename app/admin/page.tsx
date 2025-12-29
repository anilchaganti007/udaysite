'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalLeads: 0,
    pendingOrders: 0,
    newLeads: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [usersRes, productsRes, ordersRes, leadsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/leads'),
      ])

      const users = await usersRes.json()
      const products = await productsRes.json()
      const orders = await ordersRes.json()
      const leads = await leadsRes.json()

      setStats({
        totalUsers: users.length,
        totalProducts: products.length,
        totalOrders: orders.length,
        totalLeads: leads.length,
        pendingOrders: orders.filter((o: any) => 
          ['PENDING', 'PAYMENT_PENDING'].includes(o.status)
        ).length,
        newLeads: leads.filter((l: any) => l.status === 'NEW').length,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, color: '#3498db', href: '/admin/users' },
    { label: 'Total Products', value: stats.totalProducts, color: '#2ecc71', href: '/admin/products' },
    { label: 'Total Orders', value: stats.totalOrders, color: '#9b59b6', href: '/admin/orders' },
    { label: 'Total Leads', value: stats.totalLeads, color: '#e67e22', href: '/admin/leads' },
    { label: 'Pending Orders', value: stats.pendingOrders, color: '#f39c12', href: '/admin/orders?status=PENDING' },
    { label: 'New Leads', value: stats.newLeads, color: '#e74c3c', href: '/admin/leads?status=NEW' },
  ]

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Admin Dashboard</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              textDecoration: 'none',
              color: 'inherit',
              borderLeft: `4px solid ${card.color}`,
            }}
          >
            <h3 style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              {card.label}
            </h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: card.color }}>
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            href="/admin/products/new"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#2ecc71',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
            }}
          >
            Add Product
          </Link>
          <Link
            href="/admin/inventory/new"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3498db',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
            }}
          >
            Add Inventory
          </Link>
          <Link
            href="/admin/users/new"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#9b59b6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
            }}
          >
            Add User
          </Link>
        </div>
      </div>
    </div>
  )
}

