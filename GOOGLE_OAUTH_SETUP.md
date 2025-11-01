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

## 5. 📝 Production Deployment with Logging

### **Step 1: Update Production Environment Variables**
```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID="2386453923-6ks8kumpi3ig17ag424i1ud85cdd542h.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"

# NextAuth Configuration
NEXTAUTH_SECRET="9qxKMh8d1UB4+VjjLs3eOyHsOUzZDQi4x+gW1sLMH5Q="
NEXTAUTH_URL="https://thepusaka.id"

# Database Configuration (RECOMMENDED: Use Prisma Accelerate)
DATABASE_URL="postgresql://tpadmin:%21J%40karta01%23%2A@103.16.117.237:5432/pusaka_prod"
POSTGRES_URL="${DATABASE_URL}"
PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19ZWHZjN3BMM293ckitemlCNzFhZFYiLCJhcGlfa2V5IjoiMDFLOFdZOFJLUEhTMTI2ODAxMlIyS01BUjEiLCJ0ZW5hbnRfaWQiOiIxYmJhMDM5ZGU4ZmMyNTZjNTI4ZDgxMjMyNDY2ZGMyYmNjZDBkMDRiODhmY2UyMGEzZjAyZjE1YzQxNmViM2VlIiwiaW50ZXJuYWxfc2VjcmV0IjoiZmJhMGRkN2QtNzBmOS00MWM4LTkzNWEtODhlMGJiY2Q1MTg3In0.1x0nun4QKnp5JnWXaeRUhPwhpnft0aTIVWoZDGrIk4I"

# Gmail SMTP Configuration
GMAIL_USER=tpadmin@thepusaka.id
GMAIL_APP_PASSWORD=wzfvewfvdlwgefik
```

### **Step 2: Deploy and Monitor Logs**
```bash
# On your production server:
cd /path/to/your/app

# Update environment variables in .env
# Then rebuild and restart
npm run build
pm2 restart pusaka-prod

# Monitor logs in real-time to debug authentication
pm2 logs pusaka-prod --lines 100
```

### **Step 3: Debug Login Flow with Enhanced Logging**

Now your application has comprehensive logging for the entire authentication process:

**📱 Frontend Logging:**
- Login form submission attempts
- OTP verification steps  
- Google OAuth initialization
- Session establishment

**🚀 API Logging:**
- `/api/auth/send-otp` - Password verification, OTP generation, email sending
- `/api/auth/verify-otp` - OTP validation, user verification
- NextAuth callbacks - JWT creation, session management, redirects

**🔐 Dashboard Logging:**
- Authentication status checks
- Session validation
- Redirect behavior

### **Step 4: Test Authentication Flow**

1. **Open Browser Developer Console** (F12)
2. **Visit**: https://thepusaka.id/login  
3. **Try Login** with your credentials
4. **Monitor both**:
   - Browser console for frontend logs
   - `pm2 logs pusaka-prod` for backend logs

### **🔍 Expected Log Flow for Successful Login:**

**Frontend Console:**
```
📧 Login attempt started for email: your@email.com
🔐 Sending OTP request to /api/auth/send-otp
📡 OTP API response status: 200
📊 OTP API response data: {success: true}
📱 Regular OTP mode - showing verification
```

**Backend Logs:**
```
🚀 Send OTP API called - email: your@email.com type: login
🔍 Looking up user in database
👤 User found: true
🔐 Verifying password
✅ Password valid: true
🎲 Generating OTP
📧 Sending OTP email
📤 Email send result: {success: true}
✅ OTP sent successfully
```

**After OTP Entry:**
```
📱 OTP verification attempt for email: your@email.com type: login
🚀 Sending OTP verification to /api/auth/verify-otp
✅ OTP verification successful
🔐 Attempting credentials sign-in
🎫 SignIn result: {ok: true}
✅ SignIn successful, waiting for session establishment
```

### **❌ Common Error Patterns to Look For:**

**Database Connection Issues:**
```
❌ Database connection failed: P1001
💥 Send OTP error: Can't reach database server
```

**Invalid OTP/Password:**
```
❌ Invalid password
❌ OTP code mismatch
```

**Session/Redirect Issues:**
```
❌ User is unauthenticated, redirecting to login
❌ No session found, redirecting to login
```

## 6. 🖥️ How to Check Node.js Logs on Your VPS (dopiolatte)

