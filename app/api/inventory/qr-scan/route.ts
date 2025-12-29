import { NextRequest, NextResponse } from 'next/server'
import { db, COLLECTIONS } from '@/lib/firebase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { convertFirestoreDoc } from '@/lib/firebase-helpers'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { qrCode, quantity, action } = body // action: 'add' or 'remove'

    const inventorySnapshot = await db
      .collection(COLLECTIONS.INVENTORY)
      .where('qrCode', '==', qrCode)
      .limit(1)
      .get()

    if (inventorySnapshot.empty) {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      )
    }

    const inventoryDoc = inventorySnapshot.docs[0]
    const inventory = convertFirestoreDoc({ id: inventoryDoc.id, ...inventoryDoc.data() })

    const newQuantity =
      action === 'add'
        ? inventory.quantity + (quantity || 1)
        : Math.max(0, inventory.quantity - (quantity || 1))

    await db.collection(COLLECTIONS.INVENTORY).doc(inventoryDoc.id).update({
      quantity: newQuantity,
      updatedAt: new Date(),
    })

    const updatedDoc = await db.collection(COLLECTIONS.INVENTORY).doc(inventoryDoc.id).get()
    const updatedInventory = convertFirestoreDoc({ id: updatedDoc.id, ...updatedDoc.data() })

    // Fetch product and variant
    if (updatedInventory.productId) {
      const productDoc = await db.collection(COLLECTIONS.PRODUCTS).doc(updatedInventory.productId).get()
      if (productDoc.exists) {
        updatedInventory.product = convertFirestoreDoc({ id: productDoc.id, ...productDoc.data() })
      }
    }

    if (updatedInventory.variantId) {
      const variantDoc = await db.collection(COLLECTIONS.PRODUCT_VARIANTS).doc(updatedInventory.variantId).get()
      if (variantDoc.exists) {
        updatedInventory.variant = convertFirestoreDoc({ id: variantDoc.id, ...variantDoc.data() })
      }
    }

    return NextResponse.json(updatedInventory)
  } catch (error) {
    console.error('Error scanning QR code:', error)
    return NextResponse.json(
      { error: 'Failed to process QR code' },
      { status: 500 }
    )
  }
}
