# Neon.tech PostgreSQL Setup Guide

## 1. Create Neon Account
1. Go to [https://neon.tech](https://neon.tech)
2. Sign up with GitHub or email
3. Verify your email if required

## 2. Create New Project
1. Click "Create Project"
2. **Project Name:** `pusaka-newsletter`
3. **Database Name:** `pusaka_prod`
4. **Region:** Choose closest to your location
   - US East (N. Virginia) - `us-east-1`
   - EU West (Ireland) - `eu-west-1` 
   - Asia Pacific (Singapore) - `ap-southeast-1`

## 3. Get Connection String
After creating the project, you'll see:
- **Connection String:** Copy the "Pooled Connection" string
- **Direct Connection:** Also copy this for backup

Example format:
```
postgresql://username:password@ep-cool-database-123456.us-east-1.aws.neon.tech/pusaka_prod?sslmode=require
```

## 4. Update .env File
Replace the DATABASE_URL in your `.env` file:

```env
# Neon.tech PostgreSQL Database (Serverless)
DATABASE_URL="postgresql://your-username:your-password@ep-your-endpoint.region.aws.neon.tech/pusaka_prod?sslmode=require"
POSTGRES_URL="${DATABASE_URL}"
PRISMA_DATABASE_URL="${DATABASE_URL}"
```

## 5. Test Connection
Run these commands to test and setup your database:

```bash
# Test connection
npx prisma db push

# Generate Prisma client
npx prisma generate

# Create initial super admin user
npm run create-admin
```

## 6. Benefits of Neon
- ✅ **Serverless:** Scales to zero when not in use
- ✅ **Fast setup:** Ready in seconds
- ✅ **Free tier:** Generous limits for development
- ✅ **Branching:** Create database branches like Git
- ✅ **Auto-scaling:** Handles traffic spikes automatically
- ✅ **Global:** Multiple regions available

## 7. Free Tier Limits
- **Storage:** 512 MB
- **Compute:** 100 hours/month
- **Databases:** 10 databases
- **Branches:** 10 branches per database

Perfect for development and small production apps!

## 8. After Setup
Once you have your Neon database working:

1. **Remove temporary auth code** - We can restore full database authentication
2. **Import existing data** - If you have a backup from your old database
3. **Test all features** - User management, articles, etc.
4. **Deploy to production** - Use the same Neon connection string

## Need Help?
- [Neon Documentation](https://neon.tech/docs)
- [Prisma with Neon Guide](https://neon.tech/docs/guides/prisma)