### **Step 1: Connect to Your VPS**
```bash
# SSH into your VPS dopiolatte
ssh root@dopiolatte
# OR if using IP: ssh root@103.16.117.237
```

### **Step 2: Navigate to Your Application Directory**
```bash
# Go to your application folder (based on your current path)
cd /home/thepusaka/pusaka-newsletter-prod

# Verify you're in the right directory
pwd
ls -la
```

### **🚀 IMMEDIATE COMMANDS FOR YOUR VPS:**

**Check Current PM2 Status:**
```bash
# See all PM2 processes
pm2 list

# Check specific app status
pm2 show pusaka-prod

# Check if app is running
pm2 status
```

### **Step 3: View Node.js Application Logs in Real-Time**

**🔥 MOST IMPORTANT COMMANDS FOR DEBUGGING:**

**Real-time Log Monitoring (Start with this!):**
```bash
# View logs in real-time - BEST for debugging login issues
pm2 logs pusaka-prod

# View more history (last 100 lines)
pm2 logs pusaka-prod --lines 100

# View logs with timestamps
pm2 logs pusaka-prod --timestamp

# View only error logs
pm2 logs pusaka-prod --err
```

**Restart PM2 with New Environment Variables:**
```bash
# CRITICAL: Your .env is now updated, restart PM2 to apply changes
pm2 restart pusaka-prod

# Force reload environment variables
pm2 restart pusaka-prod --update-env

# Delete and recreate process (if restart doesn't work)
pm2 delete pusaka-prod
pm2 start npm --name "pusaka-prod" -- start

# Monitor restart process
pm2 logs pusaka-prod --lines 20
```

**Test Database Connection After Restart:**
```bash
# Quick database test
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
```

**View Recent Logs:**
```bash
# Show last 50 lines of logs
pm2 logs pusaka-prod --lines 50

# Show logs from specific time
pm2 logs pusaka-prod --timestamp

# View logs without colors (easier to read)
pm2 logs pusaka-prod --nostream
```

**Check PM2 Process Status:**
```bash
# List all PM2 processes
pm2 list

# Show detailed info about your app
pm2 show pusaka-prod

# Check memory and CPU usage
pm2 monit
```

### **Step 6: System-Level Logs (if needed)**

**View System Logs:**
```bash
# View system messages
sudo tail -f /var/log/syslog

# View authentication logs
sudo tail -f /var/log/auth.log

# View kernel messages
dmesg | tail -20
```

**Nginx Logs (if using Nginx reverse proxy):**
```bash
# View Nginx access logs
sudo tail -f /var/log/nginx/access.log

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# View specific site logs (if configured)
sudo tail -f /var/log/nginx/thepusaka.id.access.log
sudo tail -f /var/log/nginx/thepusaka.id.error.log
```

**Network Connectivity Tests:**
```bash
# Test if Prisma Accelerate is reachable
curl -I https://accelerate.prisma-data.net/

# Test DNS resolution
nslookup accelerate.prisma-data.net

# Test general internet connectivity
ping -c 3 google.com
```

### **Step 4: Debug Authentication Issues in Real-Time**

**🎯 COMPLETE DEBUGGING WORKFLOW:**

**1. Start Real-time Log Monitoring:**
```bash
# Open log monitoring in one terminal
pm2 logs pusaka-prod --lines 50 --timestamp

# Keep this terminal open and visible
```

**2. Test Google OAuth Login:**
- Open browser: https://thepusaka.id/login
- Click "Continue with Google"  
- Watch logs appear in real-time
- Look for database connection success/failure

**3. Check for Common Error Patterns:**
```bash
# Search for database errors in logs
pm2 logs pusaka-prod --lines 200 | grep -i "database\|prisma\|connection"

# Search for authentication errors
pm2 logs pusaka-prod --lines 200 | grep -i "auth\|login\|oauth\|callback"

# Search for general errors
pm2 logs pusaka-prod --lines 200 | grep -i "error\|fail\|❌"

# Search for success patterns
pm2 logs pusaka-prod --lines 200 | grep -i "success\|✅\|connected"
```

**4. Environment Variable Verification:**
```bash
# Check if environment variables are loaded
pm2 show pusaka-prod | grep -A 20 "env:"

# Check database URL specifically
echo $DATABASE_URL
echo $PRISMA_DATABASE_URL

# Print all environment variables
printenv | grep -E "(DATABASE|NEXTAUTH|GOOGLE|GMAIL)"
```

