import { db, COLLECTIONS } from './firebase'
// @ts-ignore - Firebase Admin types are included in the package
import { 
  Timestamp, 
  FieldValue,
  Query,
  WhereFilterOp,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore'

// Helper to convert Firestore Timestamp to Date
export function timestampToDate(timestamp: any): Date {
  if (timestamp?.toDate) {
    return timestamp.toDate()
  }
  if (timestamp instanceof Date) {
    return timestamp
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp)
  }
  return new Date()
}

// Helper to convert Date to Firestore Timestamp
export function dateToTimestamp(date: Date | string): Timestamp {
  if (typeof date === 'string') {
    return Timestamp.fromDate(new Date(date))
  }
  return Timestamp.fromDate(date)
}

// Helper to add createdAt and updatedAt fields
export function addTimestamps(data: any) {
  return {
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }
}

// Helper to update updatedAt field
export function updateTimestamp(data: any) {
  return {
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  }
}

// Generic CRUD helpers
export async function createDocument(
  collection: string,
  data: any
): Promise<string> {
  const docRef = await db.collection(collection).add(addTimestamps(data))
  return docRef.id
}

export async function getDocument(collection: string, id: string): Promise<any> {
  const doc = await db.collection(collection).doc(id).get()
  if (!doc.exists) {
    return null
  }
  return { id: doc.id, ...doc.data() }
}

export async function updateDocument(
  collection: string,
  id: string,
  data: any
): Promise<void> {
  await db
    .collection(collection)
    .doc(id)
    .update(updateTimestamp(data))
}

export async function deleteDocument(collection: string, id: string): Promise<void> {
  await db.collection(collection).doc(id).delete()
}

export async function queryCollection(
  collection: string,
  where?: Array<[string, WhereFilterOp, any]>,
  orderBy?: [string, 'asc' | 'desc'],
  limit?: number
): Promise<any[]> {
  let query: Query<DocumentData> = db.collection(collection)

  if (where) {
    where.forEach(([field, op, value]) => {
      query = query.where(field, op, value)
    })
  }

  if (orderBy) {
    query = query.orderBy(orderBy[0], orderBy[1])
  }

  if (limit) {
    query = query.limit(limit)
  }

  const snapshot = await query.get()
  return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() }))
}

// Convert Firestore document to plain object with proper date handling
export function convertFirestoreDoc(doc: any): any {
  if (!doc) return null
  
  const data = { ...doc }
  
  // Convert Timestamps to Dates
  Object.keys(data).forEach((key) => {
    if (data[key]?.toDate) {
      data[key] = data[key].toDate()
    }
  })
  
  return data
}

