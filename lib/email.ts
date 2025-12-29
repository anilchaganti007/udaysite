import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendOrderConfirmationEmail(
  to: string,
  orderNumber: string,
  orderDetails: any,
  pdfBuffer?: Buffer
) {
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `Order Confirmation - ${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .order-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmation</h1>
            </div>
            <div class="content">
              <p>Dear ${orderDetails.customerName},</p>
              <p>Thank you for your order! Your order has been confirmed.</p>
              <div class="order-details">
                <h2>Order Details</h2>
                <p><strong>Order Number:</strong> ${orderNumber}</p>
                <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Total Amount:</strong> ₹${orderDetails.totalAmount.toFixed(2)}</p>
                <p><strong>Status:</strong> ${orderDetails.status}</p>
              </div>
              <p>We will process your order and notify you once it's shipped.</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>${process.env.APP_NAME || 'Eggbator'}</p>
            </div>
          </div>
        </body>
      </html>
    `,
    attachments: pdfBuffer
      ? [
          {
            filename: `order-${orderNumber}.pdf`,
            content: pdfBuffer,
          },
        ]
      : [],
  }

  return transporter.sendMail(mailOptions)
}

export async function sendWelcomeEmail(
  to: string,
  customerName: string
) {
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `Welcome to ${process.env.APP_NAME || 'Eggbator'}!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #667eea; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome ${customerName}!</h1>
            </div>
            <div class="content">
              <p>Dear ${customerName},</p>
              <p>Thank you for registering with ${process.env.APP_NAME || 'Eggbator'}! We&apos;re excited to have you as part of our community.</p>
              <p>You can now:</p>
              <ul>
                <li>Browse our products and spare parts</li>
                <li>Submit product enquiries</li>
                <li>Track your orders</li>
                <li>Get support when you need it</li>
              </ul>
              <p style="text-align: center;">
                <a href="${process.env.APP_URL || 'http://localhost:3000'}" class="button">Visit Our Store</a>
              </p>
              <p>If you have any questions, feel free to contact our support team. We&apos;re here to help!</p>
              <p>Best regards,<br>${process.env.APP_NAME || 'The Eggbator Team'}</p>
            </div>
            <div class="footer">
              <p>${process.env.APP_NAME || 'Eggbator'}</p>
              <p>${process.env.APP_URL || 'http://localhost:3000'}</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }

  return transporter.sendMail(mailOptions)
}

export async function sendLeadNotificationToAdmins(
  adminEmails: string[],
  leadData: {
    customerName: string
    customerEmail: string
    customerPhone: string
    productName?: string
    productId?: string
    message?: string
    leadId: string
  }
) {
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: adminEmails.join(', '),
    subject: `New Lead Generated - ${leadData.productName || 'Product Enquiry'}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #e67e22; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .lead-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #e67e22; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #e67e22; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 New Lead Generated</h1>
            </div>
            <div class="content">
              <p>Hello Admin,</p>
              <p>A new lead has been generated and requires your attention.</p>
              <div class="lead-details">
                <h2>Lead Details</h2>
                <p><strong>Lead ID:</strong> ${leadData.leadId}</p>
                <p><strong>Customer Name:</strong> ${leadData.customerName}</p>
                <p><strong>Customer Email:</strong> ${leadData.customerEmail}</p>
                <p><strong>Customer Phone:</strong> ${leadData.customerPhone}</p>
                ${leadData.productName ? `<p><strong>Product:</strong> ${leadData.productName}</p>` : ''}
                ${leadData.productId ? `<p><strong>Product ID:</strong> ${leadData.productId}</p>` : ''}
                ${leadData.message ? `<p><strong>Message:</strong><br>${leadData.message.replace(/\n/g, '<br>')}</p>` : ''}
                <p><strong>Status:</strong> NEW</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <p style="text-align: center;">
                <a href="${process.env.APP_URL || 'http://localhost:3000'}/admin/leads" class="button">View Lead in Admin Panel</a>
              </p>
              <p>Please contact the customer and update the lead status accordingly.</p>
            </div>
            <div class="footer">
              <p>${process.env.APP_NAME || 'Eggbator'}</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }

  return transporter.sendMail(mailOptions)
}

export async function sendLeadThankYouEmail(
  to: string,
  customerName: string,
  productName?: string
) {
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `Thank You for Your Interest - ${productName || 'Product Enquiry'}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2ecc71; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .product-info { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You for Your Interest!</h1>
            </div>
            <div class="content">
              <p>Dear ${customerName},</p>
              <p>Thank you for showing interest in ${productName ? `our product: <strong>${productName}</strong>` : 'our products'}!</p>
              ${productName ? `
              <div class="product-info">
                <h3>Product: ${productName}</h3>
                <p>We have received your enquiry and our team will review it shortly.</p>
              </div>
              ` : ''}
              <p>Our sales team will contact you soon to discuss your requirements and answer any questions you may have.</p>
              <p>In the meantime, feel free to:</p>
              <ul>
                <li>Browse our other products</li>
                <li>Check out our FAQ section</li>
                <li>Contact our support team if you have urgent questions</li>
              </ul>
              <p>We appreciate your interest and look forward to serving you!</p>
              <p>Best regards,<br>${process.env.APP_NAME || 'The Eggbator Sales Team'}</p>
            </div>
            <div class="footer">
              <p>${process.env.APP_NAME || 'Eggbator'}</p>
              <p>${process.env.APP_URL || 'http://localhost:3000'}</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }

  return transporter.sendMail(mailOptions)
}

