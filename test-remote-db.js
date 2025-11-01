#!/usr/bin/env node
/**
 * Test script for remote database connectivity
 * Use this on your production server to test the remote database connection
 */

const { Client } = require('pg');

async function testConnection() {
    console.log('🔍 Testing remote database connection...\n');
    
    const configs = [
        {
            name: 'Direct Connection',
            connectionString: 'postgresql://tpadmin:%21J%40karta01%23%2A@103.16.117.237:5432/pusaka_prod'
        },
        {
            name: 'Prisma Accelerate',
            connectionString: 'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19ZWHZjN3BMM293ckitemlCNzFhZFYiLCJhcGlfa2V5IjoiMDFLOFdZOFJLUEhTMTI2ODAxMlIyS01BUjEiLCJ0ZW5hbnRfaWQiOiIxYmJhMDM5ZGU4ZmMyNTZjNTI4ZDgxMjMyNDY2ZGMyYmNjZDBkMDRiODhmY2UyMGEzZjAyZjE1YzQxNmViM2VlIiwiaW50ZXJuYWxfc2VjcmV0IjoiZmJhMGRkN2QtNzBmOS00MWM4LTkzNWEtODhlMGJiY2Q1MTg3In0.1x0nun4QKnp5JnWXaeRUhPwhpnft0aTIVWoZDGrIk4I'
        }
    ];

    for (const config of configs) {
        console.log(`\n📡 Testing: ${config.name}`);
        console.log(`URL: ${config.connectionString.substring(0, 50)}...`);
        
        try {
            if (config.connectionString.startsWith('prisma+postgres://')) {
                console.log('⚠️  Prisma Accelerate requires special handling - skipping direct test');
                continue;
            }
            
            const client = new Client({
                connectionString: config.connectionString,
                connectionTimeoutMillis: 10000,
                query_timeout: 10000,
                statement_timeout: 10000,
            });

            console.log('⏳ Connecting...');
            await client.connect();
            
            console.log('✅ Connection successful!');
            
            // Test basic query
            const result = await client.query('SELECT version(), current_database(), current_user');
            console.log(`📊 Database: ${result.rows[0].current_database}`);
            console.log(`👤 User: ${result.rows[0].current_user}`);
            console.log(`🗄️  Version: ${result.rows[0].version.split(' ').slice(0, 2).join(' ')}`);
            
            // Test table access
            try {
                const tableResult = await client.query(`
                    SELECT tablename 
                    FROM pg_tables 
                    WHERE schemaname = 'public' 
                    ORDER BY tablename
                `);
                console.log(`📋 Tables found: ${tableResult.rows.length}`);
                tableResult.rows.forEach(row => {
                    console.log(`   - ${row.tablename}`);
                });
            } catch (tableErr) {
                console.log(`⚠️  Table access error: ${tableErr.message}`);
            }
            
            await client.end();
            console.log('✅ Test completed successfully!');
            
        } catch (err) {
            console.log(`❌ Connection failed: ${err.message}`);
            if (err.code) {
                console.log(`   Error Code: ${err.code}`);
            }
            
            // Provide specific troubleshooting based on error
            if (err.message.includes('timeout') || err.code === 'ETIMEDOUT') {
                console.log(`💡 Suggestion: Database server might not be accepting connections`);
                console.log(`   - Check PostgreSQL configuration (postgresql.conf, pg_hba.conf)`);
                console.log(`   - Verify firewall allows connections from your server IP`);
            } else if (err.message.includes('authentication') || err.code === '28P01') {
                console.log(`💡 Suggestion: Authentication failed`);
                console.log(`   - Verify username/password are correct`);
                console.log(`   - Check if user has proper permissions`);
            } else if (err.message.includes('database') && err.message.includes('does not exist')) {
                console.log(`💡 Suggestion: Database 'pusaka_prod' doesn't exist`);
                console.log(`   - Create the database first`);
            } else if (err.code === 'ENOTFOUND') {
                console.log(`💡 Suggestion: Hostname resolution failed`);
                console.log(`   - Check if 103.16.117.237 is the correct IP`);
            }
        }
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Run this script on your PRODUCTION server where the app is hosted');
    console.log('2. If connection fails, contact your database administrator');
    console.log('3. If connection succeeds, update your production .env and restart PM2');
    console.log('\n📝 Production .env should contain:');
    console.log('DATABASE_URL="postgresql://tpadmin:%21J%40karta01%23%2A@103.16.117.237:5432/pusaka_prod"');
    console.log('POSTGRES_URL="${DATABASE_URL}"');
    console.log('# Choose ONE of the following:');
    console.log('PRISMA_DATABASE_URL="${DATABASE_URL}"  # For direct connection');
    console.log('# OR');
    console.log('PRISMA_DATABASE_URL="prisma+postgres://accelerate..."  # For Prisma Accelerate');
}

testConnection().catch(console.error);
