// @ts-ignore - Firebase Admin types are included in the package
import { initializeApp, cert } from 'firebase-admin/app'
// @ts-ignore - Firebase Admin types are included in the package
import { getFirestore } from 'firebase-admin/firestore'
import bcrypt from 'bcryptjs'
import { config } from 'dotenv'
import * as path from 'path'

// Load .env file
const envPath = path.join(process.cwd(), '.env')
config({ path: envPath })

// Initialize Firebase Admin
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

if (!serviceAccountKey) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required')
  console.error('   Please add it to your .env file. See SETUP_ENV.md for instructions.')
  process.exit(1)
}

let serviceAccount: any
try {
  serviceAccount = JSON.parse(serviceAccountKey)
  
  // Validate required fields
  if (!serviceAccount.project_id) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY is missing required field: project_id')
    process.exit(1)
  }
  
  if (!serviceAccount.private_key) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY is missing required field: private_key')
    process.exit(1)
  }
  
  if (!serviceAccount.client_email) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY is missing required field: client_email')
    process.exit(1)
  }
  
  // Fix private_key: Convert escaped \n to actual newlines
  if (typeof serviceAccount.private_key === 'string') {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
  }
} catch (parseError: any) {
  console.error('❌ Invalid JSON in FIREBASE_SERVICE_ACCOUNT_KEY:', parseError.message)
  console.error('   Make sure the JSON is properly escaped in your .env file.')
  process.exit(1)
}

try {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id,
  })
  console.log(`✅ Firebase Admin initialized for project: ${serviceAccount.project_id}`)
} catch (initError: any) {
  console.error('❌ Firebase Admin initialization failed:', initError.message)
  console.error('   Check your FIREBASE_SERVICE_ACCOUNT_KEY in .env file.')
  process.exit(1)
}

const db = getFirestore()

async function createAdmin() {
  const email = process.argv[2] || 'admin@example.com'
  const password = process.argv[3] || 'admin123'
  const name = process.argv[4] || 'Admin User'

  try {
    // Check if user already exists
    const existingUserSnapshot = await db
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get()

    if (!existingUserSnapshot.empty) {
      console.error('User with this email already exists')
      process.exit(1)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const userRef = db.collection('users').doc()
    await userRef.set({
      email,
      password: hashedPassword,
      name,
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log('Admin user created successfully!')
    console.log('ID:', userRef.id)
    console.log('Email:', email)
    console.log('Name:', name)
    console.log('Role: ADMIN')
  } catch (error: any) {
    console.error('Error creating admin user:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

createAdmin()