### **Step 5: Advanced Node.js Log Analysis**

**Save and Analyze Logs:**
```bash
# Save current logs to file for detailed analysis
pm2 logs pusaka-prod --lines 500 > /tmp/nodejs_logs.txt

# View the saved logs
cat /tmp/nodejs_logs.txt

# Search within saved logs for specific issues
grep -i "error" /tmp/nodejs_logs.txt
grep -i "prisma" /tmp/nodejs_logs.txt
grep -i "nextauth" /tmp/nodejs_logs.txt
```

**Check Node.js Process Details:**
```bash
# Check Node.js version
node --version

# Check npm version  
npm --version

# Check if port 3000 is in use
netstat -tlnp | grep :3000

# Check memory and CPU usage
htop

# Check disk space
df -h
```

**Manual Node.js Testing (if PM2 fails):**
```bash
# Stop PM2 temporarily
pm2 stop pusaka-prod

# Run Node.js manually to see direct output
cd /home/thepusaka/pusaka-newsletter-prod
npm start

# OR try development mode
npm run dev

# When done, restart PM2
pm2 start pusaka-prod
```

### **🚨 URGENT: Next Steps for Your VPS (dopiolatte)**

**✅ GREAT NEWS: Prisma Accelerate is working!**
**❌ ISSUE: Database tables don't exist yet**

Your error shows: `The table public.User does not exist in the current database.`
This means Prisma Accelerate connection works, but we need to create the database tables.

**IMMEDIATE FIX - Run Database Migration:**

**1. Push your Prisma schema to create all tables:**
```bash
cd /home/thepusaka/pusaka-newsletter-prod

# Create all database tables (User, Account, Session, etc.)
npx prisma db push

# This will create all the tables needed for NextAuth
```

**2. Test database connection after migration:**
```bash
# Test Prisma connection after creating tables
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
console.log('Testing after migration...');
prisma.user.count().then(count => {
  console.log('✅ Connected! User count:', count);
  process.exit(0);
}).catch(err => {
  console.error('❌ Still failed:', err.message);
  process.exit(1);
});
"
```

**3. Restart PM2 after successful migration:**
```bash
# Restart PM2 to reload with working database
pm2 restart pusaka-prod

# Monitor logs to see if database connection works
pm2 logs pusaka-prod --lines 20 --nostream
```

**4. Create an admin user for testing:**
```bash
# Create a test user to login with
node scripts/create-admin.ts
```

**5. Test Google OAuth login:**
- Visit: https://thepusaka.id/login
- Click "Continue with Google"
- Should now work without callback errors!

### **Step 8: Emergency Debugging Commands**

**If App Won't Start:**
```bash
# Try starting the app manually to see errors
cd /path/to/your/app
npm start

# Check Node.js version
node --version

# Check if dependencies are installed
npm list --depth=0
```

**If Database Issues:**
```bash
# Test database connection directly
psql -h 103.16.117.237 -U tpadmin -d pusaka_prod -c "SELECT 1;"

# Check if database environment variables are set
echo $DATABASE_URL
printenv | grep -i database
```

### **🎯 Quick Commands for Login Issues:**

**1. Start monitoring logs before testing:**
```bash
pm2 logs pusaka-prod --lines 50
```

**2. In another terminal, test your login:**
- Go to https://thepusaka.id/login
- Try to login
- Watch the logs in real-time

**3. Look for these specific patterns:**
```bash
# Success patterns:
grep "✅\|successful\|Login attempt" /tmp/app_logs.txt

# Error patterns:
grep "❌\|error\|failed\|Error" /tmp/app_logs.txt

# Database patterns:
grep "Database\|Prisma\|connection" /tmp/app_logs.txt
```

### **📱 Example Debug Session:**

```bash
# 1. SSH to your VPS
ssh root@your-vps-ip

# 2. Navigate to app directory
cd /var/www/pusaka-newsletter-prod

# 3. Start monitoring logs
pm2 logs pusaka-prod --timestamp

# 4. In browser: try to login at https://thepusaka.id/login
# 5. Watch logs appear in real-time
# 6. Look for error messages or failed steps

# 7. If you see database errors:
psql -h 103.16.117.237 -U tpadmin -d pusaka_prod -c "\l"

# 8. If you see authentication errors:
pm2 restart pusaka-prod
pm2 logs pusaka-prod --lines 20
```

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
