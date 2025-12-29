'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <nav style={{
      background: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '1rem clamp(1rem, 4vw, 2rem)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      flexWrap: 'wrap',
    }}>
      <Link 
        href="/" 
        className="logo"
        style={{
          opacity: isActive('/') ? 1 : 0.9,
        }}
      >
        <span className="logo-icon"></span>
        <span>Eggbator</span>
      </Link>
      
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem',
            color: '#333',
          }}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      )}

      {/* Desktop Menu */}
      {!isMobile && (
        <div style={{ 
          display: 'flex', 
          gap: 'clamp(1rem, 2vw, 1.5rem)', 
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
        <Link 
          href="/products" 
          style={{ 
            textDecoration: 'none', 
            color: isActive('/products') ? '#667eea' : '#333', 
            fontWeight: isActive('/products') ? '600' : 'normal',
            borderBottom: isActive('/products') ? '2px solid #667eea' : '2px solid transparent',
            paddingBottom: '0.25rem',
            transition: 'color 0.3s, border-color 0.3s', 
            fontSize: '0.95rem' 
          }} 
          onMouseEnter={(e) => !isActive('/products') && (e.currentTarget.style.color = '#667eea')} 
          onMouseLeave={(e) => !isActive('/products') && (e.currentTarget.style.color = '#333')}
        >
          Products
        </Link>
        <Link 
          href="/spare-parts" 
          style={{ 
            textDecoration: 'none', 
            color: isActive('/spare-parts') ? '#667eea' : '#333', 
            fontWeight: isActive('/spare-parts') ? '600' : 'normal',
            borderBottom: isActive('/spare-parts') ? '2px solid #667eea' : '2px solid transparent',
            paddingBottom: '0.25rem',
            transition: 'color 0.3s, border-color 0.3s', 
            fontSize: '0.95rem' 
          }} 
          onMouseEnter={(e) => !isActive('/spare-parts') && (e.currentTarget.style.color = '#667eea')} 
          onMouseLeave={(e) => !isActive('/spare-parts') && (e.currentTarget.style.color = '#333')}
        >
          Spare Parts
        </Link>
        <Link 
          href="/faq" 
          style={{ 
            textDecoration: 'none', 
            color: isActive('/faq') ? '#667eea' : '#333', 
            fontWeight: isActive('/faq') ? '600' : 'normal',
            borderBottom: isActive('/faq') ? '2px solid #667eea' : '2px solid transparent',
            paddingBottom: '0.25rem',
            transition: 'color 0.3s, border-color 0.3s', 
            fontSize: '0.95rem' 
          }} 
          onMouseEnter={(e) => !isActive('/faq') && (e.currentTarget.style.color = '#667eea')} 
          onMouseLeave={(e) => !isActive('/faq') && (e.currentTarget.style.color = '#333')}
        >
          FAQ
        </Link>
        <Link 
          href="/support" 
          style={{ 
            textDecoration: 'none', 
            color: isActive('/support') ? '#667eea' : '#333', 
            fontWeight: isActive('/support') ? '600' : 'normal',
            borderBottom: isActive('/support') ? '2px solid #667eea' : '2px solid transparent',
            paddingBottom: '0.25rem',
            transition: 'color 0.3s, border-color 0.3s', 
            fontSize: '0.95rem' 
          }} 
          onMouseEnter={(e) => !isActive('/support') && (e.currentTarget.style.color = '#667eea')} 
          onMouseLeave={(e) => !isActive('/support') && (e.currentTarget.style.color = '#333')}
        >
          Support
        </Link>
        {session ? (
          <>
            <Link 
              href="/orders" 
              style={{ 
                textDecoration: 'none', 
                color: isActive('/orders') ? '#667eea' : '#333', 
                fontWeight: isActive('/orders') ? '600' : 'normal',
                borderBottom: isActive('/orders') ? '2px solid #667eea' : '2px solid transparent',
                paddingBottom: '0.25rem',
                transition: 'color 0.3s, border-color 0.3s' 
              }} 
              onMouseEnter={(e) => !isActive('/orders') && (e.currentTarget.style.color = '#667eea')} 
              onMouseLeave={(e) => !isActive('/orders') && (e.currentTarget.style.color = '#333')}
            >
              My Orders
            </Link>
            {session.user.role === 'ADMIN' && (
              <Link 
                href="/admin" 
                style={{ 
                  textDecoration: 'none', 
                  color: isActive('/admin') ? '#667eea' : '#667eea', 
                  fontWeight: isActive('/admin') ? 'bold' : 'bold',
                  borderBottom: isActive('/admin') ? '2px solid #667eea' : '2px solid transparent',
                  paddingBottom: '0.25rem',
                  transition: 'color 0.3s, border-color 0.3s' 
                }} 
                onMouseEnter={(e) => e.currentTarget.style.color = '#764ba2'} 
                onMouseLeave={(e) => e.currentTarget.style.color = '#667eea'}
              >
                Admin
              </Link>
            )}
            <span style={{ color: '#666', fontSize: '0.9rem' }}>{session.user.name}</span>
            <button
              onClick={() => signOut()}
              className="btn btn-danger"
              style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              href="/auth/login" 
              style={{ 
                textDecoration: 'none', 
                color: isActive('/auth/login') ? '#667eea' : '#333', 
                fontWeight: isActive('/auth/login') ? '600' : 'normal',
                borderBottom: isActive('/auth/login') ? '2px solid #667eea' : '2px solid transparent',
                paddingBottom: '0.25rem',
                transition: 'color 0.3s, border-color 0.3s' 
              }} 
              onMouseEnter={(e) => !isActive('/auth/login') && (e.currentTarget.style.color = '#667eea')} 
              onMouseLeave={(e) => !isActive('/auth/login') && (e.currentTarget.style.color = '#333')}
            >
              Login
            </Link>
            <Link href="/auth/register" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>Register</Link>
          </>
        )}
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && isMobile && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#fff',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          width: '100%',
        }}>
          <Link 
            href="/products" 
            style={{ 
              textDecoration: 'none', 
              color: isActive('/products') ? '#667eea' : '#333', 
              fontWeight: isActive('/products') ? '600' : 'normal',
              background: isActive('/products') ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
              padding: '0.5rem',
              borderRadius: '4px',
              transition: 'all 0.3s'
            }} 
            onClick={() => setMobileMenuOpen(false)}
          >
            Products
          </Link>
          <Link 
            href="/spare-parts" 
            style={{ 
              textDecoration: 'none', 
              color: isActive('/spare-parts') ? '#667eea' : '#333', 
              fontWeight: isActive('/spare-parts') ? '600' : 'normal',
              background: isActive('/spare-parts') ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
              padding: '0.5rem',
              borderRadius: '4px',
              transition: 'all 0.3s'
            }} 
            onClick={() => setMobileMenuOpen(false)}
          >
            Spare Parts
          </Link>
          <Link 
            href="/faq" 
            style={{ 
              textDecoration: 'none', 
              color: isActive('/faq') ? '#667eea' : '#333', 
              fontWeight: isActive('/faq') ? '600' : 'normal',
              background: isActive('/faq') ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
              padding: '0.5rem',
              borderRadius: '4px',
              transition: 'all 0.3s'
            }} 
            onClick={() => setMobileMenuOpen(false)}
          >
            FAQ
          </Link>
          <Link 
            href="/support" 
            style={{ 
              textDecoration: 'none', 
              color: isActive('/support') ? '#667eea' : '#333', 
              fontWeight: isActive('/support') ? '600' : 'normal',
              background: isActive('/support') ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
              padding: '0.5rem',
              borderRadius: '4px',
              transition: 'all 0.3s'
            }} 
            onClick={() => setMobileMenuOpen(false)}
          >
            Support
          </Link>
          {session ? (
            <>
              <Link 
                href="/orders" 
                style={{ 
                  textDecoration: 'none', 
                  color: isActive('/orders') ? '#667eea' : '#333', 
                  fontWeight: isActive('/orders') ? '600' : 'normal',
                  background: isActive('/orders') ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  transition: 'all 0.3s'
                }} 
                onClick={() => setMobileMenuOpen(false)}
              >
                My Orders
              </Link>
              {session.user.role === 'ADMIN' && (
                <Link 
                  href="/admin" 
                  style={{ 
                    textDecoration: 'none', 
                    color: isActive('/admin') ? '#667eea' : '#667eea', 
                    fontWeight: 'bold',
                    background: isActive('/admin') ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    transition: 'all 0.3s'
                  }} 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              <span style={{ color: '#666', padding: '0.5rem' }}>{session.user.name}</span>
              <button
                onClick={() => { signOut(); setMobileMenuOpen(false); }}
                className="btn btn-danger"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/auth/login" 
                style={{ 
                  textDecoration: 'none', 
                  color: isActive('/auth/login') ? '#667eea' : '#333', 
                  fontWeight: isActive('/auth/login') ? '600' : 'normal',
                  background: isActive('/auth/login') ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  transition: 'all 0.3s'
                }} 
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link href="/auth/register" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }} onClick={() => setMobileMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

