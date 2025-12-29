# Eggbator - Complete Documentation

A comprehensive egg incubator inventory management and order system built with Next.js 16, TypeScript, Firebase Firestore, and NextAuth.js.

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start Guide](#quick-start-guide)
3. [Setup Instructions](#setup-instructions)
4. [Architecture](#architecture)
5. [Features](#features)
6. [Email Configuration](#email-configuration)
7. [Firebase Setup](#firebase-setup)
8. [API Documentation](#api-documentation)
9. [Troubleshooting](#troubleshooting)
10. [Production Deployment](#production-deployment)

---

## Overview

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: NextAuth.js
- **Email**: Nodemailer
- **PDF Generation**: jsPDF
- **QR Code**: qrcode

### System Capabilities

This system provides:
- **Public customer-facing site** for browsing products, submitting enquiries, and tracking orders
- **Admin panel** for managing products, inventory, leads, orders, and users
- **Automated email notifications** for registrations, leads, and order confirmations
- **QR code-based inventory tracking**
- **Lead-to-order conversion workflow**

---

## Quick Start Guide

### Prerequisites

- Node.js 18.17+ (recommended: 20.x LTS)
- npm or yarn
- Firebase account
- Email account (Gmail recommended for testing)

### Step-by-Step Setup

#### Step 1: Install Dependencies

```bash
npm install
```

#### Step 2: Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Generate Service Account Key (Project Settings → Service Accounts → Generate new private key)

#### Step 3: Create Environment File

Create a `.env` file in the project root:

```env
# Firebase Service Account Key (paste entire JSON as escaped string)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project-id",...}'

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-32-character-secret-here"

# Email Configuration (for order confirmations, welcome emails, lead notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-gmail-app-password"
SMTP_FROM="noreply@uday-in.com"

# Application
APP_NAME="Eggbator"
APP_URL="http://localhost:3000"
```

**Generate NEXTAUTH_SECRET:**
```bash
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Mac/Linux
openssl rand -base64 32
```

#### Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

#### Step 5: Create Admin User

In a new terminal (keep dev server running):

```bash
npm run create-admin admin@example.com password123 "Admin Name"
```

#### Step 6: Access the Application

- **Public Site**: http://localhost:3000
- **Login**: http://localhost:3000/auth/login
- **Admin Panel**: http://localhost:3000/admin (after login)

---

## Setup Instructions

### Environment Variables

#### Firebase Service Account Key

The `FIREBASE_SERVICE_ACCOUNT_KEY` must be a single-line escaped JSON string.

**Converting JSON to Environment Variable:**

**Option 1: PowerShell (Windows)**
```powershell
$json = Get-Content "path\to\service-account-key.json" -Raw
$escaped = $json.Replace('"', '\"').Replace("`n", "").Replace("`r", "")
Write-Host "FIREBASE_SERVICE_ACCOUNT_KEY='$escaped'"
```

**Option 2: Online Tool**
- Use https://www.freeformatter.com/json-escape.html
- Paste your JSON
- Copy the escaped output
- Wrap in single quotes: `FIREBASE_SERVICE_ACCOUNT_KEY='...'`

**Option 3: Manual**
- Copy entire JSON content
- Replace all `"` with `\"`
- Remove all line breaks
- Wrap in single quotes

#### Email Configuration

See [Email Configuration](#email-configuration) section for detailed SMTP setup.

---

## Architecture

### System Design

#### Frontend
- **Next.js 16 App Router**: Modern React framework with server components and API routes
- **TypeScript**: Type safety throughout the application
- **Client Components**: Used for interactive features (forms, state management)
- **Server Components**: Used for data fetching where possible

#### Backend
- **Next.js API Routes**: RESTful API endpoints
- **Firebase Firestore**: NoSQL document database
- **NextAuth.js**: Authentication and session management

#### Authentication
- **NextAuth.js**: Handles authentication with JWT strategy
- **Role-based Access Control**: Customer and Admin roles
- **Session Management**: Server-side session handling

### Database Schema (Firestore Collections)

- **users**: Customers and admins
- **products**: Main products and spare parts
- **productVariants**: Product capacity/variant options
- **inventory**: Stock tracking with QR codes
- **leads**: Customer enquiries
- **orders**: Customer orders
- **orderItems**: Order line items
- **complaints**: Customer support tickets

### Data Flow

#### Lead to Order Conversion Flow

```
1. Customer browses product
   ↓
2. Clicks "Enquire Now"
   ↓
3. Enquiry form pre-filled with product
   ↓
4. Lead created in database (status: NEW)
   ↓
5. Admin views lead in admin panel
   ↓
6. Admin contacts customer, updates status
   ↓
7. Admin creates order manually
   ↓
8. Admin generates payment link
   ↓
9. Customer pays
   ↓
10. Admin verifies payment
    ↓
11. System automatically:
    - Deducts inventory
    - Sends confirmation email with PDF
    - Updates order status
```

#### Inventory Management Flow

```
1. Admin adds inventory (manual or QR scan)
   ↓
2. System generates QR code
   ↓
3. QR code stored in database
   ↓
4. QR code can be scanned to:
   - Add inventory
   - Remove inventory
   ↓
5. Real-time inventory updates
```

### Security Considerations

1. **Authentication**: All admin routes protected by middleware
2. **Authorization**: Role-based access control
3. **Password Hashing**: bcrypt with salt rounds
4. **XSS Protection**: React's built-in escaping
5. **CSRF Protection**: NextAuth handles CSRF tokens

---

## Features

### Public (Customer) Site

- ✅ User registration and login
- ✅ Product browsing (main products with variants)
- ✅ Spare parts catalog
- ✅ Product enquiry form (with product pre-population)
- ✅ FAQ page
- ✅ Complaint/Support page (requires order number)
- ✅ Order history viewing
- ✅ Welcome email on registration
- ✅ Thank you email on enquiry submission

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
- ✅ Lead notification emails to all admins

---

## Email Configuration

### Quick Setup: Gmail (Recommended for Testing)

#### Step 1: Enable 2-Step Verification

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click **"2-Step Verification"**
3. Follow the prompts to enable 2-Step Verification

#### Step 2: Generate App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click **"App passwords"**
   - If you don't see this option, make sure 2-Step Verification is enabled first
3. Select **"Mail"** as the app
4. Select **"Other (Custom name)"** as the device
5. Enter a name like "Eggbator"
6. Click **"Generate"**
7. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

#### Step 3: Update .env File

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="abcdefghijklmnop"  # The 16-character app password (remove spaces)
SMTP_FROM="noreply@uday-in.com"
```

**Important**: 
- Use your Gmail address for `SMTP_USER`
- Use the **App Password** (not your regular Gmail password) for `SMTP_PASSWORD`
- Remove spaces from the app password if it has any

### Other Email Providers

#### Outlook/Hotmail

```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT=587
SMTP_USER="your-email@outlook.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@uday-in.com"
```

#### SendGrid

```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
SMTP_FROM="noreply@uday-in.com"
```

#### Mailgun

```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT=587
SMTP_USER="postmaster@your-domain.mailgun.org"
SMTP_PASSWORD="your-mailgun-password"
SMTP_FROM="noreply@uday-in.com"
```

#### AWS SES

```env
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"  # Change region as needed
SMTP_PORT=587
SMTP_USER="your-aws-access-key-id"
SMTP_PASSWORD="your-aws-secret-access-key"
SMTP_FROM="noreply@your-domain.com"
```

### Testing Email Configuration

Run the test script:

```bash
npm run test-email your-email@example.com
```

This will:
- Verify your SMTP connection
- Send a test email to confirm everything works

### Email Features

The system automatically sends:
1. **Welcome Email**: When customers register
2. **Thank You Email**: When customers submit enquiries
3. **Lead Notification**: To all admins when enquiries are submitted
4. **Order Confirmation**: When payment is verified (with PDF attachment)

---

## Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard
4. Enable **Firestore Database**:
   - Go to Firestore Database in the left sidebar
   - Click "Create database"
   - Choose "Start in production mode" (we'll set up security rules later)
   - Select a location for your database

### Step 2: Generate Service Account Key

1. Go to Firebase Console → Project Settings (gear icon)
2. Click on "Service accounts" tab
3. Click "Generate new private key"
4. Save the JSON file securely (this is your service account key)
5. **DO NOT commit this file to git!**

### Step 3: Set Up Firestore Security Rules

Go to Firestore Database → Rules and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false; // All access is server-side only
    }
  }
}
```

**Note**: Since we're using Firebase Admin SDK server-side, all access is controlled server-side. The rules above deny all client-side access for security.

### Step 4: Create Collections

Firestore will create collections automatically when you add documents. However, you can create them manually:

1. Go to Firestore Database
2. Click "Start collection"
3. Create these collections:
   - `users`
   - `products`
   - `productVariants`
   - `inventory`
   - `leads`
   - `orders`
   - `orderItems`
   - `complaints`

### Step 5: Create Indexes (Optional)

Firestore will prompt you to create indexes when you run queries that require them. Click the link in the error message to create them automatically.

**Note**: The code has been optimized to filter in memory where possible, avoiding the need for most indexes. However, creating indexes improves performance for large datasets.

Common indexes you might need:
- `leads` collection: `userId` (ascending), `status` (ascending)
- `orders` collection: `userId` (ascending), `status` (ascending)
- `inventory` collection: `productId` (ascending), `variantId` (ascending)

### Step 6: Test Connection

After setting up, test the connection:

```bash
npm run test-firebase
```

Or start the dev server:

```bash
npm run dev
```

You should see: `✅ Firebase Admin initialized successfully for project: your-project-id`

---

## API Documentation

### Products

- `GET /api/products` - List products
  - Query params: `?type=MAIN_PRODUCT|SPARE_PART`, `?includeVariants=true`
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

### Users

- `GET /api/users` - List users (Admin)
- `POST /api/users` - Create user (Public for customers, Admin for admins)
- `PUT /api/users` - Update user (Admin)

---

## Troubleshooting

### Firebase Errors

#### "Firebase Admin not initialized"
- Check that `FIREBASE_SERVICE_ACCOUNT_KEY` is set in `.env`
- Verify the JSON is valid and properly escaped
- Make sure there are no extra spaces or line breaks
- Run `npm run test-firebase` to diagnose

#### "Permission denied"
- Check Firestore security rules
- Verify service account has proper permissions
- Make sure you're using the correct project ID

#### "Collection not found"
- Collections are created automatically when you add the first document
- Make sure you're using the correct collection names (see `lib/firebase.ts`)

#### "Query requires an index"
- Click the link in the error message to create the index automatically
- Or restart the dev server (the code filters in memory to avoid index requirements)
- See `FIREBASE_INDEXES.md` for more details

### Authentication Errors

#### "Invalid email or password"
- Verify user exists in Firestore
- Check password is correct
- Make sure user role is set correctly

#### "Unauthorized"
- Check `NEXTAUTH_SECRET` is set
- Make sure `NEXTAUTH_URL` matches your dev URL
- Verify session is valid

### Email Errors

#### "Invalid login"
- Make sure you're using an **App Password** (not your regular password)
- For Gmail, ensure 2-Step Verification is enabled
- Double-check `SMTP_USER` matches your email address exactly

#### "Connection timeout"
- Check your firewall/antivirus isn't blocking port 587
- Verify `SMTP_HOST` is correct
- Try port 465 with `secure: true` (for SSL)

#### "Authentication failed"
- Verify your App Password is correct (no extra spaces)
- Make sure `SMTP_USER` is your full email address
- For Gmail, ensure "Less secure app access" is NOT needed (use App Password instead)

#### Emails not sending
- Check server console logs for email errors
- Verify all SMTP variables are set in `.env`
- Test SMTP connection using: `npm run test-email your-email@example.com`
- Check spam/junk folder

### Development Server Issues

#### "Port 3000 already in use"
```bash
npm run dev -- -p 3001
```

#### "Module not found" errors
```bash
# Delete and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

#### "Failed to compile"
- Check Node.js version: `node --version` (should be 18.17+)
- Clear Next.js cache: Delete `.next` folder
- Restart dev server

### Node.js Version Issues

**Required**: Node.js 18.17+ (recommended: 20.x LTS)

**Check version:**
```bash
node --version
```

**Upgrade Node.js:**
1. Download from [nodejs.org](https://nodejs.org/)
2. Or use nvm: `nvm install 20 && nvm use 20`

---

## Production Deployment

### 1. Firebase Setup

- Use a production Firebase project
- Set up proper Firestore security rules
- Enable Firebase App Check for additional security

### 2. Environment Variables

Set all required env vars in your hosting platform:

- `FIREBASE_SERVICE_ACCOUNT_KEY`
- `NEXTAUTH_SECRET` (change to a strong random string!)
- `NEXTAUTH_URL` (your production URL)
- SMTP credentials
- `APP_NAME` and `APP_URL`

### 3. Build

```bash
npm run build
npm start
```

### 4. Security Checklist

- ✅ Change `NEXTAUTH_SECRET` to a strong random string
- ✅ Use environment variables for all sensitive data
- ✅ Enable HTTPS
- ✅ Set up Firestore security rules properly
- ✅ Never commit service account keys to git
- ✅ Use App Passwords for email (not regular passwords)
- ✅ Rotate passwords periodically
- ✅ Monitor email sending logs

### 5. Email Service Recommendations

For production, consider:

1. **Dedicated Email Service**: Use SendGrid, Mailgun, or AWS SES
2. **Domain Email**: Use `noreply@yourdomain.com` instead of Gmail
3. **Email Templates**: Professional HTML templates
4. **Rate Limiting**: Prevent email spam
5. **Email Queue**: Use a queue system for reliable delivery

---

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
│   ├── firebase.ts      # Firebase Admin SDK
│   ├── firebase-helpers.ts  # Firestore helpers
│   ├── email.ts         # Email service
│   └── pdf.ts           # PDF generation
├── scripts/             # Utility scripts
│   ├── create-admin.ts  # Create admin user
│   └── test-email.js    # Test email config
└── types/               # TypeScript type definitions
```

---

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

---

## Additional Resources

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run create-admin` - Create admin user
- `npm run test-firebase` - Test Firebase connection
- `npm run test-email` - Test email configuration
- `npm run fix-env` - Fix .env file formatting

### Quick Reference

| Provider | SMTP_HOST | SMTP_PORT | Notes |
|----------|-----------|-----------|-------|
| Gmail | `smtp.gmail.com` | 587 | Requires App Password |
| Outlook | `smtp-mail.outlook.com` | 587 | Requires App Password |
| SendGrid | `smtp.sendgrid.net` | 587 | Use API key |
| Mailgun | `smtp.mailgun.org` | 587 | Domain-specific |
| AWS SES | `email-smtp.region.amazonaws.com` | 587 | AWS credentials |

---

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
- [ ] Real-time updates with WebSockets
- [ ] Multi-language support

---

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review Firebase Console for database issues
3. Check server console logs for errors
4. Verify environment variables are set correctly

---

## License

Private project for internal use.

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Next.js Version**: 16.1.1  
**Node.js Required**: 18.17+

