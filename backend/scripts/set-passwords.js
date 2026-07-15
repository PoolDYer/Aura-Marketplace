const fs = require('fs');
const path = require('path');
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
  const prisma = new PrismaClient();

  const passwordHash = await argon2.hash('Password123!');
  const emails = [
    'tranpoolkenner789@gmail.com',
    'tranpoolkenner1237@gmail.com',
    'tranpoolkenner123@gmail.com'
  ];

  for (const email of emails) {
    const user = await prisma.usuario.findUnique({ where: { email } });
    if (user) {
      await prisma.usuario.update({
        where: { id: user.id },
        data: { passwordHash, estado: 'ACTIVO' }
      });
      console.log(`Password reset for user: ${email} (${user.rol})`);
    } else {
      console.log(`User not found: ${email}`);
    }
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
