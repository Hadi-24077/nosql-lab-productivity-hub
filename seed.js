// seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const { connect } = require('./db/connection');

(async () => {
  const db = await connect();

  // Clear existing data so re-seeding is idempotent
  await db.collection('users').deleteMany({});
  await db.collection('projects').deleteMany({});
  await db.collection('tasks').deleteMany({});
  await db.collection('notes').deleteMany({});
  console.log('✓ Cleared old data');

  // Ensure unique index on email
  await db.collection('users').createIndex({ email: 1 }, { unique: true });

  // ── Hash password ──────────────────────────────────────────────────────
  const hash = await bcrypt.hash('password123', 10);

  // ── Users ──────────────────────────────────────────────────────────────
  const u1 = await db.collection('users').insertOne({
    name: 'user1',
    email: 'user1@example.com',
    passwordHash: hash,
    theme: 'dark',   
    createdAt: new Date('2024-01-15T10:00:00Z'),
  });
  const user1Id = u1.insertedId;

  const u2 = await db.collection('users').insertOne({
    name: 'user2',
    email: 'user2@example.com',
    passwordHash: hash,
    createdAt: new Date('2024-01-20T08:00:00Z'),
    // no 'theme' field — demonstrates schema flexibility
  });
  const user2Id = u2.insertedId;

  console.log('✓ Seeded 2 users');

  // ── Projects ───────────────────────────────────────────────────────────
  const p1 = await db.collection('projects').insertOne({
    ownerId: user1Id,
    name: 'Thesis Writing',
    description: 'Final year thesis on distributed systems',
    archived: false,
    createdAt: new Date('2024-02-01T09:00:00Z'),
  });
  const thesisId = p1.insertedId;

  const p2 = await db.collection('projects').insertOne({
    ownerId: user1Id,
    name: 'Home Renovation',
    description: 'Kitchen and living room upgrade',
    archived: false,
    createdAt: new Date('2024-02-05T11:00:00Z'),
  });
  const renoId = p2.insertedId;

  const p3 = await db.collection('projects').insertOne({
    ownerId: user1Id,
    name: 'Old Blog',
    description: 'Archived personal blog — no longer active',
    archived: true,
    createdAt: new Date('2023-06-01T09:00:00Z'),
  });

  const p4 = await db.collection('projects').insertOne({
    ownerId: user2Id,
    name: 'Mobile App MVP',
    description: 'Fitness tracking app for Android',
    archived: false,
    createdAt: new Date('2024-02-10T07:00:00Z'),
  });
  const mobileAppId = p4.insertedId;

  console.log('✓ Seeded 4 projects');

  // ── Tasks ──────────────────────────────────────────────────────────────
  await db.collection('tasks').insertOne({
    ownerId: user1Id,
    projectId: thesisId,
    title: 'Write literature review',
    status: 'in-progress',
    priority: 3,
    tags: ['research', 'writing'],
    subtasks: [
      { title: 'Find 20 relevant papers', done: true },
      { title: 'Summarize each paper', done: false },
      { title: 'Identify research gaps', done: false },
    ],
    dueDate: new Date('2024-03-15T00:00:00Z'), // optional field
    createdAt: new Date('2024-02-10T08:30:00Z'),
  });

  await db.collection('tasks').insertOne({
    ownerId: user1Id,
    projectId: thesisId,
    title: 'Draft chapter 1',
    status: 'todo',
    priority: 2,
    tags: ['writing'],
    subtasks: [
      { title: 'Outline the chapter', done: false },
      { title: 'Write first draft', done: false },
    ],
    // No dueDate — demonstrates schema flexibility
    createdAt: new Date('2024-02-12T09:00:00Z'),
  });

  await db.collection('tasks').insertOne({
    ownerId: user1Id,
    projectId: renoId,
    title: 'Order kitchen cabinets',
    status: 'done',
    priority: 3,
    tags: ['procurement', 'kitchen'],
    subtasks: [
      { title: 'Measure cabinet space', done: true },
      { title: 'Choose cabinet style', done: true },
      { title: 'Place order online', done: true },
    ],
    createdAt: new Date('2024-02-14T10:00:00Z'),
  });

  await db.collection('tasks').insertOne({
    ownerId: user1Id,
    projectId: renoId,
    title: 'Paint living room',
    status: 'todo',
    priority: 2,
    tags: ['painting', 'living-room'],
    subtasks: [
      { title: 'Buy paint and supplies', done: false },
      { title: 'Sand and prime walls', done: false },
    ],
    createdAt: new Date('2024-02-15T11:00:00Z'),
  });

  await db.collection('tasks').insertOne({
    ownerId: user2Id,
    projectId: mobileAppId,
    title: 'Design onboarding screens',
    status: 'in-progress',
    priority: 3,
    tags: ['design', 'ux'],
    subtasks: [
      { title: 'Sketch wireframes', done: true },
      { title: 'Create Figma prototype', done: false },
    ],
    createdAt: new Date('2024-02-16T08:00:00Z'),
  });

  console.log('✓ Seeded 5 tasks');

  // ── Notes ──────────────────────────────────────────────────────────────
  await db.collection('notes').insertOne({
    ownerId: user1Id,
    projectId: thesisId,
    title: 'Supervisor meeting notes',
    content: 'Discussed chapter 2 outline. Need to add more case studies.',
    tags: ['meeting', 'thesis'],
    createdAt: new Date('2024-02-13T15:00:00Z'),
  });

  await db.collection('notes').insertOne({
    ownerId: user1Id,
    projectId: thesisId,
    title: 'Key papers to cite',
    content: 'Lamport 1978, Raft 2014, Paxos 1989',
    tags: ['research', 'references'],
    createdAt: new Date('2024-02-14T12:00:00Z'),
  });

  await db.collection('notes').insertOne({
    ownerId: user1Id,
    projectId: renoId,
    title: 'Paint color options',
    content: 'Shortlisted: Warm Sand, Ivory White, Sage Green',
    tags: ['painting', 'shopping'],
    createdAt: new Date('2024-02-15T09:30:00Z'),
  });

  await db.collection('notes').insertOne({
    ownerId: user1Id,
    projectId: null,    // standalone note — no project attached
    title: 'Books to read this month',
    content: 'Designing Data-Intensive Applications, Clean Code',
    tags: ['reading', 'personal'],
    createdAt: new Date('2024-02-16T07:00:00Z'),
  });

  await db.collection('notes').insertOne({
    ownerId: user2Id,
    projectId: mobileAppId,
    title: 'App store requirements',
    content: 'Privacy policy, icon sizes, screenshots needed before submission',
    tags: ['launch', 'ux'],
    createdAt: new Date('2024-02-17T10:00:00Z'),
  });

  console.log('✓ Seeded 5 notes');

  console.log('\n✅ Seeding complete!');
  // console.log('   Login → user1@example.com / password123');
  // console.log('   Login → user2@example.com   / password123');
  process.exit(0);
})();