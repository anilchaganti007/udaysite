'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const userId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'CUSTOMER',
    password: '',
  })

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(`/api/users`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to fetch user')
        return
      }

      const user = data.find((u: any) => u.id === userId)
      if (!user) {
        setError('User not found')
        return
      }

      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        role: user.role || 'CUSTOMER',
        password: '', // Don't pre-fill password
      })
    } catch (err) {
      setError('Failed to load user')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchUser()
    }
  }, [userId, fetchUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const updateData: any = {
        id: userId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        address: formData.address || null,
        role: formData.role,
      }

      // Only include password if it's been changed
      if (formData.password && formData.password.length > 0) {
        updateData.password = formData.password
      }

      const response = await fetch(`/api/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update user')
        return
      }

      router.push('/admin/users')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!session || session.user.role !== 'ADMIN') {
    return <div>Unauthorized</div>
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '0', maxWidth: '100%', width: '100%' }}>
      <div style={{ padding: 'clamp(1rem, 2vw, 2rem)', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: '0.5rem 1rem',
            background: '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          ← Back to Users
        </button>
        <h1 style={{ fontSize: '2rem' }}>Edit User</h1>
      </div>

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

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
            Address
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
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

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Role *
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          >
            <option value="CUSTOMER">Customer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            New Password (leave blank to keep current)
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter new password to change"
            minLength={6}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
          <small style={{ color: '#666', fontSize: '0.85rem' }}>
            Leave blank if you don&apos;t want to change the password
          </small>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: saving ? '#ccc' : '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
      </div>
    </div>
  )
}

