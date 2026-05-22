const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

// Load env variables
dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    console.log('Cleared existing database records.');

    // 1. Create Demo Users
    // Passwords will be hashed in the User model pre-save hook
    const admin = await User.create({
      name: 'Sarah Connor',
      email: 'admin@example.com',
      password: 'password123',
      role: 'Admin'
    });

    const member = await User.create({
      name: 'John Connor',
      email: 'member@example.com',
      password: 'password123',
      role: 'Member'
    });

    console.log('Demo Users seeded successfully:');
    console.log(' - Admin User: admin@example.com / password123');
    console.log(' - Member User: member@example.com / password123');

    // 2. Create Demo Project
    const project = await Project.create({
      name: 'CollabFlow Launch Scope',
      description: 'Prepare and orchestrate the launch deliverables for the CollabFlow workspace application.',
      createdBy: admin._id,
      members: [admin._id, member._id]
    });

    console.log('Demo Project "CollabFlow Launch Scope" seeded.');

    // 3. Create Demo Tasks
    const now = new Date();
    
    // Task 1: Pending (Overdue to show visual alerts)
    const pastDate = new Date();
    pastDate.setDate(now.getDate() - 3); // 3 days ago

    await Task.create({
      title: 'Finalize Branding & Logo Assets',
      description: 'Review color palettes, SVGs, and brand standards, then generate and save all favicon sizes.',
      dueDate: pastDate,
      priority: 'High',
      status: 'Pending',
      assignedTo: admin._id,
      projectId: project._id,
      createdBy: admin._id
    });

    // Task 2: In Progress
    const futureDate1 = new Date();
    futureDate1.setDate(now.getDate() + 5);

    await Task.create({
      title: 'Integrate Dynamic Dark/Light Mode',
      description: 'Ensure all pages leverage Tailwind text/bg transitions and sync selections seamlessly with LocalStorage.',
      dueDate: futureDate1,
      priority: 'Medium',
      status: 'In Progress',
      assignedTo: member._id,
      projectId: project._id,
      createdBy: admin._id
    });

    // Task 3: Completed
    const futureDate2 = new Date();
    futureDate2.setDate(now.getDate() + 10);

    await Task.create({
      title: 'Design Backend Express Scaffolding',
      description: 'Setup Node server, connect Mongoose ORM, and configure custom error handling middleware.',
      dueDate: futureDate2,
      priority: 'Low',
      status: 'Completed',
      assignedTo: member._id,
      projectId: project._id,
      createdBy: admin._id
    });

    console.log('Demo Tasks seeded successfully.');
    console.log('Database seeding operation complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding process encountered an error:', error);
    process.exit(1);
  }
};

seedData();
