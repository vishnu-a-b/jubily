# Login Credentials

## Default User Accounts

All accounts are ready to use with the following credentials:

### Operators (Regular Users)
Can register attendees and search for duplicates.

| Username   | Password      | Role |
|------------|---------------|------|
| operator1  | operator1pass | user |
| operator2  | operator2pass | user |
| operator3  | operator3pass | user |
| operator4  | operator4pass | user |
| operator5  | operator5pass | user |
| operator6  | operator6pass | user |

### Administrator
Has all operator permissions plus admin panel access.

| Username | Password  | Role  |
|----------|-----------|-------|
| admin    | adminpass | admin |

## Admin Capabilities

The admin account can:
- Register attendees (like operators)
- View all registrations (paginated)
- Search and filter registrations
- Delete registrations (soft delete - preserves audit trail)
- View deleted registrations with timestamps
- See who deleted each registration

## Security Notes

**IMPORTANT**: These are default passwords for development/testing only!

Before production deployment:
1. Change all passwords to strong, unique passwords
2. Store new passwords securely
3. Update the USER_X lines in backend/.env with new hashes
4. Run `npm run hash-password` in backend to generate new hashes
5. Never commit the .env file with real passwords

## Quick Test

To verify the system is working:

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open browser: http://localhost:3000
4. Login as: `operator1` / `operator1pass`
5. Try registering an attendee

## MongoDB Configuration

Your MongoDB Atlas database is configured with:
- **Database**: jubily
- **User**: vishnuab1207
- **Cluster**: cluster0.xgensfz.mongodb.net
- **Connection**: Already configured in backend/.env

The application will automatically create the necessary indexes on first connection.

## Troubleshooting

**Can't login?**
- Ensure backend is running on port 5000
- Check backend/.env has all USER_X variables
- Verify MongoDB connection in backend logs
- Try clearing browser cookies

**Admin panel not accessible?**
- Login as `admin` (not operator)
- Check browser console for errors
- Verify JWT token is being set (check cookies in DevTools)

---

**Created**: December 2024
**Last Updated**: December 2024
**Status**: Ready for Testing
