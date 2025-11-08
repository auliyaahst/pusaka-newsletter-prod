import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 OAuth Debug Route - Starting comprehensive OAuth analysis')
    
    // Test multiple Google OAuth endpoints
    const testEndpoints = async () => {
      const endpoints = [
        'https://accounts.google.com/.well-known/openid-configuration',
        'https://oauth2.googleapis.com/token',
        'https://www.googleapis.com/oauth2/v3/certs',
        'https://accounts.google.com/o/oauth2/v2/auth'
      ]
      
      const results = []
      
      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 15000)
          
          const startTime = Date.now()
          const response = await fetch(endpoint, {
            method: 'HEAD', // Use HEAD to avoid large responses
            signal: controller.signal,
            headers: {
              'User-Agent': 'NextAuth-OAuth-Debug/1.0'
            }
          })
          
          clearTimeout(timeoutId)
          const duration = Date.now() - startTime
          
          results.push({
            endpoint,
            success: response.ok,
            status: response.status,
            duration: `${duration}ms`,
            headers: Object.fromEntries(response.headers.entries())
          })
        } catch (error) {
          results.push({
            endpoint,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            errorName: error instanceof Error ? error.name : 'UnknownError'
          })
        }
      }
      
      return results
    }

    const endpointTests = await testEndpoints()
    
    // Test OAuth flow simulation
    const testOAuthFlow = async () => {
      try {
        const clientId = process.env.GOOGLE_CLIENT_ID
        if (!clientId) {
          return { error: 'No Google Client ID found' }
        }
        
        // Build OAuth authorization URL (same as NextAuth would)
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
        authUrl.searchParams.set('client_id', clientId)
        authUrl.searchParams.set('redirect_uri', `${process.env.NEXTAUTH_URL}/api/auth/callback/google`)
        authUrl.searchParams.set('scope', 'openid email profile')
        authUrl.searchParams.set('response_type', 'code')
        authUrl.searchParams.set('state', 'test-state-123')
        
        // Test if the authorization URL is accessible
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        
        const response = await fetch(authUrl.toString(), {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'User-Agent': 'NextAuth-OAuth-Flow-Test/1.0'
          }
        })
        
        clearTimeout(timeoutId)
        
        return {
          authUrl: authUrl.toString(),
          accessible: response.ok,
          status: response.status,
          redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
        }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Unknown error',
          errorName: error instanceof Error ? error.name : 'UnknownError'
        }
      }
    }

    const oauthFlowTest = await testOAuthFlow()
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        nextAuthUrl: process.env.NEXTAUTH_URL,
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        googleClientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
        nodeVersion: process.version,
        platform: process.platform
      },
      endpointTests,
      oauthFlowTest,
      recommendations: [] as string[]
    }

    // Add recommendations based on test results
    if (!oauthFlowTest.accessible) {
      diagnostics.recommendations.push('OAuth authorization endpoint not accessible - check Google Cloud Console settings')
    }
    
    const failedEndpoints = endpointTests.filter(test => !test.success)
    if (failedEndpoints.length > 0) {
      diagnostics.recommendations.push(`${failedEndpoints.length} Google endpoints failed - possible network or configuration issue`)
    }

    console.log('🔍 OAuth Debug Results:', JSON.stringify(diagnostics, null, 2))

    return NextResponse.json(diagnostics)
  } catch (error) {
    console.error('❌ OAuth Debug Route Error:', error)
    return NextResponse.json({
      error: 'OAuth debug test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
