import { PrismaClient } from '@prisma/client';

const API_URL = 'http://localhost:3000';
type E2ePrisma = Pick<PrismaClient, 'orden' | '$disconnect'>;
type FetchLike = typeof fetch;

export async function runTest(
  prisma: E2ePrisma = new PrismaClient(),
  fetchImpl: FetchLike = fetch,
  apiUrl = API_URL,
) {
  console.log('--- Iniciando prueba de flujo de compra E2E con productos reales de la API ---');

  const loginRes = await fetchImpl(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'prueba2@gmail.com',
      password: 'Katy123456',
    }),
  });

  if (!loginRes.ok) {
    const errorText = await loginRes.text();
    throw new Error(`Error en login: ${loginRes.status} - ${errorText}`);
  }

  const loginData = await loginRes.json() as any;
  const token = loginData.accessToken;
  const user = loginData.user;
  console.log(`1. Sesion iniciada para comprador: ${user.nombre} (${user.email})`);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const productRes = await fetchImpl(`${apiUrl}/products`);
  if (!productRes.ok) throw new Error('Error al obtener productos');

  const productData = await productRes.json() as any[];
  const prod = productData[0];
  if (!prod) {
    throw new Error('No se encontro ningun producto activo en el catalogo');
  }
  console.log(`2. Producto encontrado: ${prod.nombre} - Precio: S/ ${prod.precio} - ID: ${prod.id}`);

  const clearCartRes = await fetchImpl(`${apiUrl}/cart`, {
    method: 'DELETE',
    headers,
  });
  if (!clearCartRes.ok) console.log('Aviso: error o carrito ya estaba vacio');
  else console.log('3. Carrito anterior vaciado.');

  const cartAddRes = await fetchImpl(`${apiUrl}/cart/items`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      publicacionId: prod.id,
      cantidad: 1,
    }),
  });
  if (!cartAddRes.ok) {
    const errorText = await cartAddRes.text();
    throw new Error(`Error al agregar al carrito: ${cartAddRes.status} - ${errorText}`);
  }
  console.log('4. Producto agregado al carrito.');

  const cartRes = await fetchImpl(`${apiUrl}/cart`, { headers });
  if (!cartRes.ok) throw new Error('Error al obtener carrito');
  const cartData = await cartRes.json() as any;
  console.log(`5. Carrito recuperado. Items: ${cartData.items.length}`);

  const addressesRes = await fetchImpl(`${apiUrl}/users/me/addresses`, { headers });
  if (!addressesRes.ok) throw new Error('Error al obtener direcciones');
  const addressesData = await addressesRes.json() as any[];
  const address = addressesData[0];
  if (!address) {
    throw new Error('El usuario de prueba no tiene una direccion registrada');
  }
  console.log(`6. Direccion guardada recuperada: ${address.calle}`);

  const orderRes = await fetchImpl(`${apiUrl}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      direccionId: address.id,
    }),
  });

  if (!orderRes.ok) {
    const errorText = await orderRes.text();
    throw new Error(`Error al crear la orden: ${orderRes.status} - ${errorText}`);
  }

  const order = await orderRes.json() as any;
  console.log(`7. Orden creada. ID: ${order.id} - Total: S/ ${order.total} - Estado: ${order.estado}`);

  const dbOrder = await prisma.orden.findUnique({
    where: { id: order.id },
    include: {
      direccion: true,
      lineas: true,
      comprador: true,
    },
  });

  if (!dbOrder) {
    throw new Error('La orden fue creada pero no se encontro en la base de datos');
  }

  console.log('--- Verificacion de base de datos exitosa ---');
  console.log(`Confirmacion #: ${dbOrder.numeroConfirmacion}`);
  console.log(`Comprador: ${dbOrder.comprador.nombre} (${dbOrder.comprador.email})`);
  dbOrder.lineas.forEach((linea) => {
    console.log(`- ${linea.nombreProducto} x${linea.cantidad} (Precio unitario: S/ ${linea.precioUnitario})`);
  });
  console.log(`Total registrado en DB: S/ ${dbOrder.total}`);
}

/* istanbul ignore next */
if (require.main === module) {
  const prisma = new PrismaClient();
  runTest(prisma)
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
