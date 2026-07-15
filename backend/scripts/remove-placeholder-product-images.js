const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const PLACEHOLDER_IMAGE_URL =
  'https://res.cloudinary.com/dg4hes0tm/image/upload/v1783626782/Aura/assets/frontend/src/assets/placeholder.png';

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

  const result = await prisma.imagenPublicacion.deleteMany({
    where: { url: PLACEHOLDER_IMAGE_URL },
  });

  console.log(`Removed ${result.count} placeholder product images.`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
