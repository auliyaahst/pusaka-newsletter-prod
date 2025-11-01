'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'

interface OTPVerificationProps {
  email: string
  type: 'login' | 'register'
  password?: string
  onBack: () => void
  onSuccess: () => void
}

export default function OTPVerification({ email, type, password, onBack, onSuccess }: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [timeLeft, setTimeLeft] = useState(60) // 1 minute
  const [resendCooldown, setResendCooldown] = useState(30) // Initial 30 second cooldown

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    // Clear error and success messages when user starts typing
    if (error) setError('')
    if (successMessage) setSuccessMessage('')
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    setIsVerifying(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode, type })
      })

      const data = await response.json()

      if (data.success) {
        if (type === 'login') {
          // Sign in the user
          const result = await signIn('credentials', {
            email,
            password: 'verified', // Special flag for OTP-verified login
            redirect: false
          })
          
          if (result?.ok) {
            // Wait for session to be established before calling success
            setTimeout(() => {
              onSuccess()
            }, 500)
          } else {
            setError('Login failed after OTP verification')
          }
        } else {
          // Registration complete - redirect to login
          onSuccess()
        }
      } else {
        setError(data.error || 'Verification failed')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || isResending) return

    setIsResending(true)
    setError('')
    setSuccessMessage('')
    
    try {
      const requestBody: { email: string; type: string; password?: string } = { 
        email, 
        type 
      }
      
      // For login type, include password for verification
      if (type === 'login' && password) {
        requestBody.password = password
      }

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setTimeLeft(60) // Reset to 1 minute
        setResendCooldown(60) // 1 minute cooldown
        setOtp(['', '', '', '', '', ''])
        setSuccessMessage('OTP code resent successfully!')
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(data.error || 'Failed to resend OTP. Please try again.')
      }
    } catch {
      setError('Failed to resend OTP. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
        <p className="mt-2 text-gray-600">
          We&apos;ve sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center space-x-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isVerifying || isResending}
            />
          ))}
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg">
            {successMessage}
          </div>
        )}

        <div className="text-center text-sm text-gray-600">
          {timeLeft > 0 ? (
            <p>Code expires in {formatTime(timeLeft)}</p>
          ) : (
            <p className="text-red-600">Code has expired</p>
          )}
        </div>

        <button
          onClick={handleVerifyOTP}
          disabled={isVerifying || otp.join('').length !== 6}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? 'Verifying...' : 'Verify Code'}
        </button>

        <div className="flex items-center justify-between text-sm">
          {type === 'login' ? (
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800"
              disabled={isVerifying || isResending}
            >
              ← Back
            </button>
          ) : (
            <div></div> // Empty div for spacing when no back button
          )}
          
          <button
            onClick={handleResendOTP}
            disabled={resendCooldown > 0 || isResending}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              resendCooldown > 0 || isResending
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {isResending ? (
              'Sending...'
            ) : resendCooldown > 0 ? (
              `Resend in ${formatTime(resendCooldown)}`
            ) : (
              'Resend Code'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
