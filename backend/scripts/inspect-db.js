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
  const prisma = new PrismaClient();

  const [users, categories, products] = await Promise.all([
    prisma.usuario.findMany({
      select: { id: true, email: true, nombre: true, rol: true, estado: true }
    }),
    prisma.categoria.findMany({
      select: { id: true, nombre: true }
    }),
    prisma.publicacion.findMany({
      select: { id: true, nombre: true, vendedorId: true, categoriaId: true }
    })
  ]);

  console.log(JSON.stringify({ users, categories, products }, null, 2));
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
