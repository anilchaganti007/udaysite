import { NextRequest, NextResponse } from 'next/server'
import { db, COLLECTIONS } from '@/lib/firebase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { convertFirestoreDoc, queryCollection } from '@/lib/firebase-helpers'
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    let whereClause: Array<[string, any, any]> | undefined = undefined
    if (role) {
      whereClause = [['role', '==', role]]
    }

    const users = await queryCollection(
      COLLECTIONS.USERS,
      whereClause,
      ['createdAt', 'desc']
    )

    // Remove password from response
    const usersWithoutPassword = users.map((user) => {
      const userData = convertFirestoreDoc(user)
      const { password, ...userWithoutPassword } = userData
      return userWithoutPassword
    })

    return NextResponse.json(usersWithoutPassword)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    // Allow public registration for customers
    const body = await request.json()
    const { email, password, name, phone, address, role } = body

    // Check if user already exists
    const existingUserSnapshot = await db
      .collection(COLLECTIONS.USERS)
      .where('email', '==', email)
      .limit(1)
      .get()

    if (!existingUserSnapshot.empty) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Only admins can create admin users
    const userRole = role === 'ADMIN' && (!session || session.user.role !== 'ADMIN')
      ? 'CUSTOMER'
      : (role || 'CUSTOMER')

    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationTokenExpiry = new Date()
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24) // 24 hours expiry

    const userRef = db.collection(COLLECTIONS.USERS).doc()
    const userData = {
      email,
      password: hashedPassword,
      name,
      phone: phone || null,
      address: address || null,
      role: userRole,
      isVerified: false, // All users start unverified
      verificationToken,
      verificationTokenExpiry,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await userRef.set(userData)

    const user = convertFirestoreDoc({ id: userRef.id, ...userData })
    const { password: _, verificationToken: __, ...userWithoutPassword } = user

    // Send welcome email with verification link (for both customers and admins)
    // If admin creates user, send welcome email. If public registration, send verification email only
    try {
      if (session && session.user.role === 'ADMIN') {
        // Admin created user - send welcome email with verification link
        await sendWelcomeEmail(email, name, verificationToken)
      } else {
        // Public registration - send verification email
        await sendVerificationEmail(email, name, verificationToken)
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      // Don't fail registration if email fails, but log it
    }

    return NextResponse.json(
      { 
        ...userWithoutPassword,
        message: 'Registration successful! Please check your email to verify your account.'
      }, 
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
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
    const { id, email, name, phone, address, role, password } = body

    const updateData: any = {
      updatedAt: new Date(),
    }
    if (email) updateData.email = email
    if (name) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (address !== undefined) updateData.address = address
    if (role) updateData.role = role
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    await db.collection(COLLECTIONS.USERS).doc(id).update(updateData)

    const userDoc = await db.collection(COLLECTIONS.USERS).doc(id).get()
    const user = convertFirestoreDoc({ id: userDoc.id, ...userDoc.data() })
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
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
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Prevent admin from deleting themselves
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      )
    }

    // Check if user exists
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get()
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete the user
    await db.collection(COLLECTIONS.USERS).doc(userId).delete()

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
