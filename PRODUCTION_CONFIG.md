# Production Environment Configuration

## Current Issues Found:

### 1. Database Configuration Conflict
Your production .env shows:
- DATABASE_URL="postgresql://tpadmin:...@103.16.117.237:5432/pusaka_prod"
- PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/..."

**Problem:** You have two different database URLs which can cause conflicts.

### 2. Recommended Production .env:

```env
# Google OAuth
GOOGLE_CLIENT_ID="2386453923-6ks8kumpi3ig17ag424i1ud85cdd542h.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"

# NextAuth
NEXTAUTH_SECRET="9qxKMh8d1UB4+VjjLs3eOyHsOUzZDQi4x+gW1sLMH5Q="
NEXTAUTH_URL="https://thepusaka.id"

# Database - Use your remote PostgreSQL
DATABASE_URL="postgresql://tpadmin:%21J%40karta01%23%2A@103.16.117.237:5432/pusaka_prod"
POSTGRES_URL="${DATABASE_URL}"
PRISMA_DATABASE_URL="${DATABASE_URL}"

# Gmail SMTP
GMAIL_USER=tpadmin@thepusaka.id
GMAIL_APP_PASSWORD=wzfvewfvdlwgefik
```

### 3. Google OAuth Callback URL
Ensure Google Console has this exact URL:
https://thepusaka.id/api/auth/callback/google
```
