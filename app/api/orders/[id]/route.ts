import { NextRequest, NextResponse } from 'next/server'
import { db, COLLECTIONS } from '@/lib/firebase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { generateOrderPDF } from '@/lib/pdf'
import { convertFirestoreDoc } from '@/lib/firebase-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderDoc = await db.collection(COLLECTIONS.ORDERS).doc(id).get()
    
    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = convertFirestoreDoc({ id: orderDoc.id, ...orderDoc.data() })

    // Customers can only see their own orders
    if (
      session.user.role === 'CUSTOMER' &&
      order.userId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Fetch user
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(order.userId).get()
    if (userDoc.exists) {
      order.user = {
        id: userDoc.id,
        name: userDoc.data()?.name,
        email: userDoc.data()?.email,
        phone: userDoc.data()?.phone,
      }
    }

    // Fetch order items
    const itemsSnapshot = await db
      .collection(COLLECTIONS.ORDER_ITEMS)
      .where('orderId', '==', id)
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

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
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
    const {
      status,
      paymentLink,
      paymentVerified,
      shippingAddress,
      notes,
    } = body

    const orderDoc = await db.collection(COLLECTIONS.ORDERS).doc(id).get()
    
    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = convertFirestoreDoc({ id: orderDoc.id, ...orderDoc.data() })

    const updateData: any = {
      updatedAt: new Date(),
    }
    if (status) updateData.status = status
    if (paymentLink !== undefined) updateData.paymentLink = paymentLink
    if (paymentVerified !== undefined) {
      updateData.paymentVerified = paymentVerified
      if (paymentVerified) {
        updateData.paymentVerifiedAt = new Date()
      }
    }
    if (shippingAddress !== undefined)
      updateData.shippingAddress = shippingAddress
    if (notes !== undefined) updateData.notes = notes

    await db.collection(COLLECTIONS.ORDERS).doc(id).update(updateData)

    // Fetch updated order
    const updatedOrderDoc = await db.collection(COLLECTIONS.ORDERS).doc(id).get()
    const updatedOrder = convertFirestoreDoc({ id: updatedOrderDoc.id, ...updatedOrderDoc.data() })

    // Fetch user
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(updatedOrder.userId).get()
    if (userDoc.exists) {
      updatedOrder.user = convertFirestoreDoc({ id: userDoc.id, ...userDoc.data() })
    }

    // Fetch order items
    const itemsSnapshot = await db
      .collection(COLLECTIONS.ORDER_ITEMS)
      .where('orderId', '==', id)
      .get()
    
    updatedOrder.items = await Promise.all(
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

    // If payment is verified, deduct inventory and send confirmation
    if (paymentVerified && !order.paymentVerified) {
      // Fetch order items for inventory deduction
      const itemsSnapshot = await db
        .collection(COLLECTIONS.ORDER_ITEMS)
        .where('orderId', '==', id)
        .get()

      // Deduct inventory
      for (const itemDoc of itemsSnapshot.docs) {
        const item = convertFirestoreDoc({ id: (itemDoc as any).id, ...(itemDoc as any).data() })
        
        const inventorySnapshot = await db
          .collection(COLLECTIONS.INVENTORY)
          .where('productId', '==', item.productId)
          .where('variantId', '==', item.variantId || null)
          .limit(1)
          .get()

        if (!inventorySnapshot.empty) {
          const inventoryDoc = inventorySnapshot.docs[0]
          const inventory = convertFirestoreDoc({ 
            id: inventoryDoc.id, 
            ...inventoryDoc.data() 
          })
          
          await db.collection(COLLECTIONS.INVENTORY).doc(inventoryDoc.id).update({
            quantity: Math.max(0, inventory.quantity - item.quantity),
            updatedAt: new Date(),
          })
        }
      }

      // Generate PDF and send email
      try {
        const pdfBuffer = generateOrderPDF(updatedOrder.orderNumber, {
          customerName: updatedOrder.user.name,
          customerEmail: updatedOrder.user.email,
          totalAmount: updatedOrder.totalAmount,
          status: updatedOrder.status,
          items: updatedOrder.items.map((item: any) => ({
            productName: item.product?.name || 'Unknown',
            variantName: item.variant?.name,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddress: updatedOrder.shippingAddress,
        })

        await sendOrderConfirmationEmail(
          updatedOrder.user.email,
          updatedOrder.orderNumber,
          {
            customerName: updatedOrder.user.name,
            totalAmount: updatedOrder.totalAmount,
            status: updatedOrder.status,
          },
          pdfBuffer
        )
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
