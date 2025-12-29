# Eggbator - Professional Egg Incubator Solutions

A comprehensive egg incubator inventory management and order system built with Next.js 16, TypeScript, Firebase Firestore, and NextAuth.js.

## 📚 Documentation

**👉 [Complete Documentation](DOCUMENTATION.md) - Start here for full setup and usage guide**

This README provides a quick overview. For detailed instructions, troubleshooting, and complete documentation, see **[DOCUMENTATION.md](DOCUMENTATION.md)**.

## Features

### Public (Customer) Site
- ✅ User registration and login
- ✅ Product browsing (main products with variants)
- ✅ Spare parts catalog
- ✅ Product enquiry form (with product pre-population)
- ✅ FAQ page
- ✅ Complaint/Support page (requires order number)
- ✅ Order history viewing

### Admin Panel
- ✅ Admin authentication
- ✅ User management (add, edit users)
- ✅ Product management (add products, manage variants)
- ✅ Inventory management
  - Manual inventory addition/removal
  - QR code scanning for inventory updates
- ✅ Lead management (view, update status, convert to orders)
- ✅ Order management
  - Create orders manually
  - Generate payment links
  - Verify payments
  - Automatic inventory deduction on payment verification
  - Email notifications with PDF attachments
- ✅ Complaint management

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: NextAuth.js
- **Email**: Nodemailer
- **PDF Generation**: jsPDF
- **QR Code**: qrcode

## Quick Start

1. **Install dependencies**: `npm install`
2. **Set up Firebase**: See [DOCUMENTATION.md](DOCUMENTATION.md#firebase-setup)
3. **Create `.env` file**: See [DOCUMENTATION.md](DOCUMENTATION.md#setup-instructions)
4. **Start dev server**: `npm run dev`
5. **Create admin user**: `npm run create-admin admin@example.com password123 "Admin Name"`

For detailed setup instructions, see **[DOCUMENTATION.md](DOCUMENTATION.md#quick-start-guide)**.

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth routes
│   │   ├── products/     # Product CRUD
│   │   ├── inventory/    # Inventory management
│   │   ├── leads/        # Lead management
│   │   ├── orders/       # Order management
│   │   ├── complaints/   # Complaint management
│   │   └── users/        # User management
│   ├── admin/            # Admin panel pages
│   ├── auth/             # Authentication pages
│   ├── products/         # Public product pages
│   ├── spare-parts/      # Spare parts page
│   ├── enquiry/          # Enquiry form
│   ├── faq/              # FAQ page
│   ├── support/          # Complaint page
│   └── orders/           # Order history
├── components/           # React components
├── lib/                 # Utility functions
│   ├── auth.ts          # NextAuth configuration
│   ├── prisma.ts        # Prisma client
│   ├── email.ts         # Email service
│   └── pdf.ts           # PDF generation
├── prisma/
│   └── schema.prisma    # Database schema
└── types/               # TypeScript type definitions
```

## Database Schema (Firestore Collections)

The system uses the following Firestore collections:

- **users**: Customers and admins
- **products**: Main products and spare parts
- **productVariants**: Product capacity/variant options
- **inventory**: Stock tracking with QR codes
- **leads**: Customer enquiries
- **orders**: Customer orders
- **orderItems**: Order line items
- **complaints**: Customer complaints

Collections are created automatically when you add the first document. See [DOCUMENTATION.md](DOCUMENTATION.md#firebase-setup) for security rules setup.

## Key Workflows

### Lead to Order Conversion

1. Customer submits enquiry via product page
2. Lead appears in admin panel
3. Admin contacts customer and updates lead status
4. Admin creates order manually
5. Admin generates payment link
6. Customer pays
7. Admin verifies payment
8. System automatically:
   - Deducts inventory
   - Sends confirmation email with PDF
   - Updates order status

### Inventory Management

1. Admin adds inventory manually or via QR scan
2. System generates QR codes for tracking
3. QR codes can be scanned to add/remove inventory
4. Real-time inventory updates

## API Endpoints

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product (Admin)
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product (Admin)
- `DELETE /api/products/[id]` - Delete product (Admin)

### Inventory
- `GET /api/inventory` - List inventory (Admin)
- `POST /api/inventory` - Add inventory (Admin)
- `PUT /api/inventory` - Update inventory (Admin)
- `DELETE /api/inventory` - Delete inventory (Admin)
- `POST /api/inventory/qr-scan` - Scan QR code (Admin)

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order (Admin)
- `GET /api/orders/[id]` - Get order details
- `PUT /api/orders/[id]` - Update order (Admin)

### Leads
- `GET /api/leads` - List leads
- `POST /api/leads` - Create lead (Public)
- `PUT /api/leads` - Update lead (Admin)

### Complaints
- `GET /api/complaints` - List complaints
- `POST /api/complaints` - Create complaint
- `PUT /api/complaints` - Update complaint (Admin)

## Production Deployment

See **[DOCUMENTATION.md](DOCUMENTATION.md#production-deployment)** for complete production deployment guide.

Key steps:
1. Set up production Firebase project
2. Configure environment variables
3. Build and deploy: `npm run build && npm start`
4. Follow security checklist

## Documentation

- **[Complete Documentation](DOCUMENTATION.md)** - Full setup, API reference, troubleshooting
- **[Quick Start Guide](DOCUMENTATION.md#quick-start-guide)** - Get started in 5 minutes
- **[Email Setup](DOCUMENTATION.md#email-configuration)** - Configure SMTP for emails
- **[Firebase Setup](DOCUMENTATION.md#firebase-setup)** - Firebase configuration guide
- **[Troubleshooting](DOCUMENTATION.md#troubleshooting)** - Common issues and solutions

## Future Enhancements

- [ ] Product image upload
- [ ] Advanced search and filtering
- [ ] Order tracking with shipping integration
- [ ] Payment gateway integration
- [ ] Email templates customization
- [ ] Analytics dashboard
- [ ] Bulk operations
- [ ] Export functionality (CSV, Excel)
- [ ] Mobile app support

## License

Private project for internal use.

## Support

For issues or questions, please contact the development team.
