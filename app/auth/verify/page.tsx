'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      // Use setTimeout to avoid setState in effect warning
      const timer = setTimeout(() => {
        setStatus('error')
        setMessage('No verification token provided.')
      }, 0)
      return () => clearTimeout(timer)
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify?token=${token}`)
        const data = await response.json()

        if (!response.ok) {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
          return
        }

        setStatus('success')
        setMessage(data.message || 'Email verified successfully!')
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login?verified=true')
        }, 3000)
      } catch (error) {
        setStatus('error')
        setMessage('An error occurred during verification. Please try again.')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center',
      }}>
        {status === 'loading' && (
          <>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
            }}>⏳</div>
            <h1 style={{ marginBottom: '1rem', color: '#333' }}>
              Verifying Your Email...
            </h1>
            <p style={{ color: '#666' }}>
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
            }}>✅</div>
            <h1 style={{ marginBottom: '1rem', color: '#2ecc71' }}>
              Email Verified!
            </h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              {message}
            </p>
            <p style={{ color: '#999', fontSize: '0.9rem' }}>
              Redirecting to login page...
            </p>
            <Link 
              href="/auth/login?verified=true"
              style={{
                display: 'inline-block',
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: '#667eea',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '5px',
              }}
            >
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
            }}>❌</div>
            <h1 style={{ marginBottom: '1rem', color: '#e74c3c' }}>
              Verification Failed
            </h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              {message}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link 
                href="/auth/login"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#667eea',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '5px',
                }}
              >
                Go to Login
              </Link>
              <Link 
                href="/auth/register"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#95a5a6',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '5px',
                }}
              >
                Register Again
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p>Loading...</p>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}

