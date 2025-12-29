import { NextRequest, NextResponse } from 'next/server'
import { db, COLLECTIONS } from '@/lib/firebase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { convertFirestoreDoc } from '@/lib/firebase-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productDoc = await db.collection(COLLECTIONS.PRODUCTS).doc(id).get()
    
    if (!productDoc.exists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const product = convertFirestoreDoc({ id: productDoc.id, ...productDoc.data() })

    // Get variants - filter by productId first, then filter isActive in memory to avoid index requirement
    const variantsSnapshot = await db
      .collection(COLLECTIONS.PRODUCT_VARIANTS)
      .where('productId', '==', id)
      .get()
    
    product.variants = variantsSnapshot.docs
      .filter((doc: any) => doc.data()?.isActive === true)
      .map((doc: any) =>
        convertFirestoreDoc({ id: doc.id, ...doc.data() })
      )

    // Get inventory
    const inventorySnapshot = await db
      .collection(COLLECTIONS.INVENTORY)
      .where('productId', '==', id)
      .get()
    
    product.inventory = inventorySnapshot.docs.map((doc: any) =>
      convertFirestoreDoc({ id: doc.id, ...doc.data() })
    )

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, type, basePrice, imageUrl, isActive } = body

    const updateData: any = {
      updatedAt: new Date(),
    }
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (type !== undefined) updateData.type = type
    if (basePrice !== undefined) updateData.basePrice = basePrice
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (isActive !== undefined) updateData.isActive = isActive

    await db.collection(COLLECTIONS.PRODUCTS).doc(id).update(updateData)

    const productDoc = await db.collection(COLLECTIONS.PRODUCTS).doc(id).get()
    const product = convertFirestoreDoc({ id: productDoc.id, ...productDoc.data() })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.collection(COLLECTIONS.PRODUCTS).doc(id).update({
      isActive: false,
      updatedAt: new Date(),
    })

    return NextResponse.json({ message: 'Product deleted' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
