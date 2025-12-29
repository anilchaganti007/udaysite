import { NextRequest, NextResponse } from 'next/server'
import { db, COLLECTIONS } from '@/lib/firebase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { convertFirestoreDoc, queryCollection } from '@/lib/firebase-helpers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const includeVariants = searchParams.get('includeVariants') === 'true'

    let productsQuery: any[] = []
    
    // Firestore requires composite indexes for multiple where clauses + orderBy
    // To avoid index requirements, we'll filter by isActive and orderBy createdAt first,
    // then filter by type in memory if needed
    if (type) {
      // Query with isActive and orderBy, then filter by type in memory
      const allActiveProducts = await queryCollection(
        COLLECTIONS.PRODUCTS,
        [['isActive', '==', true]],
        ['createdAt', 'desc']
      )
      // Filter by type in memory
      productsQuery = allActiveProducts.filter((p: any) => p.type === type)
    } else {
      productsQuery = await queryCollection(
        COLLECTIONS.PRODUCTS,
        [['isActive', '==', true]],
        ['createdAt', 'desc']
      )
    }

    const products = await Promise.all(
      productsQuery.map(async (product) => {
        const productData = convertFirestoreDoc(product)
        
        if (includeVariants) {
          // Filter by productId first, then filter isActive in memory to avoid index requirement
          const variantsSnapshot = await db
            .collection(COLLECTIONS.PRODUCT_VARIANTS)
            .where('productId', '==', product.id)
            .get()
          
          productData.variants = variantsSnapshot.docs
            .filter((doc: any) => doc.data()?.isActive === true)
            .map((doc: any) =>
              convertFirestoreDoc({ id: doc.id, ...doc.data() })
            )
        }

        // Get inventory summary
        const inventorySnapshot = await db
          .collection(COLLECTIONS.INVENTORY)
          .where('productId', '==', product.id)
          .get()
        
        productData.inventory = inventorySnapshot.docs.map((doc: any) =>
          convertFirestoreDoc({ id: doc.id, ...doc.data() })
        )

        return productData
      })
    )

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
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
    const { name, description, type, basePrice, imageUrl, variants } = body

    // Create product
    const productRef = db.collection(COLLECTIONS.PRODUCTS).doc()
    const productData = {
      name,
      description: description || null,
      type,
      basePrice: basePrice || null,
      imageUrl: imageUrl || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await productRef.set(productData)

    // Create variants if provided
    if (variants && variants.length > 0) {
      const variantsBatch = db.batch()
      variants.forEach((variant: any) => {
        const variantRef = db.collection(COLLECTIONS.PRODUCT_VARIANTS).doc()
        variantsBatch.set(variantRef, {
          productId: productRef.id,
          name: variant.name,
          capacity: variant.capacity || null,
          price: variant.price,
          sku: variant.sku || null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      })
      await variantsBatch.commit()
    }

    // Fetch created product with variants
    const productDoc = await productRef.get()
    const product = convertFirestoreDoc({ id: productDoc.id, ...productDoc.data() })

    if (variants && variants.length > 0) {
      const variantsSnapshot = await db
        .collection(COLLECTIONS.PRODUCT_VARIANTS)
        .where('productId', '==', productRef.id)
        .get()
      
      product.variants = variantsSnapshot.docs.map((doc: any) =>
        convertFirestoreDoc({ id: doc.id, ...doc.data() })
      )
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
