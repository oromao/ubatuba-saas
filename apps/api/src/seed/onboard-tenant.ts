/**
 * Tenant Onboarding Script (T9-TENANT-ONBOARD)
 * Usage: npx ts-node src/seed/onboard-tenant.ts <name> <slug> <adminEmail> <adminPassword>
 *
 * Creates:
 * - Tenant with municipal config defaults
 * - Default project with GIS extent
 * - Admin user
 * - Admin membership
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { TenantsService } from '../modules/tenants/tenants.service';
import { ProjectsService } from '../modules/projects/projects.service';
import { UsersService } from '../modules/users/users.service';
import { MembershipsService } from '../modules/memberships/memberships.service';

async function onboard() {
  const args = process.argv.slice(2);
  if (args.length < 4) {
    console.error('Usage: npx ts-node src/seed/onboard-tenant.ts <name> <slug> <adminEmail> <adminPassword>');
    process.exit(1);
  }

  const [name, slug, adminEmail, adminPassword] = args;

  const ctx = await NestFactory.createApplicationContext(AppModule);
  const tenantsService = ctx.get(TenantsService);
  const projectsService = ctx.get(ProjectsService);
  const usersService = ctx.get(UsersService);
  const membershipsService = ctx.get(MembershipsService);

  try {
    // 1. Check if tenant already exists
    const existing = await tenantsService.findBySlug(slug);
    if (existing) {
      console.log(`Tenant "${slug}" already exists (id: ${existing._id}). Skipping creation.`);
    } else {
      console.log(`Creating tenant: ${name} (${slug})`);
      const tenant = await tenantsService.create({ name, slug });

      // Set default municipal config
      await tenantsService.updateMunicipalConfig(String(tenant._id), {
        cnpjMunicipio: '00000000000000',
        uf: 'SP',
        ibgeCode: '0000000',
        aliquotasPadrao: { iptuResidencial: 0.005, iptuComercial: 0.01, iptuIndustrial: 0.015 },
        endereco: { telefone: '(00) 0000-0000', email: `${slug}@flydea.dev` },
        modulosHabilitados: { ctm: true, pgv: true, alvaraObras: true, fiscalizacao: true },
        configuracaoRegional: { timezone: 'America/Sao_Paulo', locale: 'pt-BR' },
      });
      console.log(`  Municipal config set for tenant ${tenant._id}`);
    }

    // 2. Create default project
    const tenant = await tenantsService.findBySlug(slug);
    const tenantId = String(tenant!._id);

    const existingProject = await projectsService.findByTenantAndSlug(tenantId, 'default');
    if (existingProject) {
      console.log(`Default project already exists (id: ${existingProject._id}).`);
    } else {
      console.log('Creating default project...');
      await projectsService.create({
        tenantId,
        name: `${name} - Projeto Padrao`,
        slug: 'default',
        description: 'Projeto padrao do municipio',
        isDefault: true,
        defaultCenter: [-45.0, -23.0],
        defaultZoom: 12,
      });
      console.log('  Default project created.');
    }

    // 3. Create admin user
    const existingUser = await usersService.findByEmail(adminEmail);
    if (existingUser) {
      console.log(`Admin user ${adminEmail} already exists (id: ${existingUser._id}).`);
    } else {
      console.log(`Creating admin user: ${adminEmail}`);
      const user = await usersService.create({
        email: adminEmail,
        password: adminPassword,
        fullName: `Administrador ${name}`,
        role: 'ADMIN',
      });
      console.log(`  Admin user created (id: ${user._id})`);

      // 4. Create membership
      const project = await projectsService.findByTenantAndSlug(tenantId, 'default');
      if (project) {
        await membershipsService.create({
          userId: String(user._id),
          tenantId,
          projectId: String(project._id),
          role: 'ADMIN',
        });
        console.log('  Membership created (ADMIN).');
      }
    }

    console.log(`\nOnboarding complete for ${name} (${slug})!`);
    console.log(`Login: ${adminEmail} / ${adminPassword}`);
  } catch (error) {
    console.error('Onboarding failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await ctx.close();
  }
}

onboard();
