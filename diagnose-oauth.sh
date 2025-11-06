#!/bin/bash

echo "🔍 Google OAuth Diagnosis Script"
echo "================================"
echo ""

# Check if this is production or development
if [[ "$NEXTAUTH_URL" == "https://thepusaka.id" ]]; then
    echo "🌐 Environment: PRODUCTION"
    EXPECTED_CALLBACK="https://thepusaka.id/api/auth/callback/google"
else
    echo "🖥️  Environment: DEVELOPMENT"
    EXPECTED_CALLBACK="http://localhost:3000/api/auth/callback/google"
fi

echo "Expected callback URL: $EXPECTED_CALLBACK"
echo ""

echo "📋 Environment Variables Check:"
echo "==============================="
echo "NEXTAUTH_URL: ${NEXTAUTH_URL:-❌ NOT SET}"
echo "NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:+✅ SET}${NEXTAUTH_SECRET:-❌ NOT SET}"
echo "GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:+✅ SET}${GOOGLE_CLIENT_ID:-❌ NOT SET}"
echo "GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:+✅ SET}${GOOGLE_CLIENT_SECRET:-❌ NOT SET}"
echo ""

echo "🗄️  Database Configuration Check:"
echo "=================================="
echo "DATABASE_URL: ${DATABASE_URL:+✅ SET}${DATABASE_URL:-❌ NOT SET}"
echo "POSTGRES_URL: ${POSTGRES_URL:+✅ SET}${POSTGRES_URL:-❌ NOT SET}"
echo "PRISMA_DATABASE_URL: ${PRISMA_DATABASE_URL:+✅ SET}${PRISMA_DATABASE_URL:-❌ NOT SET}"
echo ""

echo "🔄 Testing Database Connection:"
echo "==============================="
# Test database connection using Node.js
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await prisma.\$connect();
    console.log('✅ Database connection: SUCCESS');
    
    // Test if we can query users table
    const userCount = await prisma.user.count();
    console.log(\`✅ User table accessible: \${userCount} users found\`);
    
    await prisma.\$disconnect();
  } catch (error) {
    console.log('❌ Database connection: FAILED');
    console.log('Error:', error.message);
    console.log('');
    console.log('🔧 Potential fixes:');
    console.log('1. Check if database URL is correct');
    console.log('2. Ensure database is running and accessible');
    console.log('3. Verify database credentials');
    console.log('4. Check network connectivity');
  }
}

testConnection();
" 2>/dev/null || echo "❌ Cannot test database connection (Prisma not available)"

echo ""
echo "🌍 Google OAuth Configuration Check:"
echo "===================================="
echo "In your Google Cloud Console, ensure these EXACT URLs are set:"
echo ""
echo "Authorized JavaScript origins:"
if [[ "$NEXTAUTH_URL" == "https://thepusaka.id" ]]; then
    echo "  ✅ https://thepusaka.id"
else
    echo "  ✅ http://localhost:3000"
fi
echo ""
echo "Authorized redirect URIs:"
echo "  ✅ $EXPECTED_CALLBACK"
echo ""
echo "❌ REMOVE these incorrect URIs if present:"
echo "  ❌ https://thepusaka.id/api/auth/signin/google"
echo "  ❌ http://localhost:3000/api/auth/signin/google"
echo ""

echo "🔍 Common OAuth Error Patterns:"
echo "==============================="
echo ""
echo "1. 🔄 'Callback' Error Pattern:"
echo "   URL: ${NEXTAUTH_URL}/login?error=Callback"
echo "   Cause: Database connection failed during session creation"
echo "   Fix: Check database connectivity above"
echo ""
echo "2. 🚫 'AccessDenied' Error Pattern:"
echo "   URL: ${NEXTAUTH_URL}/login?error=AccessDenied"
echo "   Cause: Google account not found in your database"
echo "   Fix: User must be created in database first"
echo ""
echo "3. 🔗 'Redirect URI Mismatch' Error:"
echo "   Cause: Google Console redirect URI doesn't match"
echo "   Fix: Update Google Console with exact callback URL above"
echo ""

echo "🚀 Quick Fixes to Try:"
echo "====================="
echo ""
echo "1. Update Google Console redirect URIs:"
echo "   - Remove any '/signin/' URLs"
echo "   - Keep only: $EXPECTED_CALLBACK"
echo ""
echo "2. If database connection failed:"
echo "   - Check if your database server is running"
echo "   - Verify network connectivity"
echo "   - Test connection manually"
echo ""
echo "3. If user not found in database:"
echo "   - Create user account first via email/password"
echo "   - Then link Google account to existing user"
echo ""
echo "4. For production environment:"
echo "   - Ensure NEXTAUTH_URL=https://thepusaka.id"
echo "   - Update Google Console with production URLs"
echo ""

echo "📊 Next Steps:"
echo "============="
echo "1. Run this script: ./diagnose-oauth.sh"
echo "2. Check Google Cloud Console settings"
echo "3. Test OAuth login again"
echo "4. Check browser console for specific error messages"
echo "5. Check application logs for detailed error information"
echo ""

# If we're in a Node.js environment, show current URL configuration
if command -v node >/dev/null 2>&1; then
    echo "🔗 Current NextAuth Configuration:"
    echo "================================="
    node -e "
    const nextauthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    console.log('NextAuth URL:', nextauthUrl);
    console.log('Expected callback:', nextauthUrl + '/api/auth/callback/google');
    console.log('Expected sign-in:', nextauthUrl + '/login');
    " 2>/dev/null
fi

echo ""
echo "🏁 Diagnosis Complete!"
echo "====================="
