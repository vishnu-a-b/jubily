# Quick Start Guide

Get the Event Registration System running locally in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- npm installed
- MongoDB Atlas account (free tier)

## Step 1: Clone and Setup MongoDB

1. Create a free MongoDB Atlas cluster at https://www.mongodb.com/cloud/atlas
2. Get your connection string
3. Whitelist your IP address (or use 0.0.0.0/0 for testing)

## Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Generate password hashes
npm run hash-password
```

This will output something like:
```
USER_1=operator1:$2b$10$ABCDEF...:user
USER_2=operator2:$2b$10$GHIJKL...:user
...
USER_7=admin:$2b$10$MNOPQR...:admin
```

Copy these lines - you'll need them in the next step.

## Step 3: Configure Backend Environment

Create `backend/.env`:

```bash
cp .env.example .env
nano .env  # or use any text editor
```

Add your configuration:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/event-registration
JWT_SECRET=generate-a-long-random-string-minimum-32-characters
JWT_EXPIRY=8h
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Paste the USER_1 through USER_7 lines from step 2
USER_1=operator1:$2b$10$HASH:user
USER_2=operator2:$2b$10$HASH:user
USER_3=operator3:$2b$10$HASH:user
USER_4=operator4:$2b$10$HASH:user
USER_5=operator5:$2b$10$HASH:user
USER_6=operator6:$2b$10$HASH:user
USER_7=admin:$2b$10$HASH:admin
```

## Step 4: Start Backend

```bash
npm run dev
```

You should see:
```
Connected to MongoDB Atlas
Server running on port 5000
Environment: development
```

## Step 5: Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
nano .env.local  # or use any text editor
```

Add:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Step 6: Start Frontend

```bash
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

## Step 7: Access the Application

Open your browser and go to: http://localhost:3000

### Default Login Credentials

The default passwords are shown in the `npm run hash-password` output. For example, if you used the script as-is:

- **Operators**: operator1 / operator1pass (use the password you set)
- **Admin**: admin / adminpass (use the password you set)

## Step 8: Test the Features

### Test Registration Flow (as Operator)

1. Login as `operator1`
2. Enter a coupon number (e.g., "COUP001")
   - Should show green checkmark (available)
3. Enter a name (e.g., "John Doe")
   - Similar names sidebar should update (empty at first)
4. Enter mobile number (10 digits)
5. Click "Register Attendee"
6. Success message should appear

### Test Duplicate Detection

1. Try to register with the same coupon number
   - Should show error: "Already registered to John Doe - XXXXXXXXXX"
2. Start typing a name similar to existing registration
   - Should see it in the sidebar

### Test Admin Features (as Admin)

1. Logout and login as `admin`
2. Click "Admin Panel"
3. View all registrations
4. Try deleting a registration
5. Switch to "Deleted Registrations" tab
6. See the deleted record with timestamp and who deleted it

## Troubleshooting

### Backend won't start

**Error: MONGODB_URI is not defined**
- Check that `.env` file exists in `backend/` folder
- Verify `MONGODB_URI` is set

**Error: JWT_SECRET is not defined**
- Add `JWT_SECRET` to `.env` file
- Must be at least 32 characters

**Error: MongoDB connection failed**
- Verify your MongoDB Atlas connection string
- Check IP whitelist in Atlas
- Ensure database user credentials are correct

### Frontend won't start

**Error: Cannot find module**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Can't login

**Check the passwords**
- The hash-password script shows the plain text passwords
- Default pattern is: `operator1pass`, `operator2pass`, etc.
- Or use the custom passwords you set when running the script

**Invalid credentials error**
- Check username spelling (case-sensitive)
- Verify USER_X lines in backend `.env` are correct
- Check backend logs for errors

### Search not working

**No similar names showing**
- Register at least one person first
- Type at least 2 characters
- Wait 300ms for debounce

**Search too slow**
- Check MongoDB Atlas connection
- Verify indexes are created (happens automatically)
- Check backend logs for errors

### General Issues

**Clear browser cache and cookies**
```
Chrome: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
```

**Restart both servers**
```bash
# Kill both terminals (Ctrl+C)
# Start backend: cd backend && npm run dev
# Start frontend: cd frontend && npm run dev
```

**Check console logs**
- Backend: Look at terminal running `npm run dev`
- Frontend: Open browser DevTools (F12) and check Console tab

## Next Steps

1. Read the full [README.md](README.md) for detailed documentation
2. Review [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
3. Customize user accounts and passwords for your event
4. Test with multiple browser tabs to simulate concurrent usage

## Testing Checklist

- [ ] Login works for operator1
- [ ] Login works for admin
- [ ] Can register a new attendee
- [ ] Coupon validation shows available/duplicate
- [ ] Name search shows similar results
- [ ] Mobile validation requires 10 digits
- [ ] Admin can view all registrations
- [ ] Admin can delete registrations
- [ ] Deleted registrations appear in deleted tab
- [ ] Operators cannot access admin panel

## Sample Test Data

Use these for testing:

**Test Registrations:**
```
Coupon: COUP001, Name: John Doe, Mobile: 9876543210
Coupon: COUP002, Name: John Smith, Mobile: 9876543211
Coupon: COUP003, Name: Jane Doe, Mobile: 9876543212
```

This will help test the similar name detection (searching "John" or "Doe").

## Development Tips

### Watch Backend Logs

The backend logs helpful information:
```
[timestamp] GET /api/registrations/search?query=john
[timestamp] POST /api/registrations - Created: COUP001
```

### Monitor MongoDB

1. Go to MongoDB Atlas dashboard
2. Click on your cluster
3. Click "Collections" to see data
4. Click "Metrics" to see performance

### Test API Directly

Use curl or Postman:

```bash
# Health check
curl http://localhost:5000/health

# Search (requires authentication - use browser cookie)
curl http://localhost:5000/api/registrations/search?query=john \
  -H "Cookie: token=YOUR_TOKEN"
```

## Need Help?

1. Check the error message carefully
2. Look at backend terminal logs
3. Check browser console (F12)
4. Verify all environment variables are set
5. Ensure MongoDB Atlas is accessible
6. Try restarting both servers

---

Happy testing! The system is now ready for development and testing.
