'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function Home() {
  const { data: session } = useSession()

  return (
    <main style={{
      minHeight: 'calc(100vh - 80px)',
      padding: '2rem 1rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
    }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: '1rem', color: 'white' }}>
          Welcome to Eggbator
        </h1>
        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', marginBottom: '3rem', opacity: 0.9 }}>
          Professional Egg Incubator Solutions - Manage your products, inventory, and orders efficiently
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginTop: '3rem',
        }}>
          <Link href="/products" style={{
            padding: '2rem',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'white',
            backdropFilter: 'blur(10px)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)'
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          >
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Main Products</h2>
            <p>Browse our main product line with various capacities</p>
          </Link>
          
          <Link href="/spare-parts" style={{
            padding: '2rem',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'white',
            backdropFilter: 'blur(10px)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)'
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          >
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Spare Parts</h2>
            <p>Find replacement parts and accessories</p>
          </Link>
          
          <Link href="/faq" style={{
            padding: '2rem',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'white',
            backdropFilter: 'blur(10px)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)'
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          >
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>FAQ</h2>
            <p>Get answers to common questions</p>
          </Link>
          
          {session && (
            <Link href="/orders" style={{
              padding: '2rem',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'white',
              backdropFilter: 'blur(10px)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>My Orders</h2>
              <p>View your order history</p>
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
