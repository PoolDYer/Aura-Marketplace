import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

describe('Database Postgres Integration Test (Neon)', () => {
  let prisma: PrismaClient;
  const testEmail = 'postgres-integration-test-user@aura.com';

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();

    // Clean up any stale test user
    await prisma.usuario.deleteMany({
      where: { email: testEmail },
    });
  });

  afterAll(async () => {
    // Clean up created user
    await prisma.usuario.deleteMany({
      where: { email: testEmail },
    });
    await prisma.$disconnect();
  });

  it('should successfully connect, write, read, and delete a user in Postgres', async () => {
    // 1. Create a user
    const user = await prisma.usuario.create({
      data: {
        nombre: 'Postgres Test User',
        email: testEmail,
        passwordHash: 'dummyhash',
        rol: 'COMPRADOR',
        estado: 'ACTIVO',
      },
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe(testEmail);
    expect(user.nombre).toBe('Postgres Test User');

    // 2. Read the user
    const found = await prisma.usuario.findUnique({
      where: { id: user.id },
    });

    expect(found).toBeDefined();
    expect(found?.email).toBe(testEmail);

    // 3. Update the user
    const updated = await prisma.usuario.update({
      where: { id: user.id },
      data: { nombre: 'Updated Test User' },
    });

    expect(updated.nombre).toBe('Updated Test User');

    // 4. Delete the user
    await prisma.usuario.delete({
      where: { id: user.id },
    });

    const deleted = await prisma.usuario.findUnique({
      where: { id: user.id },
    });
    expect(deleted).toBeNull();
  });

  it('should enforce transaction ACID rollback on failures', async () => {
    const initialCount = await prisma.usuario.count({
      where: { email: testEmail },
    });
    expect(initialCount).toBe(0);

    try {
      await prisma.$transaction(async (tx) => {
        // Step 1: Create a user
        await tx.usuario.create({
          data: {
            nombre: 'Transaction Rolled Back User',
            email: testEmail,
            passwordHash: 'dummyhash',
            rol: 'COMPRADOR',
            estado: 'ACTIVO',
          },
        });

        // Step 2: Throw an error to trigger rollback
        throw new Error('Force Rollback');
      });
    } catch (err: any) {
      expect(err.message).toBe('Force Rollback');
    }

    // Verify the user was NOT created due to rollback
    const postCount = await prisma.usuario.count({
      where: { email: testEmail },
    });
    expect(postCount).toBe(0);
  });
});
