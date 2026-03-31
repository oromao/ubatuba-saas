import mongoose, { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

const MONGO_URL = process.env.MONGO_URL ?? 'mongodb://root:rootpass@localhost:27017/flydea?authSource=admin';
const TENANT_SLUG = 'ubatuba';

const testUsers = [
  { email: 'admin@ubatuba.local', password: 'Admin@123456', role: 'ADMIN' },
  { email: 'gestor@ubatuba.local', password: 'Gestor@123456', role: 'GESTOR' },
  { email: 'operador@ubatuba.local', password: 'Operador@123456', role: 'OPERADOR' },
  { email: 'leitor@ubatuba.local', password: 'Leitor@123456', role: 'LEITOR' },
];

const main = async () => {
  await mongoose.connect(MONGO_URL);
  const connection = mongoose.connection;
  const tenantsCollection = connection.collection('tenants');
  const usersCollection = connection.collection('users');
  const membershipsCollection = connection.collection('memberships');

  // 1. Create or find tenant
  let tenant = await tenantsCollection.findOne({ slug: TENANT_SLUG });
  if (!tenant) {
    const result = await tenantsCollection.insertOne({
      name: 'Ubatuba',
      slug: TENANT_SLUG,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    tenant = await tenantsCollection.findOne({ _id: result.insertedId });
    console.log(`✅ Tenant created: ${TENANT_SLUG}`);
  } else {
    console.log(`✅ Tenant found: ${TENANT_SLUG}`);
  }

  const tenantId = tenant!._id as Types.ObjectId;

  // 2. Create or update users
  for (const testUser of testUsers) {
    const passwordHash = await bcrypt.hash(testUser.password, 10);
    const result = await usersCollection.updateOne(
      { email: testUser.email },
      {
        $set: {
          email: testUser.email,
          passwordHash,
          isActive: true,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    const user = await usersCollection.findOne({ email: testUser.email });
    const userId = user!._id as Types.ObjectId;

    // 3. Create or update membership
    await membershipsCollection.updateOne(
      { userId, tenantId },
      {
        $set: {
          userId,
          tenantId,
          role: testUser.role,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    const action = result.upsertedId ? 'created' : 'updated';
    console.log(`✅ User ${action}: ${testUser.email} (${testUser.role})`);
  }

  console.log('\n✅ Seed complete! You can now login with:');
  testUsers.forEach(u => {
    console.log(`  Email: ${u.email} / Password: ${u.password} (Role: ${u.role})`);
  });

  await mongoose.disconnect();
};

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
