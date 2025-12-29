import { NextRequest, NextResponse } from 'next/server'
import { db, COLLECTIONS } from '@/lib/firebase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateOrderNumber } from '@/lib/utils'
import { convertFirestoreDoc, queryCollection } from '@/lib/firebase-helpers'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let whereClause: Array<[string, any, any]> = []
    
    // Customers can only see their own orders
    if (session.user.role === 'CUSTOMER') {
      whereClause.push(['userId', '==', session.user.id])
    }
    
    if (status) {
      whereClause.push(['status', '==', status])
    }

    const orders = await queryCollection(
      COLLECTIONS.ORDERS,
      whereClause.length > 0 ? whereClause : undefined,
      ['createdAt', 'desc']
    )

    // Fetch order items and user data
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const orderData = convertFirestoreDoc(order)
        
        // Fetch user
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(orderData.userId).get()
        if (userDoc.exists) {
          orderData.user = {
            id: userDoc.id,
            name: userDoc.data()?.name,
            email: userDoc.data()?.email,
          }
        }

        // Fetch order items
        const itemsSnapshot = await db
          .collection(COLLECTIONS.ORDER_ITEMS)
          .where('orderId', '==', orderData.id)
          .get()
        
        orderData.items = await Promise.all(
          itemsSnapshot.docs.map(async (itemDoc: any) => {
            const item = convertFirestoreDoc({ id: itemDoc.id, ...itemDoc.data() })
            
            // Fetch product
            if (item.productId) {
              const productDoc = await db.collection(COLLECTIONS.PRODUCTS).doc(item.productId).get()
              if (productDoc.exists) {
                item.product = convertFirestoreDoc({ id: productDoc.id, ...productDoc.data() })
              }
            }

            // Fetch variant
            if (item.variantId) {
              const variantDoc = await db.collection(COLLECTIONS.PRODUCT_VARIANTS).doc(item.variantId).get()
              if (variantDoc.exists) {
                item.variant = convertFirestoreDoc({ id: variantDoc.id, ...variantDoc.data() })
              }
            }

            return item
          })
        )

        return orderData
      })
    )

    return NextResponse.json(ordersWithDetails)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
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
    const { userId, items, shippingAddress, notes } = body

    // Calculate total amount
    let totalAmount = 0
    for (const item of items) {
      totalAmount += item.price * item.quantity
    }

    // Check inventory availability
    for (const item of items) {
      const inventorySnapshot = await db
        .collection(COLLECTIONS.INVENTORY)
        .where('productId', '==', item.productId)
        .where('variantId', '==', item.variantId || null)
        .limit(1)
        .get()

      if (inventorySnapshot.empty) {
        return NextResponse.json(
          {
            error: `No inventory found for product ${item.productId}`,
          },
          { status: 400 }
        )
      }

      const inventory = convertFirestoreDoc({ 
        id: inventorySnapshot.docs[0].id, 
        ...inventorySnapshot.docs[0].data() 
      })

      if (inventory.quantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient inventory for product ${item.productId}`,
          },
          { status: 400 }
        )
      }
    }

    // Create order
    const orderRef = db.collection(COLLECTIONS.ORDERS).doc()
    const orderNumber = generateOrderNumber()
    const orderData = {
      orderNumber,
      userId,
      status: 'PAYMENT_PENDING',
      totalAmount,
      paymentLink: null,
      paymentVerified: false,
      paymentVerifiedAt: null,
      shippingAddress: shippingAddress || null,
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await orderRef.set(orderData)

    // Create order items
    const batch = db.batch()
    items.forEach((item: any) => {
      const itemRef = db.collection(COLLECTIONS.ORDER_ITEMS).doc()
      batch.set(itemRef, {
        orderId: orderRef.id,
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        price: item.price,
        createdAt: new Date(),
      })
    })
    await batch.commit()

    // Fetch created order with details
    const orderDoc = await db.collection(COLLECTIONS.ORDERS).doc(orderRef.id).get()
    const order = convertFirestoreDoc({ id: orderDoc.id, ...orderDoc.data() })

    // Fetch user
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get()
    if (userDoc.exists) {
      order.user = convertFirestoreDoc({ id: userDoc.id, ...userDoc.data() })
    }

    // Fetch items
    const itemsSnapshot = await db
      .collection(COLLECTIONS.ORDER_ITEMS)
      .where('orderId', '==', orderRef.id)
      .get()
    
    order.items = await Promise.all(
      itemsSnapshot.docs.map(async (itemDoc: any) => {
        const item = convertFirestoreDoc({ id: itemDoc.id, ...itemDoc.data() })
        
        if (item.productId) {
          const productDoc = await db.collection(COLLECTIONS.PRODUCTS).doc(item.productId).get()
          if (productDoc.exists) {
            item.product = convertFirestoreDoc({ id: productDoc.id, ...productDoc.data() })
          }
        }

        if (item.variantId) {
          const variantDoc = await db.collection(COLLECTIONS.PRODUCT_VARIANTS).doc(item.variantId).get()
          if (variantDoc.exists) {
            item.variant = convertFirestoreDoc({ id: variantDoc.id, ...variantDoc.data() })
          }
        }

        return item
      })
    )

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
