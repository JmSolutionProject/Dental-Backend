require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/dentaldb';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash('123456', 10);

  // Ensure both ADMIN and admin roles exist
  let roleAdminUpper = await prisma.role.findFirst({ where: { nombreRol: 'ADMIN' } });
  if (!roleAdminUpper) {
    roleAdminUpper = await prisma.role.create({ data: { nombreRol: 'ADMIN', estado: true } });
  }

  let roleAdminLower = await prisma.role.findFirst({ where: { nombreRol: 'admin' } });
  if (!roleAdminLower) {
    roleAdminLower = await prisma.role.create({ data: { nombreRol: 'admin', estado: true } });
  }

  const emails = ['admin@admin.com', 'admin@clinica.com'];
  for (const email of emails) {
    let user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.usuario.create({
        data: {
          nombreCompleto: 'Administrador Principal',
          email,
          passwordHash: hash,
          estado: true,
        },
      });
    } else {
      await prisma.usuario.update({
        where: { email },
        data: { passwordHash: hash },
      });
    }

    // Connect both roles to the user
    for (const role of [roleAdminUpper, roleAdminLower]) {
      const existingUserRole = await prisma.usuarioRol.findFirst({
        where: { usuarioId: user.id, rolId: role.id },
      });
      if (!existingUserRole) {
        await prisma.usuarioRol.create({
          data: { usuarioId: user.id, rolId: role.id },
        });
      }
    }
    console.log(`Roles updated for: ${email}`);
  }

  console.log('SEED COMPLETE');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
