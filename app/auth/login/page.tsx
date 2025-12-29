'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect based on role after successful login
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.user.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    }
  }, [status, session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        setLoading(false)
      } else {
        // Wait for session to update, then redirect
        // Use a small delay to ensure session is updated
        setTimeout(async () => {
          // Force session refresh
          const response = await fetch('/api/auth/session')
          const sessionData = await response.json()
          
          if (sessionData?.user?.role === 'ADMIN') {
            router.push('/admin')
          } else {
            router.push('/')
          }
          router.refresh()
          setLoading(false)
        }, 200)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h1 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#333' }}>
          Login
        </h1>
        
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
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            marginBottom: '1rem',
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p style={{ textAlign: 'center', color: '#666' }}>
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" style={{ color: '#667eea', textDecoration: 'none' }}>
            Register here
          </Link>
        </p>
      </form>
    </div>
  )
}

