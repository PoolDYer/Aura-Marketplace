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

function quoteIdentifier(identifier) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function createTemporaryPassword() {
  return `Aura-${crypto.randomBytes(10).toString('base64url')}7a`;
}

async function main() {
  loadEnv();

  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    throw new Error('Uso: node scripts/reset-db-keep-admin.js correo@dominio.com');
  }

  const prisma = new PrismaClient();
  const tables = await prisma.$queryRaw`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `;

  if (tables.length > 0) {
    const tableList = tables.map((row) => quoteIdentifier(row.tablename)).join(', ');
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`);
  }

  const temporaryPassword = createTemporaryPassword();
  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Jean Palomino',
      email,
      passwordHash: await argon2.hash(temporaryPassword),
      rol: 'ADMINISTRADOR',
      estado: 'ACTIVO',
    },
    select: { email: true, nombre: true, rol: true, estado: true },
  });

  console.log(JSON.stringify({
    reset: true,
    truncatedTables: tables.length,
    admin,
    temporaryPassword,
  }));

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
