# CORS Configuration Guide

## Current Setup

The backend is now configured to **allow connections from anywhere** for development and testing.

### Development Mode (Current)

✅ **Allows all origins** - Any frontend can connect
✅ **Credentials enabled** - Cookies work across domains
✅ **All methods allowed** - GET, POST, PUT, DELETE, OPTIONS
✅ **No restrictions** - Perfect for development and testing

### What This Means

You can now access the backend API from:

1. **Any localhost port**
   - http://localhost:3000 (your Next.js app)
   - http://localhost:3001 (another instance)
   - http://localhost:8080 (testing tool)

2. **Any IP address**
   - http://192.168.1.100:3000 (local network)
   - http://10.0.0.50:3000 (other devices)

3. **Any domain**
   - https://mydomain.com
   - https://test.mydomain.com
   - Any Vercel/Netlify deployment URL

4. **API testing tools**
   - Postman
   - Thunder Client
   - curl commands
   - Insomnia

## Testing from Different Sources

### From Your Local Network

**Access from phone/tablet:**
1. Find your computer's IP address:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. Start the backend on port 5001 (already configured)

3. Access from phone browser:
   ```
   http://YOUR_IP:5001/health
   ```

4. Update frontend .env.local on phone's browser:
   ```
   http://YOUR_IP:3000
   ```

### From Postman/Thunder Client

**Test API endpoints:**

```bash
# Health check
GET http://localhost:5001/health

# Login
POST http://localhost:5001/api/auth/login
Content-Type: application/json

{
  "username": "operator1",
  "password": "operator1pass"
}

# Search (requires login cookie)
GET http://localhost:5001/api/registrations/search?query=John
```

### From Mobile App or Other Frontend

Simply point to your backend URL:
```javascript
const API_URL = 'http://YOUR_IP:5001';
// or
const API_URL = 'https://your-backend-domain.com';
```

## Production Security

When deploying to production, you should restrict CORS to specific domains:

### Method 1: Environment Variable (Recommended)

Update your production `.env`:

```env
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://app.yourdomain.com
```

The backend will automatically:
- ✅ Allow only specified domains
- ✅ Block all other origins
- ✅ Still allow credentials (cookies)

### Method 2: Manual Configuration

Edit `backend/src/server.ts` if you need more control:

```typescript
const corsOptions = {
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'https://app.yourdomain.com'
  ],
  credentials: true
};
```

## CORS Headers Explained

The current configuration sets:

```
Access-Control-Allow-Origin: * (or specific origin)
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Cookie
Access-Control-Expose-Headers: Set-Cookie
```

### What Each Header Does

| Header | Purpose |
|--------|---------|
| `Allow-Origin` | Which domains can make requests |
| `Allow-Credentials` | Allow cookies and auth headers |
| `Allow-Methods` | Which HTTP methods are permitted |
| `Allow-Headers` | Which request headers are allowed |
| `Expose-Headers` | Which response headers frontend can read |

## Common Use Cases

### 1. Multiple Frontends

If you have multiple frontends (web app, admin panel, mobile):

```env
# Production
ALLOWED_ORIGINS=https://app.com,https://admin.app.com,https://mobile.app.com
```

### 2. Subdomain Wildcard

For subdomains, you need custom logic:

```typescript
origin: function (origin, callback) {
  if (!origin || origin.endsWith('.yourdomain.com')) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed'));
  }
}
```

### 3. Local + Production

Allow localhost for development and production domain:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://yourdomain.com
```

## Troubleshooting

### Issue: CORS error in browser

**Error:**
```
Access to fetch at 'http://localhost:5001' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Solution:**
1. Check backend is running
2. Verify `.env` has correct settings
3. Restart backend server
4. Clear browser cache
5. Check browser console for specific error

### Issue: Cookies not working

**Error:**
```
Cookies not being set or sent
```

**Solution:**
1. Ensure `credentials: true` in CORS config
2. Frontend must use `withCredentials: true` in axios
3. Check `SameSite` cookie attribute
4. Use HTTPS in production (required for secure cookies)

### Issue: Preflight requests failing

**Error:**
```
OPTIONS request fails with 403 or 404
```

**Solution:**
1. Ensure OPTIONS method is allowed
2. Check if API route exists
3. Verify CORS middleware is before routes
4. Check for middleware conflicts

## Testing CORS Configuration

### Test 1: Browser Console

```javascript
// Open browser console on any page
fetch('http://localhost:5001/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

Should return: `{status: 'ok', timestamp: '...'}`

### Test 2: With Credentials

```javascript
fetch('http://localhost:5001/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  credentials: 'include',
  body: JSON.stringify({
    username: 'operator1',
    password: 'operator1pass'
  })
})
.then(r => r.json())
.then(console.log);
```

Should set cookie and return user data.

### Test 3: From Different Domain

1. Open https://example.com
2. Open browser console
3. Run same fetch commands
4. Should work if CORS is open (development)
5. Should fail if CORS is restricted (production)

## Security Recommendations

### Development
- ✅ Allow all origins (current setup)
- ✅ Use HTTP (localhost only)
- ✅ Expose detailed errors

### Staging
- ⚠️ Restrict to staging domain
- ⚠️ Use HTTPS
- ⚠️ Limited error details

### Production
- ❌ Never allow all origins
- ✅ Restrict to specific domains only
- ✅ Always use HTTPS
- ✅ Hide error details
- ✅ Monitor CORS violations
- ✅ Log rejected requests

## Environment-Specific Setup

### Development (.env)
```env
NODE_ENV=development
# CORS is open to all origins
```

### Production (.env)
```env
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Quick Reference

| Scenario | Configuration |
|----------|---------------|
| Local development | Allow all (current) |
| Testing with mobile | Allow all (current) |
| Staging server | Restrict to staging domain |
| Production | Restrict to production domains only |
| API testing tools | Allow all (use API key instead) |

## Advanced: Dynamic CORS

For complex scenarios, you can implement dynamic CORS based on request headers, database lookups, or API keys.

Example:
```typescript
origin: async function (origin, callback) {
  // Check if origin is in database of allowed domains
  const isAllowed = await checkOriginInDatabase(origin);
  callback(null, isAllowed);
}
```

---

**Current Status**: ✅ CORS enabled for all origins (development mode)
**Recommended for Production**: ⚠️ Restrict to specific domains only
**Documentation Updated**: December 2024
