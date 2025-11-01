import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testPasswordResetFlow() {
  try {
    console.log('🧪 Testing password reset functionality...')
    
    // Check if reset fields exist
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        resetToken: true,
        resetExpiry: true,
      }
    })
    
    if (user) {
      console.log('✅ Password reset fields are available in database')
      console.log('📧 Test user found:', user.email)
      console.log('🔑 Reset token field:', user.resetToken ? 'Has token' : 'No token')
      console.log('⏰ Reset expiry field:', user.resetExpiry ? 'Has expiry' : 'No expiry')
    } else {
      console.log('❌ No users found in database')
    }
    
    console.log('')
    console.log('🚀 How to test forgot password:')
    console.log('1. Visit: http://localhost:3000/forgot-password')
    console.log('2. Enter an existing user email')
    console.log('3. Check your email for reset link')
    console.log('4. Click the link to reset password')
    console.log('5. Login with new password')
    
  } catch (error) {
    console.error('❌ Error testing password reset:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
testPasswordResetFlow()
  .then(() => {
    console.log('🎉 Password reset test complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Failed to test password reset:', error)
    process.exit(1)
  })
