'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      router.push('/')
    }
  }, [session, router])

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      // On desktop, sidebar is always visible (transform handles it)
      // On mobile, sidebar starts closed but can be toggled
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Access denied. Admin privileges required.</p>
      </div>
    )
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/inventory', label: 'Inventory' },
    { href: '/admin/leads', label: 'Leads' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/complaints', label: 'Complaints' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', position: 'relative' }}>
      {/* Mobile Menu Overlay */}
      {isMobile && sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: isMobile ? '280px' : '250px',
        background: '#2c3e50',
        color: 'white',
        padding: '1.5rem',
        position: isMobile ? 'fixed' : 'relative',
        height: isMobile ? '100vh' : 'auto',
        zIndex: 1000,
        // On desktop (>=769px), always visible. On mobile (<=768px), toggle based on sidebarOpen state
        // Desktop: transform is always translateX(0) = visible
        // Mobile: transform is translateX(0) when sidebarOpen=true, translateX(-100%) when false
        transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
        transition: 'transform 0.3s ease',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Admin Panel</h2>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.25rem',
              }}
            >
              ✕
            </button>
          )}
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setSidebarOpen(false)}
              style={{
                padding: '0.75rem',
                borderRadius: '5px',
                textDecoration: 'none',
                color: pathname === item.href ? '#fff' : '#bdc3c7',
                background: pathname === item.href ? '#34495e' : 'transparent',
                fontWeight: pathname === item.href ? 'bold' : 'normal',
                transition: 'background 0.2s',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => signOut()}
          style={{
            marginTop: '2rem',
            width: '100%',
            padding: '0.75rem',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#c0392b'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#e74c3c'}
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        padding: isMobile ? '1rem' : '2rem', 
        background: '#f5f5f5',
        width: '100%',
        minWidth: 0,
      }}>
        {/* Mobile Menu Toggle */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              background: '#2c3e50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            ☰ Menu
          </button>
        )}
        {children}
      </main>
    </div>
  )
}

