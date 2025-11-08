#!/bin/bash

echo "🔍 OAuth Network Connectivity Diagnostics"
echo "========================================="
echo ""

echo "📅 Timestamp: $(date)"
echo ""

echo "🌐 Testing DNS Resolution:"
echo "------------------------"
nslookup oauth2.googleapis.com
nslookup accounts.google.com
echo ""

echo "🔌 Testing Network Connectivity:"
echo "--------------------------------"
ping -c 3 oauth2.googleapis.com
ping -c 3 accounts.google.com
echo ""

echo "🚪 Testing HTTP/HTTPS Connectivity:"
echo "-----------------------------------"
curl -I -m 10 https://oauth2.googleapis.com/.well-known/openid_configuration
curl -I -m 10 https://accounts.google.com
echo ""

echo "🔍 Testing from Node.js (same as app):"
echo "--------------------------------------"
node -e "
const https = require('https');
const url = 'https://oauth2.googleapis.com/.well-known/openid_configuration';
console.log('Testing:', url);
https.get(url, {timeout: 10000}, (res) => {
  console.log('✅ Success:', res.statusCode, res.statusMessage);
}).on('error', (err) => {
  console.log('❌ Error:', err.message);
}).on('timeout', () => {
  console.log('⏰ Timeout: Request timed out');
});
"
echo ""

echo "🔧 Server Network Configuration:"
echo "--------------------------------"
echo "Default Gateway:"
ip route | grep default
echo ""
echo "DNS Configuration:"
cat /etc/resolv.conf
echo ""
echo "Network Interfaces:"
ip addr show | grep -E "(inet|UP|DOWN)"
echo ""

echo "🔍 Firewall Status:"
echo "-------------------"
if command -v ufw &> /dev/null; then
    ufw status
elif command -v iptables &> /dev/null; then
    iptables -L | head -20
else
    echo "No common firewall tools found"
fi
echo ""

echo "✅ Diagnostic completed!"
