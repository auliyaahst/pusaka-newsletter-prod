# Google OAuth Configuration Checklist for Production

## 1. Google Cloud Console Settings
Visit: https://console.cloud.google.com/apis/credentials

### Your OAuth 2.0 Client ID: 2386453923-6ks8kumpi3ig17ag424i1ud85cdd542h.apps.googleusercontent.com

### ⚠️ CRITICAL FIX NEEDED - Redirect URI Error Found!

**❌ REMOVE this incorrect URI from your Google Console:**
- `https://thepusaka.id/api/auth/signin/google` (WRONG - causes callback errors)

### Required Settings:
1. **Authorized JavaScript origins:**
   - https://thepusaka.id
   - http://localhost:3000 (for development)

2. **Authorized redirect URIs (EXACT URLS REQUIRED):**
   - `https://thepusaka.id/api/auth/callback/google` ✅ (correct)
   - `http://localhost:3000/api/auth/callback/google` ✅ (for development)

**🔧 IMMEDIATE ACTION REQUIRED:**
1. Go to Google Cloud Console
2. Remove the incorrect `/signin/` URI
3. Keep only the `/callback/` URIs
4. Save changes
5. Test Google OAuth again

## 2. Check Current Settings
1. Go to Google Cloud Console
2. Navigate to "APIs & Services" > "Credentials"
3. Click on your OAuth 2.0 Client ID
4. Verify the URIs above are added
5. Save changes

## 3. Production Environment Variables
Ensure your production .env has:
- NEXTAUTH_URL="https://thepusaka.id" ✓
- GOOGLE_CLIENT_ID="2386453923-6ks8kumpi3ig17ag424i1ud85cdd542h.apps.googleusercontent.com" ✓
- GOOGLE_CLIENT_SECRET="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" ✓

## 4. ❌ Google OAuth Callback Error - RESOLVED

### **Error URL Pattern:**
```
https://thepusaka.id/login?callbackUrl=https%3A%2F%2Fthepusaka.id%2Fdashboard&error=Callback
```

### **Root Cause:**
The `error=Callback` indicates NextAuth successfully authenticated with Google, but **failed to save the session to the database**. This happens when:

1. **Database Connection Failed:** Remote database `103.16.117.237:5432` is unreachable
2. **Database Permissions:** User `tpadmin` doesn't have proper access
3. **Prisma Accelerate Conflict:** Conflicting database URLs in configuration

### **Current Production Database Issues:**

1. **Remote Database Connection:** `postgresql://tpadmin:...@103.16.117.237:5432/pusaka_prod`
   - This remote server might be unreachable or have connectivity issues
   - Google OAuth fails because user sessions can't be saved to database

2. **Prisma Accelerate Configuration:** Complex accelerate URL in PRISMA_DATABASE_URL
   - May cause connection conflicts with main DATABASE_URL

### **🚨 ALTERNATIVE FIX: Using Remote Database**

If you prefer to use your remote database instead of local, here's how to fix the connection issues:

**Step 1: Test Remote Database Connection**
First, let's verify if the remote database is accessible:

```bash
# Test connection to remote database
psql -h 103.16.117.237 -U tpadmin -d pusaka_prod -c "SELECT version();"

# If that fails, try:
telnet 103.16.117.237 5432
```

**Step 2: Use Corrected Remote Database Configuration**
```env
# Google OAuth (Keep these same)
GOOGLE_CLIENT_ID="2386453923-6ks8kumpi3ig17ag424i1ud85cdd542h.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"

# NextAuth (Keep these same)
NEXTAUTH_SECRET="9qxKMh8d1UB4+VjjLs3eOyHsOUzZDQi4x+gW1sLMH5Q="
NEXTAUTH_URL="https://thepusaka.id"

# Remote Database Configuration
DATABASE_URL="postgresql://tpadmin:%21J%40karta01%23%2A@103.16.117.237:5432/pusaka_prod"
POSTGRES_URL="${DATABASE_URL}"

# Option A: Use Prisma Accelerate (if working)
PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19ZWHZjN3BMM293ckitemlCNzFhZFYiLCJhcGlfa2V5IjoiMDFLOFdZOFJLUEhTMTI2ODAxMlIyS01BUjEiLCJ0ZW5hbnRfaWQiOiIxYmJhMDM5ZGU4ZmMyNTZjNTI4ZDgxMjMyNDY2ZGMyYmNjZDBkMDRiODhmY2UyMGEzZjAyZjE1YzQxNmViM2VlIiwiaW50ZXJuYWxfc2VjcmV0IjoiZmJhMGRkN2QtNzBmOS00MWM4LTkzNWEtODhlMGJiY2Q1MTg3In0.1x0nun4QKnp5JnWXaeRUhPwhpnft0aTIVWoZDGrIk4I"

# Option B: Use direct connection (if Accelerate causes issues)
# PRISMA_DATABASE_URL="${DATABASE_URL}"

# Gmail SMTP (Keep these same)
GMAIL_USER=tpadmin@thepusaka.id
GMAIL_APP_PASSWORD=wzfvewfvdlwgefik
```

