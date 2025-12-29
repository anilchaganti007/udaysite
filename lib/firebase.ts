// @ts-ignore - Firebase Admin types are included in the package
import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
// @ts-ignore - Firebase Admin types are included in the package
import { getFirestore, Firestore } from 'firebase-admin/firestore'

let app: App | undefined
let _db: Firestore | undefined
let _initializationError: Error | null = null

function initializeFirebase(): Firestore {
  if (_db) return _db
  
  // If we've already tried and failed, throw the cached error
  if (_initializationError) {
    throw _initializationError
  }
  
  if (!getApps().length) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    
    if (!serviceAccountKey) {
      const error = new Error(
        'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. ' +
        'Please add it to your .env file. See SETUP_ENV.md for instructions.'
      )
      _initializationError = error
      
      // Only throw in production or during build
      if (process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
        throw error
      }
      
      // In development, log a warning but don't throw yet
      console.warn('⚠️  Firebase Admin not initialized: FIREBASE_SERVICE_ACCOUNT_KEY not found')
      console.warn('   This is OK during development, but Firebase features will not work until configured.')
      throw error
    }
    
    try {
      // Parse the JSON
      let serviceAccount: any
      try {
        serviceAccount = JSON.parse(serviceAccountKey)
      } catch (parseError: any) {
        const error = new Error(
          `Invalid JSON in FIREBASE_SERVICE_ACCOUNT_KEY: ${parseError.message}. ` +
          'Make sure the JSON is properly escaped in your .env file.'
        )
        _initializationError = error
        console.error('❌ Firebase Admin initialization failed:', error.message)
        throw error
      }
      
      // Validate required fields
      if (!serviceAccount.project_id) {
        const error = new Error('FIREBASE_SERVICE_ACCOUNT_KEY is missing required field: project_id')
        _initializationError = error
        console.error('❌ Firebase Admin initialization failed:', error.message)
        throw error
      }
      
      if (!serviceAccount.private_key) {
        const error = new Error('FIREBASE_SERVICE_ACCOUNT_KEY is missing required field: private_key')
        _initializationError = error
        console.error('❌ Firebase Admin initialization failed:', error.message)
        throw error
      }
      
      if (!serviceAccount.client_email) {
        const error = new Error('FIREBASE_SERVICE_ACCOUNT_KEY is missing required field: client_email')
        _initializationError = error
        console.error('❌ Firebase Admin initialization failed:', error.message)
        throw error
      }
      
      // Fix private_key: Convert escaped \n to actual newlines
      // The private key in .env might have \\n (escaped) which needs to become \n (actual newline)
      if (typeof serviceAccount.private_key === 'string') {
        // Replace escaped newlines with actual newlines
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
      }
      
      // Initialize Firebase
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      })
      _db = getFirestore(app)
      
      console.log(`✅ Firebase Admin initialized successfully for project: ${serviceAccount.project_id}`)
    } catch (error: any) {
      _initializationError = error
      
      if (error.message.includes('FIREBASE_SERVICE_ACCOUNT_KEY')) {
        // Already formatted error, just throw it
        throw error
      }
      
      // Format Firebase-specific errors
      const formattedError = new Error(
        `Firebase Admin initialization failed: ${error.message}. ` +
        'Check your FIREBASE_SERVICE_ACCOUNT_KEY in .env file.'
      )
      _initializationError = formattedError
      console.error('❌ Firebase Admin initialization failed:', formattedError.message)
      throw formattedError
    }
  } else {
    // Reuse existing app
    app = getApps()[0]
    _db = getFirestore(app)
  }

  if (!_db) {
    const error = new Error(
      'Firebase Admin not initialized. Check your FIREBASE_SERVICE_ACCOUNT_KEY environment variable.'
    )
    _initializationError = error
    throw error
  }

  return _db
}

// Lazy initialization - only initialize when accessed
const db = new Proxy({} as Firestore, {
  get(_target, prop) {
    const firestore = initializeFirebase()
    return (firestore as any)[prop]
  },
})

export { db }

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  PRODUCT_VARIANTS: 'productVariants',
  INVENTORY: 'inventory',
  LEADS: 'leads',
  ORDERS: 'orders',
  ORDER_ITEMS: 'orderItems',
  COMPLAINTS: 'complaints',
} as const

