import { NextRequest, NextResponse } from 'next/server'

// This is a test version that doesn't require database connection
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    console.log('🔐 Test forgot password request for email:', email)

    // Simulate the forgot password flow without database
    console.log('✅ Test email would be sent to:', email)
    
    return NextResponse.json({ 
      message: 'Test: Password reset email would be sent! Please check your inbox.',
      testMode: true,
      resetUrl: `http://localhost:3000/reset-password?token=test-token-${Date.now()}`
    })

  } catch (error) {
    console.error('❌ Test forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to send reset email. Please try again.' },
      { status: 500 }
    )
  }
}
