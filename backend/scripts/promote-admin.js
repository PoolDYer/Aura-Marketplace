const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const argon2 = require('argon2');
const { PrismaClient } = require('@prisma/client');

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const env = fs.readFileSync(envPath, 'utf8');
  for (const line of env.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

async function main() {
  loadEnv();

  const email = process.argv[2]?.trim().toLowerCase();
  const shouldCreate = process.argv.includes('--create');
  if (!email) {
    throw new Error('Uso: node scripts/promote-admin.js correo@dominio.com [--create]');
  }

  const prisma = new PrismaClient();
  const existing = await prisma.usuario.findUnique({
    where: { email },
    select: { id: true, email: true, nombre: true, rol: true, estado: true },
  });

  if (!existing) {
    if (!shouldCreate) {
      console.log(JSON.stringify({ promoted: false, reason: 'USER_NOT_FOUND', email }));
      await prisma.$disconnect();
      return;
    }

    const temporaryPassword = createTemporaryPassword();
    const created = await prisma.usuario.create({
      data: {
        nombre: 'Jean Palomino',
        email,
        passwordHash: await argon2.hash(temporaryPassword),
        rol: 'ADMINISTRADOR',
        estado: 'ACTIVO',
      },
      select: { email: true, nombre: true, rol: true, estado: true },
    });

    console.log(JSON.stringify({ created: true, user: created, temporaryPassword }));
    await prisma.$disconnect();
    return;
  }

  const updated = await prisma.usuario.update({
    where: { id: existing.id },
    data: {
      rol: 'ADMINISTRADOR',
      estado: 'ACTIVO',
    },
    select: { email: true, nombre: true, rol: true, estado: true },
  });

  console.log(JSON.stringify({ promoted: true, user: updated }));
  await prisma.$disconnect();
}

function createTemporaryPassword() {
  return `Aura-${crypto.randomBytes(9).toString('base64url')}7a`;
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
