import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedUsers } from './seed/users.js';
import seedCredentials from './seed/credentials.js';
import seedJobs from './seed/jobs.js';
import seedChat from './seed/chat.js';
import seedNotifications from './seed/notifications.js';
import { connectDB } from './config/db.js';

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await mongoose.connection.dropDatabase();
    console.log('✅ Database cleared\n');

    // Seed in dependency order
    console.log('👥 Seeding users...');
    await seedUsers();
    console.log('');

    console.log('📜 Seeding credentials...');
    await seedCredentials();
    console.log('');

    console.log('💼 Seeding jobs...');
    await seedJobs();
    console.log('');

    console.log('💬 Seeding chat conversations and messages...');
    await seedChat();
    console.log('');

    console.log('🔔 Seeding notifications...');
    await seedNotifications();
    console.log('');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - 30 users (10 learners, 10 regulators, 10 employers)');
    console.log('   - 5 credentials for demo learner (Priya)');
    console.log('   - 5 job postings by demo employer (Meera)');
    console.log('   - 3 conversations with 37 messages between demo users');
    console.log('   - Multiple notifications for demo users');
    console.log('\n👩 Demo Users (All Female):');
    console.log('   - Priya Sharma (learner) - priya.sharma@example.com');
    console.log('   - Dr. Kavita Rao (regulator) - kavita.rao@credverify.com');
    console.log('   - Meera Krishnan (employer) - meera.krishnan@startupx.io');
    console.log('\n🔑 Password for all users: password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
