'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface Variant {
  id?: string
  name: string
  capacity: string
  price: number
  sku: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const productId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'MAIN_PRODUCT',
    basePrice: '',
    imageUrl: '',
    isActive: true,
  })
  
  const [variants, setVariants] = useState<Variant[]>([])

  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to fetch product')
        return
      }

      setFormData({
        name: data.name || '',
        description: data.description || '',
        type: data.type || 'MAIN_PRODUCT',
        basePrice: data.basePrice?.toString() || '',
        imageUrl: data.imageUrl || '',
        isActive: data.isActive !== false,
      })

      if (data.variants) {
        setVariants(data.variants.map((v: any) => ({
          id: v.id,
          name: v.name || '',
          capacity: v.capacity || '',
          price: v.price || 0,
          sku: v.sku || '',
        })))
      }
    } catch (err) {
      setError('Failed to load product')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId, fetchProduct])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const productData = {
        ...formData,
        basePrice: formData.basePrice ? parseFloat(formData.basePrice) : null,
        isActive: formData.isActive,
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update product')
        return
      }

      router.push('/admin/products')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setSaving(false)
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
          ← Back to Products
        </button>
        <h1 style={{ fontSize: '2rem' }}>Edit Product</h1>
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
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              style={{ width: 'auto' }}
            />
            Product is Active
          </label>
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

