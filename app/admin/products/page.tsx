'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string | null
  type: string
  basePrice: number | null
  isActive: boolean
  variants: ProductVariant[]
}

interface ProductVariant {
  id: string
  name: string
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
      const response = await fetch('/api/products?includeVariants=true')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Product Management</h1>
        <Link
          href="/admin/products/new"
          style={{
            padding: '0.75rem 1.5rem',
            background: '#2ecc71',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
          }}
        >
          Add Product
        </Link>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
      }}>
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ marginBottom: '0.5rem' }}>{product.name}</h2>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '3px',
                  background: product.type === 'MAIN_PRODUCT' ? '#3498db' : '#e67e22',
                  color: 'white',
                  fontSize: '0.85rem',
                  marginRight: '0.5rem',
                }}>
                  {product.type.replace('_', ' ')}
                </span>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '3px',
                  background: product.isActive ? '#2ecc71' : '#95a5a6',
                  color: 'white',
                  fontSize: '0.85rem',
                }}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {product.description && (
              <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {product.description}
              </p>
            )}

            {product.variants && product.variants.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Variants:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  {product.variants.map((variant) => (
                    <li key={variant.id} style={{ fontSize: '0.9rem' }}>
                      {variant.name} - ₹{variant.price}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <Link
                href={`/admin/products/${product.id}`}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: '#3498db',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                }}
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(product.id)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
          No products found. Create your first product!
        </p>
      )}
    </div>
  )
}

