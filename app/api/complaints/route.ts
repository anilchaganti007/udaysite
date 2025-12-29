import { NextRequest, NextResponse } from 'next/server'
import { db, COLLECTIONS } from '@/lib/firebase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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
    
    // Customers can only see their own complaints
    if (session.user.role === 'CUSTOMER') {
      whereClause.push(['userId', '==', session.user.id])
    }
    
    if (status) {
      whereClause.push(['status', '==', status])
    }

    const complaints = await queryCollection(
      COLLECTIONS.COMPLAINTS,
      whereClause.length > 0 ? whereClause : undefined,
      ['createdAt', 'desc']
    )

    // Fetch related user and order data
    const complaintsWithDetails = await Promise.all(
      complaints.map(async (complaint) => {
        const complaintData = convertFirestoreDoc(complaint)
        
        // Fetch user
        if (complaintData.userId) {
          const userDoc = await db.collection(COLLECTIONS.USERS).doc(complaintData.userId).get()
          if (userDoc.exists) {
            complaintData.user = {
              id: userDoc.id,
              name: userDoc.data()?.name,
              email: userDoc.data()?.email,
            }
          }
        }

        // Fetch order
        if (complaintData.orderId) {
          const orderDoc = await db.collection(COLLECTIONS.ORDERS).doc(complaintData.orderId).get()
          if (orderDoc.exists) {
            const orderData = orderDoc.data()
            complaintData.order = {
              id: orderDoc.id,
              orderNumber: orderData?.orderNumber,
              status: orderData?.status,
            }
          }
        }

        return complaintData
      })
    )

    return NextResponse.json(complaintsWithDetails)
  } catch (error) {
    console.error('Error fetching complaints:', error)
    return NextResponse.json(
      { error: 'Failed to fetch complaints' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, orderNumber, subject, description } = body

    // Verify order belongs to user
    const orderDoc = await db.collection(COLLECTIONS.ORDERS).doc(orderId).get()
    
    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = convertFirestoreDoc({ id: orderDoc.id, ...orderDoc.data() })

    if (session.user.role === 'CUSTOMER' && order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const complaintRef = db.collection(COLLECTIONS.COMPLAINTS).doc()
    const complaintData = {
      userId: session.user.id,
      orderId,
      orderNumber,
      subject,
      description,
      status: 'OPEN',
      resolution: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await complaintRef.set(complaintData)

    const complaint = convertFirestoreDoc({ id: complaintRef.id, ...complaintData })

    // Fetch order
    const orderDoc2 = await db.collection(COLLECTIONS.ORDERS).doc(orderId).get()
    if (orderDoc2.exists) {
      complaint.order = convertFirestoreDoc({ id: orderDoc2.id, ...orderDoc2.data() })
    }

    // Fetch user
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(session.user.id).get()
    if (userDoc.exists) {
      complaint.user = convertFirestoreDoc({ id: userDoc.id, ...userDoc.data() })
    }

    return NextResponse.json(complaint, { status: 201 })
  } catch (error) {
    console.error('Error creating complaint:', error)
    return NextResponse.json(
      { error: 'Failed to create complaint' },
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
    const { id, status, resolution } = body

    const updateData: any = {
      updatedAt: new Date(),
    }
    if (status) updateData.status = status
    if (resolution !== undefined) updateData.resolution = resolution

    await db.collection(COLLECTIONS.COMPLAINTS).doc(id).update(updateData)

    const complaintDoc = await db.collection(COLLECTIONS.COMPLAINTS).doc(id).get()
    const complaint = convertFirestoreDoc({ id: complaintDoc.id, ...complaintDoc.data() })

    // Fetch user and order
    if (complaint.userId) {
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(complaint.userId).get()
      if (userDoc.exists) {
        complaint.user = convertFirestoreDoc({ id: userDoc.id, ...userDoc.data() })
      }
    }

    if (complaint.orderId) {
      const orderDoc = await db.collection(COLLECTIONS.ORDERS).doc(complaint.orderId).get()
      if (orderDoc.exists) {
        complaint.order = convertFirestoreDoc({ id: orderDoc.id, ...orderDoc.data() })
      }
    }

    return NextResponse.json(complaint)
  } catch (error) {
    console.error('Error updating complaint:', error)
    return NextResponse.json(
      { error: 'Failed to update complaint' },
      { status: 500 }
    )
  }
}
