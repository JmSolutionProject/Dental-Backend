require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/dentaldb';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function ensureRole(nombreRol) {
  let role = await prisma.role.findFirst({ where: { nombreRol } });
  if (!role) {
    role = await prisma.role.create({ data: { nombreRol, estado: true } });
    console.log(`  Created role: ${nombreRol}`);
  }
  return role;
}

async function ensureUser(email, nombreCompleto, hash) {
  let user = await prisma.usuario.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.usuario.create({
      data: { nombreCompleto, email, passwordHash: hash, estado: true },
    });
    console.log(`  Created user: ${email}`);
  } else {
    await prisma.usuario.update({
      where: { email },
      data: { passwordHash: hash, nombreCompleto },
    });
    console.log(`  Updated user: ${email}`);
  }
  return user;
}

async function assignRole(user, role) {
  const existing = await prisma.usuarioRol.findFirst({
    where: { usuarioId: user.id, rolId: role.id },
  });
  if (!existing) {
    await prisma.usuarioRol.create({
      data: { usuarioId: user.id, rolId: role.id },
    });
    console.log(`  Assigned role ${role.nombreRol} to ${user.email}`);
  }
}

async function main() {
  const hash = await bcrypt.hash('123456', 10);

  console.log('Ensuring roles...');
  const roleAdmin = await ensureRole('ADMIN');
  const roleSecre = await ensureRole('SECRETARIA');
  const roleMedico = await ensureRole('MEDICO');

  console.log('\nEnsuring users...');
  const adminUser = await ensureUser(
    'admin@admin.com',
    'Administrador Principal',
    hash,
  );
  const secreUser = await ensureUser(
    'secre@clinica.com',
    'Secretaria Recepcionista',
    hash,
  );
  const medicoUser = await ensureUser(
    'medico@clinica.com',
    'Doctor Dentista',
    hash,
  );

  console.log('\nAssigning roles...');
  await assignRole(adminUser, roleAdmin);
  await assignRole(secreUser, roleSecre);
  await assignRole(medicoUser, roleMedico);

  console.log('\n--- CREDENCIALES DE PRUEBA ---');
  console.log('  ADMIN:      admin@admin.com / 123456');
  console.log('  SECRETARIA: secre@clinica.com / 123456');
  console.log('  MEDICO:     medico@clinica.com / 123456');
  console.log('---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
