import { NextRequest, NextResponse } from 'next/server'
import { db, COLLECTIONS } from '@/lib/firebase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateQRCode } from '@/lib/utils'
import QRCode from 'qrcode'
import { convertFirestoreDoc, queryCollection } from '@/lib/firebase-helpers'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const variantId = searchParams.get('variantId')

    let whereClause: Array<[string, any, any]> = []
    if (productId) whereClause.push(['productId', '==', productId])
    if (variantId) whereClause.push(['variantId', '==', variantId])

    const inventory = await queryCollection(
      COLLECTIONS.INVENTORY,
      whereClause.length > 0 ? whereClause : undefined,
      ['createdAt', 'desc']
    )

    // Fetch related product and variant data
    const inventoryWithDetails = await Promise.all(
      inventory.map(async (item) => {
        const itemData = convertFirestoreDoc(item)
        
        if (itemData.productId) {
          const productDoc = await db.collection(COLLECTIONS.PRODUCTS).doc(itemData.productId).get()
          if (productDoc.exists) {
            itemData.product = convertFirestoreDoc({ id: productDoc.id, ...productDoc.data() })
          }
        }

        if (itemData.variantId) {
          const variantDoc = await db.collection(COLLECTIONS.PRODUCT_VARIANTS).doc(itemData.variantId).get()
          if (variantDoc.exists) {
            itemData.variant = convertFirestoreDoc({ id: variantDoc.id, ...variantDoc.data() })
          }
        }

        return itemData
      })
    )

    return NextResponse.json(inventoryWithDetails)
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, variantId, quantity, location, notes, qrCode } = body

    // Generate QR code if not provided
    let finalQrCode = qrCode
    if (!finalQrCode) {
      finalQrCode = generateQRCode()
    }

    // Check if QR code already exists
    const existingQr = await db
      .collection(COLLECTIONS.INVENTORY)
      .where('qrCode', '==', finalQrCode)
      .limit(1)
      .get()

    if (!existingQr.empty) {
      return NextResponse.json(
        { error: 'QR code already exists' },
        { status: 400 }
      )
    }

    // Generate QR code image
    const qrCodeDataUrl = await QRCode.toDataURL(finalQrCode)

    const inventoryRef = db.collection(COLLECTIONS.INVENTORY).doc()
    const inventoryData = {
      productId,
      variantId: variantId || null,
      quantity,
      qrCode: finalQrCode,
      location: location || null,
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await inventoryRef.set(inventoryData)

    const inventory = convertFirestoreDoc({ id: inventoryRef.id, ...inventoryData })

    // Fetch product and variant
    const productDoc = await db.collection(COLLECTIONS.PRODUCTS).doc(productId).get()
    if (productDoc.exists) {
      inventory.product = convertFirestoreDoc({ id: productDoc.id, ...productDoc.data() })
    }

    if (variantId) {
      const variantDoc = await db.collection(COLLECTIONS.PRODUCT_VARIANTS).doc(variantId).get()
      if (variantDoc.exists) {
        inventory.variant = convertFirestoreDoc({ id: variantDoc.id, ...variantDoc.data() })
      }
    }

    return NextResponse.json(
      { ...inventory, qrCodeImage: qrCodeDataUrl },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating inventory:', error)
    return NextResponse.json(
      { error: 'Failed to create inventory' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, quantity, location, notes } = body

    const updateData: any = {
      updatedAt: new Date(),
    }
    if (quantity !== undefined) updateData.quantity = quantity
    if (location !== undefined) updateData.location = location
    if (notes !== undefined) updateData.notes = notes

    await db.collection(COLLECTIONS.INVENTORY).doc(id).update(updateData)

    const inventoryDoc = await db.collection(COLLECTIONS.INVENTORY).doc(id).get()
    const inventory = convertFirestoreDoc({ id: inventoryDoc.id, ...inventoryDoc.data() })

    // Fetch product and variant
    if (inventory.productId) {
      const productDoc = await db.collection(COLLECTIONS.PRODUCTS).doc(inventory.productId).get()
      if (productDoc.exists) {
        inventory.product = convertFirestoreDoc({ id: productDoc.id, ...productDoc.data() })
      }
    }

    if (inventory.variantId) {
      const variantDoc = await db.collection(COLLECTIONS.PRODUCT_VARIANTS).doc(inventory.variantId).get()
      if (variantDoc.exists) {
        inventory.variant = convertFirestoreDoc({ id: variantDoc.id, ...variantDoc.data() })
      }
    }

    return NextResponse.json(inventory)
  } catch (error) {
    console.error('Error updating inventory:', error)
    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await db.collection(COLLECTIONS.INVENTORY).doc(id).delete()

    return NextResponse.json({ message: 'Inventory deleted' })
  } catch (error) {
    console.error('Error deleting inventory:', error)
    return NextResponse.json(
      { error: 'Failed to delete inventory' },
      { status: 500 }
    )
  }
}
