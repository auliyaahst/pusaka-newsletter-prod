import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 OAuth Test Route - Starting diagnostic check')
    
    // Test external connectivity to Google
    const testConnectivity = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        // Use the correct Google OAuth discovery endpoint
        const response = await fetch('https://accounts.google.com/.well-known/openid-configuration', {
          signal: controller.signal,
          headers: {
            'User-Agent': 'NextAuth-Test/1.0'
          }
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          return { success: true, status: response.status }
        } else {
          return { success: false, status: response.status, error: 'HTTP Error' }
        }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          name: error instanceof Error ? error.name : 'UnknownError'
        }
      }
    }

    const connectivityTest = await testConnectivity()
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
      },
      environment: {
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        googleClientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
        nextAuthUrl: process.env.NEXTAUTH_URL || 'not set',
      },
      connectivity: connectivityTest,
      dns: {
        // Basic DNS resolution test
        timestamp: new Date().toISOString()
      }
    }

    console.log('🔍 OAuth Diagnostic Results:', diagnostics)

    return NextResponse.json(diagnostics)
  } catch (error) {
    console.error('❌ OAuth Test Route Error:', error)
    return NextResponse.json({
      error: 'Diagnostic test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
