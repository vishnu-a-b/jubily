# Deployment Guide

This guide walks you through deploying the Event Registration System to production.

## Pre-Deployment Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Production domain/subdomain registered
- [ ] SSL certificate ready (or using platform-provided SSL)
- [ ] Strong passwords generated for all users
- [ ] JWT_SECRET generated (minimum 32 random characters)
- [ ] All environment variables documented
- [ ] Database backups configured
- [ ] Monitoring and alerting set up

## MongoDB Atlas Setup

### 1. Create Production Cluster

1. Log in to MongoDB Atlas
2. Create a new cluster (M0 Free Tier or higher for production)
3. Choose a region close to your hosting location
4. Wait for cluster to deploy (5-10 minutes)

### 2. Configure Database Access

1. Go to "Database Access" in Atlas
2. Create a new database user:
   - Username: `event-registration-prod`
   - Password: Generate a strong password (save it securely)
   - Database User Privileges: "Read and write to any database"

### 3. Configure Network Access

1. Go to "Network Access" in Atlas
2. Add IP addresses:
   - Your Hostinger server IP
   - Your office/home IP (for admin access)
   - Or use `0.0.0.0/0` for testing (NOT recommended for production)

### 4. Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password
5. Add database name: `event-registration`

Example:
```
mongodb+srv://event-registration-prod:PASSWORD@cluster0.xxxxx.mongodb.net/event-registration?retryWrites=true&w=majority
```

## Backend Deployment (Hostinger)

### 1. Prepare Application

```bash
cd backend

# Install dependencies
npm install --production

# Build TypeScript
npm run build
```

### 2. Upload to Hostinger

#### Option A: Using Git (Recommended)

1. Initialize git repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Push to your git hosting (GitHub, GitLab, etc.)

3. SSH into Hostinger and clone:
   ```bash
   ssh user@your-hostinger-server.com
   cd /path/to/web/root
   git clone https://your-repo-url.git backend
   cd backend
   npm install --production
   ```

#### Option B: Using FTP/SFTP

1. Use FileZilla or similar to upload the `backend` folder
2. Upload `package.json`, `package-lock.json`, and `dist/` folder
3. SSH into server and run `npm install --production`

### 3. Set Environment Variables

Create `.env` file on the server:

```bash
nano .env
```

Add the following (replace with your actual values):

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/event-registration
JWT_SECRET=your-very-long-random-secret-key-minimum-32-characters-abc123xyz
JWT_EXPIRY=8h
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# Generated user credentials (run npm run hash-password locally)
USER_1=operator1:$2b$10$HASH:user
USER_2=operator2:$2b$10$HASH:user
USER_3=operator3:$2b$10$HASH:user
USER_4=operator4:$2b$10$HASH:user
USER_5=operator5:$2b$10$HASH:user
USER_6=operator6:$2b$10$HASH:user
USER_7=admin:$2b$10$HASH:admin
```

### 4. Start the Server

#### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start dist/server.js --name event-registration

# Make PM2 restart on server reboot
pm2 startup
pm2 save
```

#### Using Node directly

```bash
node dist/server.js
```

### 5. Configure Reverse Proxy (Nginx)

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/event-registration
```

Add:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/event-registration /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. Push your code to GitHub

2. Go to https://vercel.com and sign in

3. Click "New Project" and import your repository

4. Configure:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Environment Variables:
     ```
     NEXT_PUBLIC_API_URL=https://api.yourdomain.com
     ```

5. Click "Deploy"

6. Vercel will provide a URL (e.g., `your-app.vercel.app`)

7. Configure custom domain in Vercel settings if desired

### Option 2: Hostinger (Static Export)

1. Build the application:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. Export static files (add to `next.config.js`):
   ```javascript
   const nextConfig = {
     output: 'export',
     images: {
       unoptimized: true
     }
   }
   ```

3. Build again:
   ```bash
   npm run build
   ```

4. Upload the `out/` folder to your web hosting

5. Configure your web server to serve the files

### Option 3: Netlify

1. Push code to GitHub

2. Go to https://netlify.com and create new site

3. Configure:
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/.next`
   - Environment variables:
     ```
     NEXT_PUBLIC_API_URL=https://api.yourdomain.com
     ```

4. Deploy

## Post-Deployment Steps

### 1. Verify Backend

Test all endpoints:

