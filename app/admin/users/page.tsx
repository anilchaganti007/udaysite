'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string
  phone: string | null
  role: string
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>User Management</h1>
        <Link
          href="/admin/users/new"
          style={{
            padding: '0.75rem 1.5rem',
            background: '#2ecc71',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
          }}
        >
          Add User
        </Link>
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
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Email</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Phone</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Role</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Created</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem' }}>{user.name}</td>
                <td style={{ padding: '1rem' }}>{user.email}</td>
                <td style={{ padding: '1rem' }}>{user.phone || '-'}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '3px',
                    background: user.role === 'ADMIN' ? '#e74c3c' : '#3498db',
                    color: 'white',
                    fontSize: '0.85rem',
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '1rem' }}>
                  <Link
                    href={`/admin/users/${user.id}`}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#3498db',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                    }}
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

