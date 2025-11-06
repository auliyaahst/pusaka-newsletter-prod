import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  },
  // Add timeout settings to prevent hanging
  connectionTimeout: 30000, // 30 seconds
  greetingTimeout: 10000,   // 10 seconds
  socketTimeout: 60000      // 60 seconds
})

export async function sendOTPEmail(email: string, otp: string, type: 'login' | 'register') {
  const subject = type === 'login' ? 'Login Verification Code' : 'Registration Verification Code'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e3a8a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .otp-code { background: #1e3a8a; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; margin: 20px 0; border-radius: 8px; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .warning { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Pusaka Newsletter</h1>
          <p>${type === 'login' ? 'Login Verification' : 'Account Verification'}</p>
        </div>
        <div class="content">
          <h2>Hello!</h2>
          <p>We received a ${type === 'login' ? 'login attempt' : 'registration request'} for your account. Please use the verification code below:</p>
          
          <div class="otp-code">${otp}</div>
          
          <p><strong>This code will expire in 1 minute.</strong></p>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul>
              <li>Never share this code with anyone</li>
              <li>Pusaka Newsletter will never ask for this code via phone or email</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
          </div>
          
          <p>If you're having trouble, please contact our support team.</p>
        </div>
        <div class="footer">
          <p>© 2024 Pusaka Newsletter. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const mailOptions = {
    from: `"Pusaka Newsletter" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: subject,
    html: html
  }

  try {
    console.log('📧 Attempting to send email to:', email)
    console.log('📨 Using Gmail account:', process.env.GMAIL_USER)
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email sent successfully:', info.messageId)
    return { success: true }
  } catch (error) {
    console.error('💥 Email sending failed:', error)
    console.error('📧 GMAIL_USER configured:', !!process.env.GMAIL_USER)
    console.error('🔐 GMAIL_APP_PASSWORD configured:', !!process.env.GMAIL_APP_PASSWORD)
    return { success: false, error: 'Failed to send email' }
  }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}