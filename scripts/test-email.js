// Test email configuration
require('dotenv').config()
const nodemailer = require('nodemailer')

console.log('Testing email configuration...\n')

// Check if required environment variables are set
const requiredVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD']
const missingVars = requiredVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:')
  missingVars.forEach(varName => console.error(`   - ${varName}`))
  console.error('\nPlease add these to your .env file. See EMAIL_SETUP.md for instructions.')
  process.exit(1)
}

console.log('✓ All required environment variables are set')
console.log(`  SMTP_HOST: ${process.env.SMTP_HOST}`)
console.log(`  SMTP_PORT: ${process.env.SMTP_PORT || 587}`)
console.log(`  SMTP_USER: ${process.env.SMTP_USER}`)
console.log(`  SMTP_FROM: ${process.env.SMTP_FROM || process.env.SMTP_USER}\n`)

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

// Test connection
console.log('Testing SMTP connection...')
transporter.verify((error, success) => {
  if (error) {
    console.error('\n❌ Email configuration error:')
    console.error(`   ${error.message}\n`)
    
    if (error.code === 'EAUTH') {
      console.log('💡 Common fixes:')
      console.log('   - For Gmail: Make sure you\'re using an App Password (not your regular password)')
      console.log('   - Enable 2-Step Verification and generate an App Password')
      console.log('   - Check that SMTP_USER matches your email address exactly')
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.log('💡 Common fixes:')
      console.log('   - Check your internet connection')
      console.log('   - Verify SMTP_HOST is correct')
      console.log('   - Check if firewall/antivirus is blocking port 587')
    }
    
    process.exit(1)
  } else {
    console.log('✅ Email server is ready to send messages!\n')
    
    // Optionally send a test email
    const testEmail = process.argv[2]
    if (testEmail) {
      console.log(`Sending test email to ${testEmail}...`)
      transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: testEmail,
        subject: 'Test Email - Eggbator',
        html: `
          <h2>Test Email</h2>
          <p>This is a test email from your Eggbator system.</p>
          <p>If you received this, your email configuration is working correctly!</p>
          <p>Sent at: ${new Date().toLocaleString()}</p>
        `,
      })
        .then(() => {
          console.log(`✅ Test email sent successfully to ${testEmail}`)
          console.log('   Check your inbox (and spam folder)')
          process.exit(0)
        })
        .catch((err) => {
          console.error(`❌ Failed to send test email: ${err.message}`)
          process.exit(1)
        })
    } else {
      console.log('💡 To send a test email, run:')
      console.log(`   node scripts/test-email.js your-email@example.com`)
      process.exit(0)
    }
  }
})

