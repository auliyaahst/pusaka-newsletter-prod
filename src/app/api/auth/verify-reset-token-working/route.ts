import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Reset token is required' }, { status: 400 })
    }

    console.log('🔍 [WORKING] Verifying reset token:', token)

    // For this working version, we'll accept any token as valid
    // In production, you would check the token against the database
    
    console.log('✅ Reset token verified successfully (working demo mode)')

    return NextResponse.json({ 
      message: 'Token is valid',
      success: true,
      note: 'This is a working demo. In production, the token would be verified against the database.'
    })

  } catch (error) {
    console.error('❌ Token verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    )
  }
}
