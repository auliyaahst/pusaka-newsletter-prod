'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import OTPVerification from '@/components/auth/OTPVerification'

function LoginPageContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showOTPVerification, setShowOTPVerification] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const verified = searchParams.get('verified')
    const errorParam = searchParams.get('error')
    const message = searchParams.get('message')
    
    if (verified === 'true') {
      setSuccess('Email verified successfully! You can now log in.')
    } else if (message === 'password-reset-success') {
      setSuccess('Password reset successfully! You can now log in with your new password.')
    } else if (errorParam === 'invalid-verification') {
      setError('Invalid verification link.')
    } else if (errorParam === 'invalid-or-expired') {
      setError('Verification link is invalid or expired.')
    } else if (errorParam === 'verification-failed') {
      setError('Email verification failed. Please try again.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    console.log('📧 Login attempt started for email:', email)

    try {
      // Send OTP verification request
      console.log('🔐 Sending OTP request to /api/auth/send-otp')
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, type: 'login' })
      })

      console.log('📡 OTP API response status:', response.status)
      const data = await response.json()
      console.log('📊 OTP API response data:', data)

      if (data.success) {
        console.log('✅ OTP sent successfully')
        if (data.skipOTP) {
          console.log('⚡ Skip OTP mode - direct login for admin/staff')
          // For excluded admin/staff emails, directly sign in
          const result = await signIn('credentials', {
            email,
            password,
            redirect: false
          })

          console.log('🔐 SignIn result:', result)
          
          if (result?.error) {
            console.error('❌ SignIn failed:', result.error)
            setError('Login failed. Please try again.')
          } else {
            console.log('✅ Login successful, redirecting to dashboard')
            router.push('/dashboard')
            router.refresh()
          }
        } else {
          console.log('📱 Regular OTP mode - showing verification')
          // For regular users, show OTP verification
          setShowOTPVerification(true)
        }
      } else {
        console.error('❌ OTP API failed:', data.error)
        setError(data.error || 'Invalid email or password')
      }
    } catch (err) {
      console.error('💥 Login error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPSuccess = async () => {
    console.log('🎉 OTP verification successful')
    // Wait a moment for the session to be established
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('🚀 Redirecting to dashboard after OTP success')
    router.push('/dashboard')
    router.refresh()
  }

  const handleBackToLogin = () => {
    console.log('🔙 Back to login form')
    // Reset to login form instead of going back
    setShowOTPVerification(false)
    setError('')
  }

  const handleGoogleSignIn = async () => {
    try {
      console.log('🔍 Google SignIn attempt started')
      setIsLoading(true)
      setError('')
      
      console.log('🌐 Callback URL:', `${window.location.origin}/dashboard`)
      await signIn('google', { 
        callbackUrl: `${window.location.origin}/dashboard`,
        redirect: true
      })
      console.log('📡 Google SignIn request sent')
    } catch (err) {
      console.error('💥 Google Sign In Error:', err)
      setError('An error occurred during Google sign in. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--accent-blue)' }}>
      <div className="w-full py-6 px-8 flex justify-center items-center" style={{ backgroundColor: 'var(--accent-blue)' }}>
        <Image
          src="/logo_title.svg"
          alt="The Pusaka Newsletter"
          width={150}
          height={96}
          className="h-14 sm:h-16 md:h-18 lg:h-24 w-auto"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div style={{ 
              backgroundColor: 'var(--primary-light)',
              boxShadow: 'var(--shadow-card)'
            }} className="rounded-xl p-8">
            
            {showOTPVerification ? (
              <OTPVerification
                email={email}
                type="login"
                password={password}
                onBack={handleBackToLogin}
                onSuccess={handleOTPSuccess}
              />
            ) : (
              <>
                <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold mb-6">Login</h2>
                
                {success && (
                  <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                  </div>
                )}
                
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter your email here"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter your password here"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      backgroundColor: 'black',
                      color: 'var(--text-white)',
                      borderColor: 'var(--border-light)'
                    }}
                    className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Logging in...' : 'Continue with Email'}
                  </button>
                </form>

                <div className="mt-4">
                  <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-gray-900 underline">
                    Forgot password?
                  </Link>
                </div>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="mt-4 w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="mt-6 text-center space-y-2">
                  {/* <div>
                    <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 underline">
                      Forgot your password?
                    </Link>
                  </div> */}
                  <div>
                    <span className="text-sm text-gray-600">Don&apos;t have an account? </span>
                    <Link href="/register" className="text-sm text-blue-600 hover:text-blue-800 underline">
                      Sign up
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="text-center py-4">
        <p className="text-blue-200 text-sm">© The Pusaka Newsletter</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}