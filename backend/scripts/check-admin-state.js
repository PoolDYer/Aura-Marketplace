const fs = require('fs');
const path = require('path');
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
  if (!email) {
    throw new Error('Uso: node scripts/check-admin-state.js correo@dominio.com');
  }

  const prisma = new PrismaClient();
  const [userCount, admin] = await Promise.all([
    prisma.usuario.count(),
    prisma.usuario.findUnique({
      where: { email },
      select: { email: true, nombre: true, rol: true, estado: true },
    }),
  ]);

  console.log(JSON.stringify({ userCount, admin }));
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
