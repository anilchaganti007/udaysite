import { NextRequest, NextResponse } from 'next/server'
import { db, COLLECTIONS } from '@/lib/firebase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { convertFirestoreDoc, queryCollection } from '@/lib/firebase-helpers'
import { sendLeadNotificationToAdmins, sendLeadThankYouEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Public users can only see their own leads
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let whereClause: Array<[string, any, any]> = []
    
    // Customers can only see their own leads
    if (session.user.role === 'CUSTOMER') {
      whereClause.push(['userId', '==', session.user.id])
    }
    
    if (status) {
      whereClause.push(['status', '==', status])
    }

    const leads = await queryCollection(
      COLLECTIONS.LEADS,
      whereClause.length > 0 ? whereClause : undefined,
      ['createdAt', 'desc']
    )

    // Fetch related product and user data
    const leadsWithDetails = await Promise.all(
      leads.map(async (lead) => {
        const leadData = convertFirestoreDoc(lead)
        
        if (leadData.productId) {
          const productDoc = await db.collection(COLLECTIONS.PRODUCTS).doc(leadData.productId).get()
          if (productDoc.exists) {
            leadData.product = convertFirestoreDoc({ id: productDoc.id, ...productDoc.data() })
            
            // Get variants
            const variantsSnapshot = await db
              .collection(COLLECTIONS.PRODUCT_VARIANTS)
              .where('productId', '==', leadData.productId)
              .get()
            
            leadData.product.variants = variantsSnapshot.docs.map((doc: any) =>
              convertFirestoreDoc({ id: doc.id, ...doc.data() })
            )
          }
        }

        if (leadData.userId) {
          const userDoc = await db.collection(COLLECTIONS.USERS).doc(leadData.userId).get()
          if (userDoc.exists) {
            const userData = userDoc.data()
            leadData.user = {
              id: userDoc.id,
              name: userData?.name,
              email: userData?.email,
            }
          }
        }

        return leadData
      })
    )

    return NextResponse.json(leadsWithDetails)
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, name, email, phone, message, userId } = body

    const leadRef = db.collection(COLLECTIONS.LEADS).doc()
    const leadData = {
      productId: productId || null,
      userId: userId || null,
      name,
      email,
      phone,
      message: message || null,
      status: 'NEW',
      notes: null,
      convertedToOrderId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await leadRef.set(leadData)

    const lead = convertFirestoreDoc({ id: leadRef.id, ...leadData })

    // Fetch product if exists
    let productName: string | undefined
    if (productId) {
      const productDoc = await db.collection(COLLECTIONS.PRODUCTS).doc(productId).get()
      if (productDoc.exists) {
        const productData = convertFirestoreDoc({ id: productDoc.id, ...productDoc.data() })
        lead.product = productData
        productName = productData.name
      }
    }

    // Send emails asynchronously (don't block the response)
    Promise.all([
      // Send notification to all admins
      (async () => {
        try {
          // Fetch all admin emails
          const adminsSnapshot = await db
            .collection(COLLECTIONS.USERS)
            .where('role', '==', 'ADMIN')
            .get()
          
          const adminEmails = adminsSnapshot.docs
            .map((doc: any) => doc.data()?.email)
            .filter((email: string) => email) // Filter out any null/undefined emails
          
          if (adminEmails.length > 0) {
            await sendLeadNotificationToAdmins(adminEmails, {
              customerName: name,
              customerEmail: email,
              customerPhone: phone,
              productName: productName,
              productId: productId || undefined,
              message: message || undefined,
              leadId: leadRef.id,
            })
          }
        } catch (emailError) {
          console.error('Error sending lead notification to admins:', emailError)
          // Don't fail lead creation if email fails
        }
      })(),
      // Send thank you email to customer
      (async () => {
        try {
          await sendLeadThankYouEmail(email, name, productName)
        } catch (emailError) {
          console.error('Error sending thank you email to customer:', emailError)
          // Don't fail lead creation if email fails
        }
      })(),
    ]).catch((error) => {
      console.error('Error sending emails:', error)
      // Continue even if emails fail
    })

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
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
    const { id, status, notes, convertedToOrderId } = body

    const updateData: any = {
      updatedAt: new Date(),
    }
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (convertedToOrderId !== undefined) updateData.convertedToOrderId = convertedToOrderId

    await db.collection(COLLECTIONS.LEADS).doc(id).update(updateData)

    const leadDoc = await db.collection(COLLECTIONS.LEADS).doc(id).get()
    const lead = convertFirestoreDoc({ id: leadDoc.id, ...leadDoc.data() })

    // Fetch product and user
    if (lead.productId) {
      const productDoc = await db.collection(COLLECTIONS.PRODUCTS).doc(lead.productId).get()
      if (productDoc.exists) {
        lead.product = convertFirestoreDoc({ id: productDoc.id, ...productDoc.data() })
      }
    }

    if (lead.userId) {
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(lead.userId).get()
      if (userDoc.exists) {
        lead.user = convertFirestoreDoc({ id: userDoc.id, ...userDoc.data() })
      }
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    )
  }
}
