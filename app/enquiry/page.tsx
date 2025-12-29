'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

function EnquiryForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  
  const productId = searchParams.get('productId')
  const productName = searchParams.get('productName')
  
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          productId: productId || null,
          userId: session?.user?.id || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to submit enquiry')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
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
          <h1 style={{ color: '#4CAF50', marginBottom: '1rem' }}>✓ Enquiry Submitted!</h1>
          <p>We&apos;ll get back to you soon.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      padding: '2rem',
      maxWidth: '600px',
      margin: '0 auto',
    }}>
      <h1 style={{ marginBottom: '2rem' }}>Product Enquiry</h1>
      
      {productName && (
        <div style={{
          padding: '1rem',
          background: '#e3f2fd',
          borderRadius: '5px',
          marginBottom: '2rem',
        }}>
          <strong>Product:</strong> {productName}
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

        <div style={{ marginBottom: '1rem' }}>
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

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Phone *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
            Message / Requirements
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={5}
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
          {loading ? 'Submitting...' : 'Submit Enquiry'}
        </button>
      </form>
    </div>
  )
}

export default function EnquiryPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: 'calc(100vh - 80px)', padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
      <EnquiryForm />
    </Suspense>
  )
}

