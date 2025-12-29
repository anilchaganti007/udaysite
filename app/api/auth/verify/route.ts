import { NextRequest, NextResponse } from 'next/server'
import { db, COLLECTIONS } from '@/lib/firebase'
import { convertFirestoreDoc } from '@/lib/firebase-helpers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find user with this verification token
    const usersRef = db.collection(COLLECTIONS.USERS)
    const snapshot = await usersRef
      .where('verificationToken', '==', token)
      .limit(1)
      .get()

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    const userDoc = snapshot.docs[0]
    const user = convertFirestoreDoc({ id: userDoc.id, ...userDoc.data() })

    // Check if token is expired
    if (user.verificationTokenExpiry) {
      const expiryDate = user.verificationTokenExpiry.toDate
        ? user.verificationTokenExpiry.toDate()
        : new Date(user.verificationTokenExpiry)
      
      if (expiryDate < new Date()) {
        return NextResponse.json(
          { error: 'Verification token has expired. Please request a new one.' },
          { status: 400 }
        )
      }
    }

    // Check if already verified
    if (user.isVerified) {
      return NextResponse.json(
        { message: 'Email already verified. You can now log in.' },
        { status: 200 }
      )
    }

    // Verify the user
    await db.collection(COLLECTIONS.USERS).doc(user.id).update({
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
      updatedAt: new Date(),
    })

    return NextResponse.json(
      { 
        message: 'Email verified successfully! You can now log in.',
        verified: true 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error verifying email:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}

