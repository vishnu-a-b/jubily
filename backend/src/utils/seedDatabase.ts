import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Registration from '../models/Registration';

dotenv.config();

// Sample data for generating random registrations
const firstNames = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Emma', 'Robert', 'Olivia',
  'William', 'Ava', 'Richard', 'Isabella', 'Joseph', 'Sophia', 'Thomas', 'Mia', 'Christopher', 'Charlotte',
  'Daniel', 'Amelia', 'Matthew', 'Harper', 'Anthony', 'Evelyn', 'Mark', 'Abigail', 'Donald', 'Elizabeth',
  'Paul', 'Sofia', 'Steven', 'Avery', 'Andrew', 'Ella', 'Joshua', 'Scarlett', 'Kenneth', 'Grace',
  'Kevin', 'Chloe', 'Brian', 'Victoria', 'George', 'Riley', 'Edward', 'Aria', 'Ronald', 'Lily',
  'Timothy', 'Aubrey', 'Jason', 'Zoey', 'Jeffrey', 'Penelope', 'Ryan', 'Lillian', 'Jacob', 'Addison',
  'Gary', 'Layla', 'Nicholas', 'Natalie', 'Eric', 'Camila', 'Jonathan', 'Hannah', 'Stephen', 'Brooklyn',
  'Larry', 'Zoe', 'Justin', 'Nora', 'Scott', 'Leah', 'Brandon', 'Savannah', 'Benjamin', 'Audrey',
  'Samuel', 'Claire', 'Frank', 'Eleanor', 'Gregory', 'Skylar', 'Raymond', 'Ellie', 'Alexander', 'Samantha',
  'Patrick', 'Stella', 'Jack', 'Paisley', 'Dennis', 'Violet', 'Jerry', 'Mila', 'Tyler', 'Allison'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
  'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
  'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
  'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
  'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes',
  'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster', 'Jimenez'
];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomName(): string {
  const firstName = randomElement(firstNames);
  const lastName = randomElement(lastNames);
  return `${firstName} ${lastName}`;
}

function generateRandomMobile(): string {
  // Generate 10 digit mobile number starting with 9, 8, 7, or 6
  const firstDigit = [9, 8, 7, 6][Math.floor(Math.random() * 4)];
  let mobile = firstDigit.toString();
  for (let i = 0; i < 9; i++) {
    mobile += Math.floor(Math.random() * 10);
  }
  return mobile;
}

function generateCouponNumber(index: number): string {
  // Generate coupon like COUP0001, COUP0002, etc.
  return `COUP${String(index).padStart(4, '0')}`;
}

async function seedDatabase(count: number = 5000) {
  try {
    console.log('Connecting to MongoDB...');

    const MONGODB_URI = process.env.MONGODB_URI || '';
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 20,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    });

    console.log('Connected to MongoDB Atlas');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing registrations...');
    await Registration.deleteMany({});
    console.log('Existing data cleared');

    console.log(`Generating ${count} random registrations...`);

    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < count; i += batchSize) {
      const batch = [];
      const currentBatchSize = Math.min(batchSize, count - i);

      for (let j = 0; j < currentBatchSize; j++) {
        const index = i + j + 1;
        batch.push({
          couponNo: generateCouponNumber(index),
          name: generateRandomName(),
          mobileNo: generateRandomMobile(),
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        });
      }

      await Registration.insertMany(batch);
      inserted += batch.length;

      const percentage = ((inserted / count) * 100).toFixed(1);
      process.stdout.write(`\rProgress: ${inserted}/${count} (${percentage}%)   `);
    }

    console.log('\n\nDatabase seeded successfully!');
    console.log(`Total registrations created: ${inserted}`);

    // Show some statistics
    const stats = await Registration.aggregate([
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          uniqueNames: { $addToSet: '$name' }
        }
      }
    ]);

    if (stats.length > 0) {
      console.log(`\nStatistics:`);
      console.log(`- Total registrations: ${stats[0].totalCount}`);
      console.log(`- Unique names: ${stats[0].uniqueNames.length}`);
    }

    // Show sample records
    console.log('\nSample records:');
    const samples = await Registration.find().limit(5).lean();
    samples.forEach((sample, index) => {
      console.log(`${index + 1}. ${sample.couponNo} - ${sample.name} - ${sample.mobileNo}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
    process.exit(0);
  }
}

// Get count from command line argument or use default 5000
const count = parseInt(process.argv[2]) || 5000;

console.log('=====================================');
console.log('Database Seeder - Random Registrations');
console.log('=====================================\n');

seedDatabase(count);
