# Database Seeding Guide

## ✅ 5000 Random Registrations Added!

Your database has been successfully populated with test data.

### Database Statistics

- **Total Registrations**: 5,000
- **Unique Names**: 3,956
- **Coupon Numbers**: COUP0001 to COUP5000
- **Mobile Numbers**: Random 10-digit numbers (starting with 6, 7, 8, or 9)
- **Registration Dates**: Random dates within the last 30 days

### Sample Records

```
1. COUP0001 - Skylar Rivera - 6379389427
2. COUP0002 - Michael Jimenez - 8002732629
3. COUP0003 - Stephen Morales - 7442434034
4. COUP0004 - Claire Wood - 9087318747
5. COUP0005 - Donald Rodriguez - 6904568334
```

## 🔄 Seed Commands

You can reseed the database anytime with different amounts:

```bash
# Seed with 1000 registrations
npm run seed:1000

# Seed with 5000 registrations (default)
npm run seed:5000

# Seed with 10000 registrations
npm run seed:10000

# Custom amount
npm run seed -- 2500
```

**Note**: Running the seed command will **clear all existing data** first!

## 🧪 Test the System with Real Data

Now you can test:

### 1. Search Functionality
- Login as operator1
- Type "Michael" in the name field
- Should see multiple Michaels in the sidebar
- Try "Smith", "Johnson", "Garcia" - common last names

### 2. Pagination (Admin Panel)
- Login as admin
- Go to Admin Panel
- Browse through 100 pages (50 records per page)
- Test search filter with common names

### 3. Duplicate Detection
- Try to register with coupon "COUP0001"
- Should show error: "Already registered to Skylar Rivera - 6379389427"

### 4. Performance Testing
- Search for common names (John, Michael, Sarah)
- Should return results in 150-250ms
- Check if debouncing works (300ms delay)

## 📊 Data Distribution

The seeded data includes:

**First Names (100 variations)**
- John, Jane, Michael, Sarah, David, Emily, etc.
- Mix of traditional and modern names

**Last Names (100 variations)**
- Smith, Johnson, Williams, Brown, Jones, Garcia, etc.
- Diverse cultural backgrounds

**Name Combinations**
- ~4000 unique name combinations
- Some duplicates intentional for testing search

**Mobile Numbers**
- All 10 digits
- Start with 6, 7, 8, or 9 (valid Indian mobile format)
- Randomly generated

**Registration Dates**
- Spread over last 30 days
- Helps test date sorting and filtering

## 🎯 Search Performance Tips

With 5000 records, the system demonstrates:

1. **Indexed Queries**: Fast coupon lookups (<50ms)
2. **Text Search**: Name searches with caching (150-250ms)
3. **Pagination**: Efficient browsing of large datasets
4. **Debouncing**: Prevents database overload

## 🔍 Common Test Searches

Try these searches to see multiple results:

| Search Term | Expected Results |
|-------------|------------------|
| "John"      | 50-100 matches   |
| "Smith"     | 40-80 matches    |
| "Michael"   | 50-100 matches   |
| "Garcia"    | 40-80 matches    |
| "Sarah"     | 40-80 matches    |

## 🗑️ Clear Database

To remove all seeded data:

```bash
# Connect to MongoDB and run:
db.registrations.deleteMany({})
```

Or use MongoDB Compass/Atlas UI to delete all documents.

## 📈 Scaling Tests

With 5000 records, you can now test:

### Load Testing
```bash
# Multiple concurrent searches
# Open 5 browser tabs
# Each typing different names
# System should handle smoothly
```

### Memory Usage
- Backend should use ~100-200MB RAM
- MongoDB should handle with free tier (512MB)
- No performance degradation expected

### Cache Effectiveness
- First search: ~200ms (DB query)
- Second search (same name): ~50ms (from cache)
- Cache expires after 2 minutes

## 🎨 Data Visualization Ideas

With this data, you can:

1. **Registration Timeline**
   - Plot registrations over last 30 days
   - See distribution pattern

2. **Name Frequency**
   - Most common first names
   - Most common last names

3. **Search Analytics**
   - Track most searched names
   - Identify popular queries

## ⚠️ Important Notes

1. **This is test data** - Clear before production use
2. **Seeding clears existing data** - Backup first if needed
3. **Coupon numbers are sequential** - COUP0001 to COUP5000
4. **Names repeat intentionally** - For testing duplicate detection
5. **Mobile numbers are random** - Not real phone numbers

## 🚀 Next Steps

1. **Start the application**
   ```bash
   ./start-dev.sh
   ```

2. **Login and test**
   - Try operator1 / operator1pass
   - Search for "Michael" or "Smith"
   - See real-time results

3. **Admin features**
   - Login as admin / adminpass
   - View all 5000 registrations
   - Test pagination and search

4. **Performance check**
   - Monitor response times
   - Check MongoDB Atlas metrics
   - Verify caching is working

## 📝 Sample Test Script

```
Test 1: Search Performance
- Login as operator1
- Type "John" slowly
- Observe 300ms debounce delay
- Results appear in sidebar
- Count matches (should be 50-100)

Test 2: Duplicate Coupon
- Try coupon: COUP0100
- System shows error with existing name
- Cannot proceed with registration

Test 3: Admin View
- Login as admin
- Open admin panel
- See 5000 total registrations
- Browse multiple pages
- Search for specific name

Test 4: Real Registration
- Use new coupon: COUP9999
- Add your own name
- Should succeed
- Total becomes 5001
```

## 🔧 Seed Script Details

The seeder script (`backend/src/utils/seedDatabase.ts`):

- Connects to MongoDB Atlas
- Clears existing registrations
- Generates random but realistic data
- Inserts in batches of 100 (optimal)
- Shows progress percentage
- Displays statistics when done

**Processing Speed**: ~5000 records in 10-15 seconds

---

**Database**: jubily
**Collection**: registrations
**Total Documents**: 5,000
**Status**: ✅ Ready for testing
