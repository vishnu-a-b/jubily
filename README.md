# Event Registration System

A complete event registration system designed to handle 3000 attendees across 5 concurrent registration stations. Features duplicate prevention through coupon number validation and similar name detection.

## Features

- **Real-time Coupon Validation**: Instantly checks if a coupon number is already registered
- **Duplicate Detection**: Shows similar names as operators type to prevent duplicate registrations
- **Soft Delete**: Admin can delete registrations while preserving audit trail
- **Role-Based Access**: 6 operators + 1 admin with different permissions
- **Performance Optimized**: Caching, rate limiting, and database indexing for smooth operation
- **Secure**: JWT authentication, bcrypt password hashing, input validation

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose)
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Database**: MongoDB Atlas (Free Tier - 512MB)
- **Authentication**: JWT with httpOnly cookies

## Project Structure

```
event-registration/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth, rate limiting
│   │   ├── utils/          # Helper functions
│   │   └── server.ts       # Entry point
│   └── package.json
│
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # Pages (Next.js 14 App Router)
│   │   ├── components/    # React components
│   │   └── lib/           # API client, utilities
│   └── package.json
│
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (free tier works)
- Git

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate password hashes:
   ```bash
   npm run hash-password
   ```
   This will output hashed passwords for the default users. Copy these to your `.env` file.

4. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

5. Edit `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event-registration
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
   JWT_EXPIRY=8h
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000

   # Paste the generated user credentials from step 3
   USER_1=operator1:$2b$10$HASH:user
   USER_2=operator2:$2b$10$HASH:user
   USER_3=operator3:$2b$10$HASH:user
   USER_4=operator4:$2b$10$HASH:user
   USER_5=operator5:$2b$10$HASH:user
   USER_6=operator6:$2b$10$HASH:user
   USER_7=admin:$2b$10$HASH:admin
   ```

6. Start development server:
   ```bash
   npm run dev
   ```
   Server will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```bash
   cp .env.local.example .env.local
   ```

4. Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

5. Start development server:
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:3000

### MongoDB Atlas Setup

1. Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas

2. Create a new cluster (free M0 tier)

3. Create a database user with read/write permissions

4. Whitelist your IP address (or use 0.0.0.0/0 for testing)

5. Get your connection string and add it to backend `.env`

6. The application will automatically create indexes on first connection

## Default Users

After running `npm run hash-password`, you'll get credentials for:

- **Operators** (role: user): operator1, operator2, operator3, operator4, operator5, operator6
- **Admin** (role: admin): admin

Default passwords are shown in the hash generator output. **Change these before production!**

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check authentication status

### Registrations
- `GET /api/registrations/check-coupon/:couponNo` - Check if coupon is available
- `GET /api/registrations/search?query=` - Search similar names (debounced, cached)
- `POST /api/registrations` - Create new registration
- `GET /api/registrations` - Get all active registrations (paginated)
- `DELETE /api/registrations/:couponNo` - Soft delete (admin only)
- `GET /api/registrations/deleted/all` - Get deleted registrations (admin only)

## Features Detail

### Coupon Number Validation
- Coupon number is the **primary identifier** (like a ticket number)
- Real-time validation as operator types
- Shows green checkmark if available
- Shows error with existing registration details if duplicate
- Alphanumeric format supported

### Duplicate Detection System
- **Debounced search** (300ms after typing stops)
- Shows up to 10 similar names in sidebar
- Displays: Name, Mobile, Coupon Number
- Helps operators manually verify duplicates
- Results are cached for 2 minutes

### Admin Capabilities
- View all registrations (paginated)
- Search and filter registrations
- Soft delete registrations (preserves data)
- View deleted registrations with audit trail
- Track who deleted and when

### Security Features
- JWT authentication with httpOnly cookies
- Bcrypt password hashing (cost factor: 10)
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS configured for frontend domain
- Helmet.js security headers

### Performance Optimizations
- MongoDB connection pooling (5-20 connections)
- Database indexes on frequently queried fields
- In-memory caching for search results (2 min TTL)
- Rate limiting (3 searches/sec per client)
- Debounced searches (300ms)
- Lean queries for read operations

## Production Deployment

### Backend (Hostinger)

1. Build the application:
   ```bash
   npm run build
   ```

2. Set environment variables in Hostinger panel

3. Start the server:
   ```bash
   npm start
   ```

### Frontend (Vercel/Netlify)

1. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com
   ```

2. Deploy:
   ```bash
   npm run build
   ```

### MongoDB Atlas Production

1. Update IP whitelist with production server IPs
2. Use strong database credentials
3. Enable monitoring and alerts
4. Regular backups (Atlas provides automatic backups)

## Testing Checklist

- [ ] Coupon uniqueness enforced (try registering same coupon twice)
- [ ] Name search shows similar results
- [ ] Mobile number validation (exactly 10 digits)
- [ ] Cannot submit without all required fields
- [ ] Login works for all 6 operators + admin
- [ ] Admin can delete registrations
- [ ] Regular users cannot access admin routes
- [ ] Deleted registrations don't appear in searches
- [ ] Soft delete preserves data in database
- [ ] 5 concurrent registrations work smoothly

## Expected Performance

### Load Analysis
- **Target**: 3000 registrations in 3 hours
- **Rate**: ~17 registrations/minute, ~0.3/second
- **Per PC**: 1 registration every 18 seconds
- **Load Level**: Very light for infrastructure

### Latency Targets
- Coupon validation: < 50ms
- Name search: 150-250ms
- Registration insert: 100-150ms
- Total per registration: 250-400ms

## Troubleshooting

### Backend won't start
- Check MongoDB connection string in `.env`
- Verify JWT_SECRET is set (min 32 characters)
- Ensure all USER_X variables are properly formatted
- Check if port 5000 is already in use

### Frontend won't connect to backend
- Verify NEXT_PUBLIC_API_URL in `.env.local`
- Check if backend is running on the specified port
- Look for CORS errors in browser console
- Ensure cookies are enabled in browser

### Login fails
- Verify password hashes in `.env` match generated hashes
- Check username spelling (case-sensitive)
- Look at backend logs for error details
- Ensure JWT_SECRET is consistent

### Slow search results
- Check MongoDB Atlas cluster status
- Verify indexes are created (check MongoDB Atlas UI)
- Monitor rate limiting (may be too restrictive)
- Check network latency to Atlas

## License

MIT

## Support

For issues and questions, please check:
1. This README
2. `.env.example` files for configuration reference
3. Console logs in both frontend and backend
4. MongoDB Atlas monitoring dashboard

## Security Notes

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Change default passwords** before production deployment
3. **Use strong JWT_SECRET** (minimum 32 random characters)
4. **Whitelist specific IPs** in MongoDB Atlas for production
5. **Enable HTTPS** in production (required for secure cookies)
6. **Regular security updates** - Keep dependencies updated

## Contributing

This is a production system for a specific event. Modifications should be:
1. Thoroughly tested
2. Documented
3. Backward compatible with existing data
4. Reviewed before deployment