```bash
# Health check
curl https://api.yourdomain.com/health

# Login test
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"operator1","password":"your-password"}'
```

### 2. Verify Frontend

1. Open frontend URL in browser
2. Test login with all user accounts
3. Test registration flow
4. Test admin panel (with admin account)
5. Verify real-time coupon validation
6. Verify name search functionality

### 3. Database Verification

1. Log in to MongoDB Atlas
2. Check that indexes were created automatically
3. Verify connections are working (see "Metrics" tab)

### 4. Setup Monitoring

#### Backend Monitoring (PM2)

```bash
# View logs
pm2 logs event-registration

# Monitor resources
pm2 monit

# Setup email alerts (optional)
pm2 install pm2-logrotate
```

#### MongoDB Atlas Monitoring

1. Go to "Metrics" tab in Atlas
2. Setup alerts:
   - High connection count
   - High disk usage
   - Slow queries
   - Replica set status

### 5. Performance Testing

Test with multiple concurrent users:

```bash
# Install artillery
npm install -g artillery

# Create test file: load-test.yml
config:
  target: 'https://api.yourdomain.com'
  phases:
    - duration: 60
      arrivalRate: 5
scenarios:
  - flow:
      - post:
          url: '/api/auth/login'
          json:
            username: 'operator1'
            password: 'your-password'

# Run test
artillery run load-test.yml
```

## Security Hardening

### 1. Firewall Configuration

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Automatic Updates

```bash
# Install unattended-upgrades
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 3. Fail2Ban (Prevent brute force)

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 4. Regular Backups

#### MongoDB Atlas Backups

1. Go to "Backup" tab in Atlas
2. Enable Continuous Backup (paid feature) or
3. Use Cloud Backup (free on M10+ clusters)

#### Manual Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d)
BACKUP_DIR="/backups/mongodb"

mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$DATE"

# Keep only last 7 days
find $BACKUP_DIR -mtime +7 -delete
```

Add to crontab:
```bash
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

## Troubleshooting

### Backend Issues

**Problem**: Server won't start
```bash
# Check logs
pm2 logs event-registration

# Check if port is in use
sudo lsof -i :5000

# Restart
pm2 restart event-registration
```

**Problem**: MongoDB connection fails
- Verify connection string in `.env`
- Check IP whitelist in Atlas
- Test connection: `mongo "mongodb+srv://..."`

### Frontend Issues

**Problem**: Can't connect to backend
- Check CORS settings in backend
- Verify NEXT_PUBLIC_API_URL is correct
- Check browser console for errors
- Verify SSL certificates are valid

### Performance Issues

**Problem**: Slow responses
- Check MongoDB Atlas metrics
- Verify indexes are created
- Monitor server resources: `pm2 monit`
- Check network latency

## Scaling Considerations

For high traffic (>10 concurrent users):

1. **Upgrade MongoDB Atlas**: Move from M0 to M10+ for better performance

2. **Add Load Balancer**: Distribute traffic across multiple backend instances

3. **Increase Server Resources**: Upgrade Hostinger plan

4. **Add Redis Cache**: Replace in-memory cache with Redis

5. **CDN for Frontend**: Use Vercel/Netlify built-in CDN

## Rollback Procedure

If deployment fails:

### Backend Rollback

```bash
# Using PM2
pm2 stop event-registration

# Restore previous version
git checkout previous-commit
npm install
npm run build
pm2 restart event-registration
```

### Frontend Rollback

On Vercel/Netlify:
1. Go to "Deployments" page
2. Find previous successful deployment
3. Click "Promote to Production"

## Maintenance Windows

Schedule regular maintenance:

1. **Weekly**: Review logs, check disk space
2. **Monthly**: Update dependencies, security patches
3. **Quarterly**: Database optimization, backup verification

## Support Contacts

- **Hosting**: Hostinger Support
- **Database**: MongoDB Atlas Support
- **Frontend**: Vercel/Netlify Support
- **Developer**: [Your contact information]

## Emergency Procedures

### System Down

1. Check backend status: `pm2 status`
2. Check database connection: MongoDB Atlas dashboard
3. Review logs: `pm2 logs`
4. Restart services: `pm2 restart all`
5. If unresolved, contact support

### Data Loss

1. Stop all writes immediately
2. Restore from latest MongoDB backup
3. Verify data integrity
4. Resume operations
5. Document incident

---

**Last Updated**: December 2024
**Version**: 1.0.0
