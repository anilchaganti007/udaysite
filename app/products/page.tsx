'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string | null
  type: string
  basePrice: number | null
  imageUrl: string | null
  variants: ProductVariant[]
}

interface ProductVariant {
  id: string
  name: string
  capacity: string | null
  price: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?type=MAIN_PRODUCT&includeVariants=true')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem' }}>Main Products</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '2rem',
      }}>
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '10px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}
              />
            )}
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>{product.name}</h2>
            {product.description && (
              <p style={{ color: '#666', marginBottom: '1rem' }}>{product.description}</p>
            )}
            
            {product.variants && product.variants.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Variants:</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {product.variants.map((variant) => (
                    <li key={variant.id} style={{ marginBottom: '0.5rem' }}>
                      {variant.name} {variant.capacity && `(${variant.capacity})`} - ₹{variant.price}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Link
              href={`/enquiry?productId=${product.id}&productName=${encodeURIComponent(product.name)}`}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '0.75rem',
                background: '#667eea',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '5px',
                marginTop: '1rem',
              }}
            >
              Enquire Now
            </Link>
          </div>
        ))}
      </div>
      
      {products.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
          No products available at the moment.
        </p>
      )}
    </div>
  )
}

