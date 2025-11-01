'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    console.log('📝 Registration attempt started for email:', formData.email)

    // Validation
    if (formData.password !== formData.passwordConfirm) {
      console.log('❌ Password confirmation mismatch')
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      console.log('❌ Password too short')
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    if (!agreedToTerms) {
      console.log('❌ Terms not agreed')
      setError('Please agree to the Terms & Conditions')
      setIsLoading(false)
      return
    }

    try {
      console.log('🚀 Sending registration request to /api/auth/register')
      // Create user account and send verification email
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      console.log('📡 Registration API response status:', response.status)
      const data = await response.json()
      console.log('📊 Registration API response data:', data)

      if (response.ok) {
        console.log('✅ Registration successful - verification email sent')
        // Show success message - verification email sent
        setEmailSent(true)
      } else {
        console.error('❌ Registration failed:', data.error)
        setError(data.error || 'Registration failed')
      }
    } catch (err) {
      console.error('💥 Registration error:', err)
      setError('An error occurred during registration')
    }
    
    setIsLoading(false)
  }

  const handleGoogleSignIn = async () => {
    console.log('🔍 Google registration sign-in attempt')
    setIsLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
    setIsLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--accent-blue)' }}>
      {/* Header with Brand */}
      <div className="w-full py-2 px-8 flex justify-center sm:justify-start items-center" style={{ backgroundColor: 'var(--accent-blue)' }}>
        <Image
          src="/logo_title.svg"
          alt="The Pusaka Newsletter"
          width={150}
          height={56}
          className="h-14 w-auto"
          style={{
            filter: 'brightness(0) invert(1)'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-2" style={{ backgroundColor: 'var(--accent-cream)' }}>
        <div className="w-full max-w-md">
          <div style={{ 
              backgroundColor: 'var(--primary-light)',
              boxShadow: 'var(--shadow-card)'
            }} className="rounded-xl p-8">
            
            {emailSent ? (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email!</h2>
                <p className="text-gray-600 mb-6">
                  We&apos;ve sent a verification email to <strong>{formData.email}</strong>. 
                  Please click the link in the email to verify your account.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Didn&apos;t receive the email? Check your spam folder or try again.
                </p>
                <Link 
                  href="/login"
                  className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700"
                >
                  Go to Login
                </Link>
              </div>
            ) : (
              <>
                <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold mb-6">Create an account</h2>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Type your name here"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Type your email here"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Type your password here"
                    />
                  </div>

                  <div>
                    <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                      Password Confirm
                    </label>
                    <input
                      id="passwordConfirm"
                      name="passwordConfirm"
                      type="password"
                      value={formData.passwordConfirm}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Re-type your password here"
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700 text-left">
                      I agree to the{' '}
                      <Link href="/terms" className="text-blue-600 hover:text-blue-800 underline">
                        Terms & Conditions
                      </Link>
                    </label>
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
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>

                {/* Divider */}
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

                {/* Google Sign In */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  style={{
                    backgroundColor: 'var(--primary-light)',
                    borderColor: 'var(--border-light)',
                    color: 'var(--text-secondary)'
                  }}
                  className="mt-4 w-full flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="mt-6 text-center">
                  <span className="text-sm text-gray-600">Already have an account? </span>
                  <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800 underline">
                    Sign in
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center sm:text-left py-4 px-8">
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">© The Pusaka Newsletter</p>
      </div>
    </div>
  )
}