import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../src/l05-infrastructure/database/prisma.service';
import { ConversationsService } from '../src/l02-agent/conversations.service';
import { AgentService } from '../src/l02-agent/agent.service';
import { PrismaProductRepository } from '../src/l05-infrastructure/database/prisma-product-repository.adapter';
import { PrismaConversationRepository } from '../src/l05-infrastructure/database/prisma-conversation-repository.adapter';
import { PrismaUserRepository } from '../src/l05-infrastructure/database/prisma-user-repository.adapter';
import { LanguageModelProvider, CopilotProduct } from '../src/l04-domain/ai/ai.interfaces';

describe('Agent Pipeline Internal Integration Test', () => {
  jest.setTimeout(25000);
  let prisma: PrismaService;
  let agentService: AgentService;

  const testEmailAgent = 'agent-pipeline-buyer@aura.com';
  const testProductId = 'agent-pipe-prod-id';
  let testUserId: string;

  // Mock LanguageModelProvider to return a static CopilotResponse
  const mockLanguageModelProvider: Partial<LanguageModelProvider> = {
    generateCopilotResponse: jest.fn().mockImplementation(async (
      message: string,
      products: CopilotProduct[],
      history: any[],
    ) => {
      return {
        message: '¡Excelente! Agregué el producto a tu carrito de compras.',
        action: {
          type: 'add_to_cart',
          productId: testProductId,
        },
      };
    }),
  };

  const mockSpeechToTextProvider = {
    transcribe: jest.fn(),
  };

  const mockTextToSpeechProvider = {
    synthesize: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        PrismaService,
        ConversationsService,
        AgentService,
        {
          provide: 'IProductRepository',
          useClass: PrismaProductRepository,
        },
        {
          provide: 'IConversationRepository',
          useClass: PrismaConversationRepository,
        },
        {
          provide: 'IUserRepository',
          useClass: PrismaUserRepository,
        },
        {
          provide: 'LanguageModelProvider',
          useValue: mockLanguageModelProvider,
        },
        {
          provide: 'SpeechToTextProvider',
          useValue: mockSpeechToTextProvider,
        },
        {
          provide: 'TextToSpeechProvider',
          useValue: mockTextToSpeechProvider,
        },
      ],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    agentService = moduleRef.get(AgentService);

    await prisma.$connect();
    await cleanup();

    // 1. Create a test user
    const user = await prisma.usuario.create({
      data: {
        nombre: 'Agent Pipe User',
        email: testEmailAgent,
        passwordHash: 'hash',
        rol: 'COMPRADOR',
        estado: 'ACTIVO',
      },
    });
    testUserId = user.id;

    // 2. Create a test product
    const category = await prisma.categoria.upsert({
      where: { id: 'agent-pipe-cat' },
      update: {},
      create: {
        id: 'agent-pipe-cat',
        nombre: 'Agent Cat',
        descripcion: 'Tests',
        activa: true,
      },
    });

    await prisma.publicacion.create({
      data: {
        id: testProductId,
        nombre: 'Agent Pipe Chair',
        descripcion: 'Testing chair',
        precio: 50.0,
        estado: 'ACTIVA',
        vendedorId: user.id,
        categoriaId: category.id,
      },
    });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function cleanup() {
    // Delete in order of dependencies: intencion -> mensaje -> conversacion -> sesion -> publicacion -> usuario
    await prisma.intencion.deleteMany({
      where: {
        mensaje: {
          conversacion: {
            sesion: { usuario: { email: testEmailAgent } },
          },
        },
      },
    });

    await prisma.mensaje.deleteMany({
      where: {
        conversacion: {
          sesion: { usuario: { email: testEmailAgent } },
        },
      },
    });

    await prisma.conversacion.deleteMany({
      where: {
        sesion: { usuario: { email: testEmailAgent } },
      },
    });

    await prisma.sesion.deleteMany({
      where: { usuario: { email: testEmailAgent } },
    });

    await prisma.publicacion.deleteMany({
      where: { id: testProductId },
    });

    await prisma.usuario.deleteMany({
      where: { email: testEmailAgent },
    });
  }

  it('should process a text message, save to db, and record intentions and entities', async () => {
    const textMsg = 'Agrega la silla al carrito';

    // 1. Process message through agent service
    const result = await agentService.processTextMessage(testUserId, textMsg);

    expect(result).toBeDefined();
    expect(result.message).toContain('Agregué el producto');
    expect(result.action.type).toBe('add_to_cart');
    expect(result.action.productId).toBe(testProductId);

    // 2. Retrieve conversation from database
    const dbSession = await prisma.sesion.findFirst({
      where: { usuarioId: testUserId },
      include: {
        conversaciones: {
          include: {
            mensajes: {
              orderBy: { createdAt: 'asc' },
              include: {
                intenciones: {
                  include: { entidades: true },
                },
              },
            },
          },
        },
      },
    });

    expect(dbSession).toBeDefined();
    expect(dbSession?.conversaciones).toHaveLength(1);

    const messages = dbSession?.conversaciones[0].mensajes;
    expect(messages).toHaveLength(2); // User message + Assistant message

    const userMessage = messages?.[0];
    expect(userMessage?.contenido).toBe(textMsg);
    expect(userMessage?.rol).toBe('USER');

    const assistantMessage = messages?.[1];
    expect(assistantMessage?.contenido).toBe(result.message);
    expect(assistantMessage?.rol).toBe('AGENT');

    // 3. Verify that the intention and entities were mapped and saved
    expect(userMessage?.intenciones).toHaveLength(1);
    const intention = userMessage?.intenciones[0];
    expect(intention?.nombre).toBe('agregar_carrito');
    expect(intention?.entidades).toHaveLength(1);

    const entity = intention?.entidades[0];
    expect(entity?.tipo).toBe('producto_id');
    expect(entity?.valor).toBe(testProductId);
  });
});
