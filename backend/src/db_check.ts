import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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
  products.forEach((product) => {
    const stock = Math.max(
      (product.inventario?.cantidad ?? 0) - (product.inventario?.cantidadReservada ?? 0),
      0,
    );
    console.log(
      `- ${product.nombre} | ${product.id} | ${product.estado} | ${product.categoria.nombre} | stock ${stock} | imagenes ${product.imagenes.length}`,
    );
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
