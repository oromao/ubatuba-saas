const { MongoClient } = require('mongodb');

(async () => {
  const client = new MongoClient('mongodb://root:rootpass@localhost:27017/flydea?authSource=admin');

  try {
    await client.connect();
    const db = client.db('flydea');

    console.log('\n📋 Usuários no banco:');
    const users = await db.collection('users').find({}).toArray();
    users.forEach(u => {
      console.log(`\nEmail: ${u.email}`);
      console.log(`  Active: ${u.isActive}`);
      console.log(`  Hash: ${u.passwordHash.substring(0, 50)}...`);
      console.log(`  Hash length: ${u.passwordHash.length}`);
    });

    console.log('\n\n📋 Memberships:');
    const memberships = await db.collection('memberships').find({}).toArray();
    memberships.forEach(m => {
      console.log(`\nUser ID: ${m.userId}`);
      console.log(`  Tenant ID: ${m.tenantId}`);
      console.log(`  Role: ${m.role}`);
    });

    console.log('\n\n📋 Tenants:');
    const tenants = await db.collection('tenants').find({}).toArray();
    tenants.forEach(t => {
      console.log(`\nID: ${t._id}`);
      console.log(`  Name: ${t.name}`);
      console.log(`  Slug: ${t.slug}`);
    });

  } finally {
    await client.close();
  }
})();
