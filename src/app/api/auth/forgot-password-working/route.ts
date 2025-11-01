import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    console.log('🔐 [WORKING] Forgot password request for email:', email)

    // Generate reset token (this will work without database)
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    console.log('🔑 Generated reset token:', resetToken)

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    })

    // Email template
    const mailOptions = {
      from: `"The Pusaka Newsletter" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password - The Pusaka Newsletter',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello there,</p>
            
            <p>We received a request to reset your password for your The Pusaka Newsletter account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <a href="${resetUrl}" class="button">Reset My Password</a>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 4px;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>This link will expire in 15 minutes for security reasons</li>
                <li>If you didn't request this password reset, you can safely ignore this email</li>
                <li>Never share this link with anyone else</li>
              </ul>
            </div>
            
            <p><strong>Note:</strong> This is a test email (database connection bypass). In production, the token would be stored securely in the database.</p>
            
            <p>If you continue to have problems, please contact our support team.</p>
            
            <p>Best regards,<br>The Pusaka Newsletter Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to ${email}</p>
            <p>© ${new Date().getFullYear()} The Pusaka Newsletter. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    }

    console.log('📧 Attempting to send email...')
    
    // Send email
    await transporter.sendMail(mailOptions)
    console.log('✅ Password reset email sent successfully to:', email)

    return NextResponse.json({ 
      message: 'Password reset email sent! Please check your inbox (including spam folder).',
      resetUrl: resetUrl, // For debugging - remove in production
      success: true
    })

  } catch (error) {
    console.error('❌ Email sending error:', error)
    return NextResponse.json(
      { error: 'Failed to send reset email. Please check your email configuration.' },
      { status: 500 }
    )
  }
}
