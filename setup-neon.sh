#!/bin/bash

# Neon.tech Database Setup Script for Pusaka Newsletter

echo "🚀 Setting up Neon.tech PostgreSQL Database for Pusaka Newsletter"
echo "=================================================="

echo "📋 Please complete these steps:"
echo ""
echo "1. Go to https://neon.tech"
echo "2. Sign up/login to your account"
echo "3. Create a new project:"
echo "   - Project name: pusaka-newsletter"
echo "   - Database name: pusaka_prod"
echo "   - Region: Choose closest to you"
echo ""
echo "4. Copy your connection string (it looks like):"
echo "   postgresql://username:password@ep-xxx.region.aws.neon.tech/pusaka_prod?sslmode=require"
echo ""

read -p "5. Paste your Neon connection string here: " NEON_URL

if [ -z "$NEON_URL" ]; then
    echo "❌ No connection string provided. Exiting."
    exit 1
fi

echo ""
echo "🔧 Updating .env file with Neon database..."

# Backup current .env
cp .env .env.backup

# Update DATABASE_URL in .env file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$NEON_URL\"|" .env
else
    # Linux
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$NEON_URL\"|" .env
fi

echo "✅ Updated .env file"

echo ""
echo "🧪 Testing database connection..."

# Test the connection
if npx prisma db push --accept-data-loss; then
    echo "✅ Database connection successful!"
    
    echo ""
    echo "📦 Generating Prisma client..."
    npx prisma generate
    
    echo ""
    echo "🎉 Database setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Run: npm run dev"
    echo "2. Login with: tpadmin@thepusaka.id / M@cchiato0#"
    echo "3. The app should now work with real database!"
    
else
    echo "❌ Database connection failed. Please check your connection string."
    echo "Restoring backup .env file..."
    mv .env.backup .env
    exit 1
fi

echo ""
echo "🗑️  Removing backup .env file..."
rm -f .env.backup

echo ""
echo "🚀 You can now start your application:"
echo "npm run dev"
