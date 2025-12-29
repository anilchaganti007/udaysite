'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface Variant {
  name: string
  capacity: string
  price: number
  sku: string
}

export default function NewProductPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'MAIN_PRODUCT',
    basePrice: '',
    imageUrl: '',
  })
  
  const [variants, setVariants] = useState<Variant[]>([
    { name: '', capacity: '', price: 0, sku: '' }
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const productData = {
        ...formData,
        basePrice: formData.basePrice ? parseFloat(formData.basePrice) : null,
        variants: variants.filter(v => v.name && v.price > 0).map(v => ({
          name: v.name,
          capacity: v.capacity || null,
          price: parseFloat(v.price.toString()),
          sku: v.sku || null,
        })),
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create product')
        return
      }

      router.push('/admin/products')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addVariant = () => {
    setVariants([...variants, { name: '', capacity: '', price: 0, sku: '' }])
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }
    setVariants(updated)
  }

  if (!session || session.user.role !== 'ADMIN') {
    return <div>Unauthorized</div>
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
          ← Back to Products
        </button>
        <h1 style={{ fontSize: '2rem' }}>Add New Product</h1>
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
            Product Name *
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
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
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
            Product Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          >
            <option value="MAIN_PRODUCT">Main Product</option>
            <option value="SPARE_PART">Spare Part</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Base Price (₹)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
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
            Image URL
          </label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <label style={{ fontWeight: 'bold' }}>Product Variants / Capacities</label>
            <button
              type="button"
              onClick={addVariant}
              style={{
                padding: '0.5rem 1rem',
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              + Add Variant
            </button>
          </div>

          {variants.map((variant, index) => (
            <div
              key={index}
              style={{
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '1rem',
                background: '#f9f9f9',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong>Variant {index + 1}</strong>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                    Variant Name *
                  </label>
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) => updateVariant(index, 'name', e.target.value)}
                    placeholder="e.g., 5L, 10L, Standard"
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                    Capacity
                  </label>
                  <input
                    type="text"
                    value={variant.capacity}
                    onChange={(e) => updateVariant(index, 'capacity', e.target.value)}
                    placeholder="e.g., 5L, 10L"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={variant.price}
                    onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                    SKU
                  </label>
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                    placeholder="Stock Keeping Unit"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: loading ? '#ccc' : '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Creating...' : 'Create Product'}
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

