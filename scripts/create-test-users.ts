import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUsers() {
  try {
    console.log('Creating test users...')
    
    const testUsers = [
      {
        id: 'admin-user-1',
        name: 'Admin User',
        email: 'admin@pusaka.com',
        password: await bcrypt.hash('admin123', 12),
        role: 'ADMIN' as const,
        subscriptionType: 'ANNUALLY' as const,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
        trialUsed: false,
      },
      {
        id: 'publisher-user-1',
        name: 'John Publisher',
        email: 'publisher@pusaka.com',
        password: await bcrypt.hash('publisher123', 12),
        role: 'PUBLISHER' as const,
        subscriptionType: 'QUARTERLY' as const,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
        isActive: true,
        trialUsed: false,
      },
      {
        id: 'editor-user-1',
        name: 'Jane Editor',
        email: 'editor@pusaka.com',
        password: await bcrypt.hash('editor123', 12),
        role: 'EDITOR' as const,
        subscriptionType: 'MONTHLY' as const,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
        isActive: true,
        trialUsed: false,
      },
      {
        id: 'customer-user-1',
        name: 'Alice Customer',
        email: 'customer@pusaka.com',
        password: await bcrypt.hash('customer123', 12),
        role: 'CUSTOMER' as const,
        subscriptionType: 'HALF_YEARLY' as const,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
        isActive: true,
        trialUsed: false,
      },
      {
        id: 'test-user-1',
        name: 'Bob Test',
        email: 'test@pusaka.com',
        password: await bcrypt.hash('test123', 12),
        role: 'CUSTOMER' as const,
        subscriptionType: 'FREE_TRIAL' as const,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        isActive: true,
        trialUsed: true,
      },
      {
        id: 'inactive-user-1',
        name: 'Charlie Inactive',
        email: 'inactive@pusaka.com',
        password: await bcrypt.hash('inactive123', 12),
        role: 'CUSTOMER' as const,
        subscriptionType: 'MONTHLY' as const,
        subscriptionStart: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
        subscriptionEnd: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago (expired)
        isActive: false,
        trialUsed: true,
      },
    //   {
    //     id: 'premium-user-1',
    //     name: 'David Premium',
    //     email: 'premium@pusaka.com',
    //     password: await bcrypt.hash('premium123', 12),
    //     role: 'CUSTOMER' as const,
    //     subscriptionType: 'ANNUALLY' as const,
    //     subscriptionStart: new Date(),
    //     subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    //     isActive: true,
    //     trialUsed: true,
    //   },
      // Additional test users for variety
      {
        id: 'editor-user-2',
        name: 'Mark Editor',
        email: 'editor2@pusaka.com',
        password: await bcrypt.hash('editor123', 12),
        role: 'EDITOR' as const,
        subscriptionType: 'HALF_YEARLY' as const,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
        isActive: true,
        trialUsed: false,
      },
      {
        id: 'customer-user-2',
        name: 'Sarah Customer',
        email: 'customer2@pusaka.com',
        password: await bcrypt.hash('customer123', 12),
        role: 'CUSTOMER' as const,
        subscriptionType: 'QUARTERLY' as const,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
        isActive: true,
        trialUsed: true,
      },
      {
        id: 'test-user-2',
        name: 'Emma Test',
        email: 'test2@pusaka.com',
        password: await bcrypt.hash('test123', 12),
        role: 'CUSTOMER' as const,
        subscriptionType: 'FREE_TRIAL' as const,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        isActive: true,
        trialUsed: false,
      },
    ]

    for (const user of testUsers) {
      try {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name,
            role: user.role,
            subscriptionType: user.subscriptionType,
            subscriptionStart: user.subscriptionStart,
            subscriptionEnd: user.subscriptionEnd,
            isActive: user.isActive,
            trialUsed: user.trialUsed,
          },
          create: user,
        })
        console.log(`✓ Created/Updated user: ${user.email} (${user.role})`)
      } catch (error) {
        console.log(`⚠️  Error with user ${user.email}:`, error instanceof Error ? error.message : error)
      }
    }

    console.log(`\n🎉 Successfully created ${testUsers.length} test users!`)
    console.log('\nTest User Credentials:')
    console.log('=====================')
    testUsers.forEach(user => {
      let password = 'customer123'
      if (user.email === 'admin@pusaka.com') password = 'admin123'
      else if (user.email.includes('publisher')) password = 'publisher123'
      else if (user.email.includes('editor')) password = 'editor123'
      else if (user.email.includes('trial')) password = 'trial123'
      
      console.log(`${user.email} | ${password} | ${user.role} | ${user.subscriptionType}`)
    })
    
  } catch (error) {
    console.error('Error creating test users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUsers()
