import { PrismaClient } from '@prisma/client';

type DbCheckPrisma = Pick<PrismaClient, 'publicacion' | '$disconnect'>;

export function formatProductSummary(product: any) {
  const stock = Math.max(
    (product.inventario?.cantidad ?? 0) - (product.inventario?.cantidadReservada ?? 0),
    0,
  );

  return `- ${product.nombre} | ${product.id} | ${product.estado} | ${product.categoria.nombre} | stock ${stock} | imagenes ${product.imagenes.length}`;
}

export async function main(prisma: DbCheckPrisma = new PrismaClient()) {
  const products = await prisma.publicacion.findMany({
    where: { estado: 'ACTIVA' },
    select: {
      id: true,
      nombre: true,
      precio: true,
      estado: true,
      categoria: { select: { nombre: true } },
      inventario: { select: { cantidad: true, cantidadReservada: true } },
      imagenes: {
        where: { activa: true },
        select: { id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Productos activos en base de datos: ${products.length}`);
  products.forEach((product) => console.log(formatProductSummary(product)));
}

/* istanbul ignore next */
if (require.main === module) {
  const prisma = new PrismaClient();
  main(prisma)
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
