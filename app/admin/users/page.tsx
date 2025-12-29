'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface User {
  id: string
  email: string
  name: string
  phone: string | null
  role: string
  isVerified?: boolean
  createdAt: string
}

export default function UsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'customers' | 'admins'>('all')

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

  const handleDelete = async (userId: string, userName: string, userRole: string) => {
    if (deleteConfirm !== userId) {
      // Show confirmation
      const confirmMessage = `Are you sure you want to delete ${userRole === 'ADMIN' ? 'admin' : 'customer'} user "${userName}"?\n\nThis action cannot be undone.`
      if (window.confirm(confirmMessage)) {
        setDeleteConfirm(userId)
      }
      return
    }

    setDeletingUserId(userId)
    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to delete user')
        setDeleteConfirm(null)
        return
      }

      // Remove user from list
      setUsers(users.filter(user => user.id !== userId))
      setDeleteConfirm(null)
      alert(`User "${userName}" deleted successfully`)
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('An error occurred while deleting the user')
      setDeleteConfirm(null)
    } finally {
      setDeletingUserId(null)
    }
  }

  // Filter users based on active tab
  const filteredUsers = activeTab === 'all' 
    ? users 
    : activeTab === 'customers'
    ? users.filter(user => user.role === 'CUSTOMER')
    : users.filter(user => user.role === 'ADMIN')

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

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        borderBottom: '2px solid #ddd',
      }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'all' ? '3px solid #667eea' : '3px solid transparent',
            color: activeTab === 'all' ? '#667eea' : '#666',
            fontWeight: activeTab === 'all' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.2s',
          }}
        >
          All Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'customers' ? '3px solid #667eea' : '3px solid transparent',
            color: activeTab === 'customers' ? '#667eea' : '#666',
            fontWeight: activeTab === 'customers' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.2s',
          }}
        >
          Customers ({users.filter(u => u.role === 'CUSTOMER').length})
        </button>
        <button
          onClick={() => setActiveTab('admins')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'admins' ? '3px solid #667eea' : '3px solid transparent',
            color: activeTab === 'admins' ? '#667eea' : '#666',
            fontWeight: activeTab === 'admins' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.2s',
          }}
        >
          Admins ({users.filter(u => u.role === 'ADMIN').length})
        </button>
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
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Verified</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Created</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                  No {activeTab === 'all' ? '' : activeTab === 'customers' ? 'customer' : 'admin'} users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
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
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '3px',
                    background: user.isVerified === false ? '#e74c3c' : '#2ecc71',
                    color: 'white',
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}>
                    {user.isVerified === false ? '❌ Not Verified' : '✅ Verified'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
                  {session?.user?.id !== user.id ? (
                    <>
                      {deleteConfirm === user.id ? (
                        <>
                          <button
                            onClick={() => handleDelete(user.id, user.name, user.role)}
                            disabled={deletingUserId === user.id}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '0.9rem',
                              cursor: deletingUserId === user.id ? 'not-allowed' : 'pointer',
                              opacity: deletingUserId === user.id ? 0.6 : 1,
                              fontWeight: 'bold',
                            }}
                          >
                            {deletingUserId === user.id ? 'Deleting...' : 'Confirm Delete'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            disabled={deletingUserId === user.id}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#95a5a6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '0.9rem',
                              cursor: deletingUserId === user.id ? 'not-allowed' : 'pointer',
                              opacity: deletingUserId === user.id ? 0.6 : 1,
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleDelete(user.id, user.name, user.role)}
                          disabled={deletingUserId === user.id}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.9rem',
                            cursor: deletingUserId === user.id ? 'not-allowed' : 'pointer',
                            opacity: deletingUserId === user.id ? 0.6 : 1,
                          }}
                        >
                          {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </>
                  ) : (
                    <span style={{ color: '#999', fontSize: '0.85rem', fontStyle: 'italic' }}>
                      Current User
                    </span>
                  )}
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

