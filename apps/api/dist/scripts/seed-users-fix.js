"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcrypt = require("bcrypt");
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
    await mongoose_1.default.connect(mongoUrl);
    const connection = mongoose_1.default.connection;
    const tenantsCollection = connection.collection('tenants');
    const usersCollection = connection.collection('users');
    const membershipsCollection = connection.collection('memberships');
    try {
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
        }
        else {
            console.log(`✅ Tenant encontrado: ${TENANT_SLUG}`);
        }
        const tenantId = tenant._id;
        for (const testUser of testUsers) {
            const passwordHash = await bcrypt.hash(testUser.password, 10);
            let existingUser = await usersCollection.findOne({ email: testUser.email });
            if (existingUser) {
                await usersCollection.updateOne({ _id: existingUser._id }, {
                    $set: {
                        passwordHash,
                        isActive: true,
                        updatedAt: new Date(),
                    },
                });
                console.log(`✅ Usuário atualizado: ${testUser.email} (${testUser.role})`);
            }
            else {
                const result = await usersCollection.insertOne({
                    email: testUser.email,
                    passwordHash,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                console.log(`✅ Usuário criado: ${testUser.email} (${testUser.role})`);
                existingUser = { _id: result.insertedId };
            }
            const user = await usersCollection.findOne({ email: testUser.email });
            const userId = user._id;
            const existingMembership = await membershipsCollection.findOne({ userId, tenantId });
            if (existingMembership) {
                await membershipsCollection.updateOne({ _id: existingMembership._id }, {
                    $set: {
                        role: testUser.role,
                        updatedAt: new Date(),
                    },
                });
            }
            else {
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
    }
    catch (error) {
        console.error('❌ Erro durante seed:', error);
        throw error;
    }
    finally {
        await mongoose_1.default.disconnect();
    }
};
main().catch((err) => {
    console.error('❌ Seed falhou:', err);
    process.exit(1);
});
//# sourceMappingURL=seed-users-fix.js.map