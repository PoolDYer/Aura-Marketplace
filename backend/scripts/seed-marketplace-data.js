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

  // Find the two sellers
  const seller1 = await prisma.usuario.findUnique({
    where: { email: 'tranpoolkenner1237@gmail.com' }
  });
  const seller2 = await prisma.usuario.findUnique({
    where: { email: 'tranpoolkenner123@gmail.com' }
  });

  if (!seller1 || !seller2) {
    throw new Error('Sellers not found. Please ensure users tranpoolkenner1237@gmail.com and tranpoolkenner123@gmail.com exist.');
  }

  console.log(`Found Seller 1: ${seller1.nombre} (${seller1.id})`);
  console.log(`Found Seller 2: ${seller2.nombre} (${seller2.id})`);

  // Clear existing products and categories to start fresh
  console.log('Cleaning up old products and categories...');
  await prisma.inventario.deleteMany({});
  await prisma.imagenPublicacion.deleteMany({});
  await prisma.publicacion.deleteMany({});
  await prisma.categoria.deleteMany({});

  // 6 Categories
  const categoriesData = [
    { nombre: 'Tecnología', descripcion: 'Dispositivos electrónicos y accesorios modernos.' },
    { nombre: 'Ropa y Calzado', descripcion: 'Prendas de vestir y calzado de última tendencia.' },
    { nombre: 'Hogar y Cocina', descripcion: 'Artículos para equipar y decorar tu hogar.' },
    { nombre: 'Libros', descripcion: 'Lecturas de ciencia, ficción, arte y desarrollo personal.' },
    { nombre: 'Deportes y Fitness', descripcion: 'Equipos y accesorios para entrenamiento físico.' },
    { nombre: 'Belleza y Cuidado Personal', descripcion: 'Productos para cuidado facial, capilar y cosméticos.' }
  ];

  console.log('Creating categories...');
  const categories = [];
  for (const cat of categoriesData) {
    const created = await prisma.categoria.create({ data: cat });
    categories.push(created);
  }
  console.log(`Created ${categories.length} categories.`);

  // 5 Products per category
  const productsByCategory = {
    'Tecnología': [
      { nombre: 'Smartphone Pro X', desc: 'Pantalla OLED de 6.7 pulgadas, 128GB de almacenamiento y cámara triple de 50MP.', precio: 899.99 },
      { nombre: 'Auriculares Inalámbricos Noise Cancelling', desc: 'Cancelación activa de ruido, batería de 30 horas y sonido premium de alta fidelidad.', precio: 149.99 },
      { nombre: 'Reloj Inteligente FitMax', desc: 'Monitoreo de ritmo cardíaco, GPS integrado y pantalla táctil AMOLED deportiva.', precio: 199.99 },
      { nombre: 'Laptop UltraSlim 14', desc: 'Procesador Intel i7 de última generación, 16GB RAM y 512GB SSD ultrarrápido.', precio: 1099.99 },
      { nombre: 'Teclado Mecánico RGB Gamer', desc: 'Interruptores mecánicos táctiles, retroiluminación RGB configurable y reposamuñecas.', precio: 79.99 }
    ],
    'Ropa y Calzado': [
      { nombre: 'Camiseta Algodón Orgánico', desc: 'Camiseta suave hecha de algodón 100% orgánico, corte clásico unisex.', precio: 24.99 },
      { nombre: 'Zapatillas Deportivas Runner', desc: 'Zapatillas ligeras con amortiguación premium para correr distancias medias y largas.', precio: 85.00 },
      { nombre: 'Chaqueta de Abrigo Impermeable', desc: 'Chaqueta resistente al viento y al agua, ideal para climas fríos y senderismo.', precio: 120.00 },
      { nombre: 'Pantalón Jean Slim Fit', desc: 'Pantalón vaquero de corte ajustado, elástico y cómodo para el día a día.', precio: 45.99 },
      { nombre: 'Sombrero Casual Unisex', desc: 'Sombrero ligero y ventilado para protección solar con estilo moderno.', precio: 19.99 }
    ],
    'Hogar y Cocina': [
      { nombre: 'Cafetera Espresso Automática', desc: 'Cafetera de 15 bares de presión con espumador de leche para capuchino y espresso.', precio: 179.99 },
      { nombre: 'Juego de Cuchillos de Acero', desc: 'Set de 6 cuchillos profesionales de acero inoxidable alemán con bloque de madera.', precio: 69.99 },
      { nombre: 'Aspiradora Robot Inteligente', desc: 'Navegación inteligente con sensor de obstáculos, programable y retorno automático a la base.', precio: 249.99 },
      { nombre: 'Lámpara de Escritorio LED', desc: 'Lámpara con 5 modos de brillo, puerto de carga USB y brazo articulado flexible.', precio: 29.99 },
      { nombre: 'Organizador de Alacena Multiuso', desc: 'Estante organizador de 3 niveles para especias y condimentos de cocina.', precio: 15.50 }
    ],
    'Libros': [
      { nombre: 'El Arte de Programar', desc: 'Un libro fundamental sobre algoritmos, estructuras de datos y buenas prácticas.', precio: 34.99 },
      { nombre: 'Misterio en la Niebla', desc: 'Novela de suspenso y misterio ambientada en un pequeño pueblo costero del norte.', precio: 14.99 },
      { nombre: 'Guía de Hábitos Saludables', desc: 'Una guía práctica para transformar tu rutina diaria mediante pequeños hábitos positivos.', precio: 18.00 },
      { nombre: 'Historia del Cosmos', desc: 'Un fascinante viaje por los secretos del universo, galaxias y agujeros negros.', precio: 28.50 },
      { nombre: 'Cocina Fácil para Principiantes', desc: 'Recetario paso a paso con más de 100 recetas deliciosas y rápidas de preparar.', precio: 22.00 }
    ],
    'Deportes y Fitness': [
      { nombre: 'Mancuernas Ajustables 20kg', desc: 'Par de mancuernas de peso ajustable con discos de hierro fundido y barra antideslizante.', precio: 59.99 },
      { nombre: 'Colchoneta de Yoga Antideslizante', desc: 'Colchoneta de 6mm de espesor fabricada con material ecológico TPE antideslizante.', precio: 25.00 },
      { nombre: 'Botella de Agua Térmica', desc: 'Botella de acero inoxidable de doble pared que mantiene bebidas frías por 24h o calientes por 12h.', precio: 19.99 },
      { nombre: 'Banda Elástica de Resistencia', desc: 'Set de 5 bandas de resistencia de látex natural con diferentes niveles de intensidad.', precio: 12.99 },
      { nombre: 'Cuerda para Saltar de Alta Velocidad', desc: 'Cuerda con rodamientos de bolas de acero, ajustable para entrenamientos de crossfit.', precio: 9.99 }
    ],
    'Belleza y Cuidado Personal': [
      { nombre: 'Crema Hidratante Facial', desc: 'Fórmula ligera con ácido hialurónico y extracto de aloe vera para todo tipo de piel.', precio: 21.99 },
      { nombre: 'Sérum de Vitamina C', desc: 'Sérum antioxidante iluminador que reduce manchas y aporta firmeza a la piel.', precio: 28.00 },
      { nombre: 'Champú Orgánico de Argán', desc: 'Champú nutritivo sin sulfatos que repara el cabello seco y dañado aportando brillo.', precio: 16.50 },
      { nombre: 'Protector Solar SPF 50+', desc: 'Protección de amplio espectro contra rayos UVA/UVB, toque seco e invisible.', precio: 19.50 },
      { nombre: 'Set de Brochas de Maquillaje Professional', desc: 'Estuche con 12 brochas de pelo sintético premium para rostro y ojos.', precio: 24.99 }
    ]
  };

  console.log('Seeding products...');
  let totalProducts = 0;

  for (const cat of categories) {
    const pList = productsByCategory[cat.nombre];
    if (!pList) continue;

    for (const p of pList) {
      // Create product for Seller 1
      const p1 = await prisma.publicacion.create({
        data: {
          nombre: `${p.nombre} (Vendedor A)`,
          descripcion: `${p.desc} Ofrecido por Vendedor A.`,
          precio: p.precio,
          estado: 'ACTIVA',
          vendedorId: seller1.id,
          categoriaId: cat.id
        }
      });
      // Create inventory for Seller 1
      await prisma.inventario.create({
        data: {
          publicacionId: p1.id,
          cantidad: 50
        }
      });
      // Create product for Seller 2
      const p2 = await prisma.publicacion.create({
        data: {
          nombre: `${p.nombre} (Vendedor B)`,
          descripcion: `${p.desc} Ofrecido por Vendedor B.`,
          precio: p.precio,
          estado: 'ACTIVA',
          vendedorId: seller2.id,
          categoriaId: cat.id
        }
      });
      // Create inventory for Seller 2
      await prisma.inventario.create({
        data: {
          publicacionId: p2.id,
          cantidad: 40
        }
      });
      totalProducts += 2;
    }
  }

  console.log(`Successfully seeded ${totalProducts} products across 6 categories for 2 sellers.`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