**Step 3: Common Remote Database Issues & Fixes**

1. **Firewall/Security Group Issues:**
   - Ensure port 5432 is open from your production server IP
   - Check if your hosting provider blocks outbound connections

2. **Database Server Configuration:**
   - Verify PostgreSQL is configured to accept external connections
   - Check `postgresql.conf`: `listen_addresses = '*'`
   - Check `pg_hba.conf`: Allow connections from your server IP

3. **Network Connectivity:**
   - Test from your production server: `ping 103.16.117.237`
   - Test port: `telnet 103.16.117.237 5432`

4. **Prisma Accelerate Conflicts:**
   - If using Accelerate, ensure the API key is valid
   - Try disabling Accelerate temporarily by setting: `PRISMA_DATABASE_URL="${DATABASE_URL}"`

**Step 4: Debugging Commands for Production Server**
```bash
# Test database connectivity from your production server
psql -h 103.16.117.237 -U tpadmin -d pusaka_prod -c "\dt"

# Check if NextAuth can connect
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count().then(count => {
  console.log('✅ Database connected, user count:', count);
  process.exit(0);
}).catch(err => {
  console.error('❌ Database connection failed:', err.message);
  process.exit(1);
});
"

# Monitor real-time logs during OAuth attempt
pm2 logs pusaka-prod --lines 50
```

**Step 5: Deploy Remote Database Configuration**
```bash
# On your production server:
cd /path/to/your/app

# Update your .env file with the remote database settings
# Then sync the database schema
npx prisma db push

# Restart PM2 to reload environment variables
pm2 restart pusaka-prod

# Monitor logs during restart
pm2 logs pusaka-prod --lines 20
```

**Step 6: Test Google OAuth with Remote Database**
1. Visit https://thepusaka.id/login
2. Click "Continue with Google"
3. Monitor PM2 logs in real-time: `pm2 logs pusaka-prod`
4. Look for database connection success/failure messages

### **🔍 Remote Database Troubleshooting Checklist:**

**❌ If you see "connection refused" errors:**
- Database server `103.16.117.237` is not reachable
- Port 5432 might be blocked by firewall
- PostgreSQL service might be down

**❌ If you see "authentication failed" errors:**
- Password might be incorrect (special characters in URL encoding)
- User `tpadmin` might not exist or lack permissions
- Database `pusaka_prod` might not exist

**❌ If you see "timeout" errors:**
- Network connectivity issues between your server and database
- Database server overloaded or not responding

**✅ Expected Success Pattern in Logs:**
```
✅ Database connected successfully
✅ NextAuth session created
✅ User redirected to dashboard
```

### **💡 Pro Tip: Database URL Encoding**
Your password contains special characters. Ensure they're properly URL-encoded:
- `!` becomes `%21`
- `@` becomes `%40` 
- `#` becomes `%23`
- `*` becomes `%2A`

Current encoded password: `%21J%40karta01%23%2A` = `!J@karta01#*`

**Step 3: Test Google OAuth**
- Visit https://thepusaka.id/login
- Click "Continue with Google"
- Should now redirect to dashboard successfully

### **🔍 If Issue Persists - Debugging Steps:**

**Check Database Connection:**
```bash
# Test database connection
psql -h localhost -U pusaka -d pusaka_prod -c "SELECT COUNT(*) FROM \"User\";"
```

**Check PM2 Logs:**
```bash
# Check application logs for NextAuth errors
pm2 logs pusaka-prod

# Look for these error patterns:
# - "Database connection failed"
# - "NextAuth Error"
# - "Prisma Client Error"
```

**Verify Environment Variables:**
```bash
# Check if environment variables are loaded correctly
pm2 show pusaka-prod
```

### **🎯 Expected Flow After Fix:**
1. ✅ User clicks "Continue with Google"
2. ✅ Redirected to Google OAuth consent
3. ✅ User authorizes application  
4. ✅ Google redirects to: `https://thepusaka.id/api/auth/callback/google`
5. ✅ NextAuth creates/updates user in database
6. ✅ Session saved to database successfully
7. ✅ User redirected to: `https://thepusaka.id/dashboard`

### **❌ Current Broken Flow:**
1. ✅ User clicks "Continue with Google"
2. ✅ Redirected to Google OAuth consent
3. ✅ User authorizes application  
4. ✅ Google redirects to: `https://thepusaka.id/api/auth/callback/google`
5. ❌ NextAuth **fails** to save session (database error)
6. ❌ User redirected back to: `https://thepusaka.id/login?error=Callback`
