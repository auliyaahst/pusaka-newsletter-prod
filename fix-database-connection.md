# 🔧 URGENT FIX: Database Connection Issue

## 🔍 **Problem Identified:**
```
NextAuth Error: OAUTH_CALLBACK_HANDLER_ERROR
Can't reach database server at `103.16.117.237:5432`
```

Google OAuth is working, but NextAuth can't save the session because the database is unreachable.

## 🚀 **IMMEDIATE SOLUTION:**

### **Step 1: Update .env on VPS**
SSH to your VPS and edit the .env file:

```bash
ssh root@dopiolatte
cd /home/thepusaka/pusaka-newsletter-prod
nano .env
```

### **Step 2: Replace Database Configuration**
Update your .env with this configuration:

```env
# Google OAuth Configuration (Keep same)
GOOGLE_CLIENT_ID="2386453923-6ks8kumpi3ig17ag424i1ud85cdd542h.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"

# NextAuth Configuration (Keep same)
NEXTAUTH_SECRET="9qxKMh8d1UB4+VjjLs3eOyHsOUzZDQi4x+gW1sLMH5Q="
NEXTAUTH_URL="https://thepusaka.id"

# Database Configuration - USE PRISMA ACCELERATE ONLY
DATABASE_URL="postgresql://tpadmin:%21J%40karta01%23%2A@103.16.117.237:5432/pusaka_prod"
POSTGRES_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19ZWHZjN3BMM293ckitemlCNzFhZFYiLCJhcGlfa2V5IjoiMDFLOFdZOFJLUEhTMTI2ODAxMlIyS01BUjEiLCJ0ZW5hbnRfaWQiOiIxYmJhMDM5ZGU4ZmMyNTZjNTI4ZDgxMjMyNDY2ZGMyYmNjZDBkMDRiODhmY2UyMGEzZjAyZjE1YzQxNmViM2VlIiwiaW50ZXJuYWxfc2VjcmV0IjoiZmJhMGRkN2QtNzBmOS00MWM4LTkzNWEtODhlMGJiY2Q1MTg3In0.1x0nun4QKnp5JnWXaeRUhPwhpnft0aTIVWoZDGrIk4I"
PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19ZWHZjN3BMM293ckitemlCNzFhZFYiLCJhcGlfa2V5IjoiMDFLOFdZOFJLUEhTMTI2ODAxMlIyS01BUjEiLCJ0ZW5hbnRfaWQiOiIxYmJhMDM5ZGU4ZmMyNTZjNTI4ZDgxMjMyNDY2ZGMyYmNjZDBkMDRiODhmY2UyMGEzZjAyZjE1YzQxNmViM2VlIiwiaW50ZXJuYWxfc2VjcmV0IjoiZmJhMGRkN2QtNzBmOS00MWM4LTkzNWEtODhlMGJiY2Q1MTg3In0.1x0nun4QKnp5JnWXaeRUhPwhpnft0aTIVWoZDGrIk4I"

# Gmail SMTP Configuration (Keep same)
GMAIL_USER=tpadmin@thepusaka.id
GMAIL_APP_PASSWORD=wzfvewfvdlwgefik
```

**Key Changes:**
- All database connections now use Prisma Accelerate
- This bypasses the direct connection issue to `103.16.117.237:5432`

### **Step 3: Restart Application**
```bash
# Generate Prisma client with new config
npx prisma generate

# Restart PM2
pm2 restart pusaka-prod

# Monitor logs
pm2 logs pusaka-prod --lines 50
```

### **Step 4: Test Login**
1. Go to https://thepusaka.id/login
2. Try Google OAuth login
3. Watch the logs: `pm2 logs pusaka-prod`

## 🔄 **ALTERNATIVE FIX: Local Database**

If Prisma Accelerate doesn't work, use local PostgreSQL:

### **Step 1: Install PostgreSQL on VPS**
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### **Step 2: Create Database and User**
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE pusaka_prod;
CREATE USER pusaka WITH ENCRYPTED PASSWORD 'pusaka123';
GRANT ALL PRIVILEGES ON DATABASE pusaka_prod TO pusaka;
\q
```

### **Step 3: Update .env for Local Database**
```env
# Use local database instead
DATABASE_URL="postgresql://pusaka:pusaka123@localhost:5432/pusaka_prod"
POSTGRES_URL="${DATABASE_URL}"
PRISMA_DATABASE_URL="${DATABASE_URL}"
```

### **Step 4: Initialize Database**
```bash
# Push schema to local database
npx prisma db push

# Restart application
pm2 restart pusaka-prod
```

## 🎯 **Expected Result:**

After applying the fix, you should see in logs:
```
✅ Database connected successfully
✅ NextAuth session created
✅ User redirected to dashboard
```

## 📞 **Next Steps:**

1. **Try Prisma Accelerate fix first** (recommended)
2. **If that fails, use local database**
3. **Share the new logs** after restart
4. **Test Google OAuth login**

The Google OAuth part is working perfectly - we just need to fix the database connection!
