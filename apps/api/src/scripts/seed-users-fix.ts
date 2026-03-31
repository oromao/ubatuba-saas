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
  const mongoUrl = MONGO_URL;
  console.log('🔗 Conectando ao MongoDB...');

  await mongoose.connect(mongoUrl);
  const connection = mongoose.connection;
  const tenantsCollection = connection.collection('tenants');
  const usersCollection = connection.collection('users');
  const membershipsCollection = connection.collection('memberships');

  try {
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
      console.log(`✅ Tenant criado: ${TENANT_SLUG}`);
    } else {
      console.log(`✅ Tenant encontrado: ${TENANT_SLUG}`);
    }

    const tenantId = tenant!._id as Types.ObjectId;

    // 2. Create or update users with proper bcrypt hashing
    for (const testUser of testUsers) {
      // Hash password using bcrypt (MUST match what auth.service.ts expects)
      const passwordHash = await bcrypt.hash(testUser.password, 10);

      const existingUser = await usersCollection.findOne({ email: testUser.email });

      if (existingUser) {
        // Update existing user with new hash
        await usersCollection.updateOne(
          { _id: existingUser._id },
          {
            $set: {
              passwordHash,
              isActive: true,
              updatedAt: new Date(),
            },
          }
        );
        console.log(`✅ Usuário atualizado: ${testUser.email} (${testUser.role})`);
      } else {
        // Create new user
        const result = await usersCollection.insertOne({
          email: testUser.email,
          passwordHash,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`✅ Usuário criado: ${testUser.email} (${testUser.role})`);
        existingUser = { _id: result.insertedId } as any;
      }

      const user = await usersCollection.findOne({ email: testUser.email });
      const userId = user!._id as Types.ObjectId;

      // 3. Create or update membership
      const existingMembership = await membershipsCollection.findOne({ userId, tenantId });
      if (existingMembership) {
        await membershipsCollection.updateOne(
          { _id: existingMembership._id },
          {
            $set: {
              role: testUser.role,
              updatedAt: new Date(),
            },
          }
        );
      } else {
        await membershipsCollection.insertOne({
          userId,
          tenantId,
          role: testUser.role,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    console.log('\n✅ Seed completo! Credenciais de teste:');
    testUsers.forEach(u => {
      console.log(`   ${u.email} / ${u.password} (${u.role})`);
    });
    console.log(`\n📍 Tenant: ${TENANT_SLUG}`);

  } catch (error) {
    console.error('❌ Erro durante seed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
};

main().catch((err) => {
  console.error('❌ Seed falhou:', err);
  process.exit(1);
});
