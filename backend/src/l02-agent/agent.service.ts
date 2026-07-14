import { Injectable, Logger, Inject, BadRequestException } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import {
  LanguageModelProvider,
  SpeechToTextProvider,
  TextToSpeechProvider,
  CopilotProduct,
} from '../l04-domain/ai/ai.interfaces';
import { IProductRepository } from '../l04-domain/ports/product-repository.interface';
import { IConversationRepository } from '../l04-domain/ports/conversation-repository.interface';
import { EstadoPublicacion } from '../l04-domain/products/product.enums';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private conversationsService: ConversationsService,
    @Inject('IProductRepository') private readonly productRepo: IProductRepository,
    @Inject('IConversationRepository') private readonly conversationRepo: IConversationRepository,
    @Inject('LanguageModelProvider') private llm: LanguageModelProvider,
    @Inject('SpeechToTextProvider') private stt: SpeechToTextProvider,
    @Inject('TextToSpeechProvider') private tts: TextToSpeechProvider,
  ) {}

  /**
   * Obtiene todos los productos activos de la BD como contexto para el copiloto
   */
  private async getProductContext(): Promise<CopilotProduct[]> {
    try {
      const products = await this.productRepo.findActiveProducts();

      return products.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: Number(p.precio),
        imageUrl: p.imagenes?.[0]?.url || undefined,
        stock: Math.max(
          (p.inventario?.cantidad ?? 0) - (p.inventario?.cantidadReservada ?? 0),
          0,
        ),
        categoria: p.categoria?.nombre || 'Sin categoría',
      }));
    } catch (error) {
      this.logger.error('Error fetching product context', error);
      return [];
    }
  }

  /**
   * Obtiene el historial de conversación reciente para dar contexto al copiloto
   */
  private async getConversationMessages(
    conversationId: string,
  ): Promise<Array<{ role: string; content: string }>> {
    try {
      const messages = await this.conversationRepo.findMessagesByConversation(conversationId, 20);

      return messages.map((m) => ({
        role: m.rol,
        content: m.contenido,
      }));
    } catch (error) {
      this.logger.error('Error fetching conversation messages', error);
      return [];
    }
  }

  private mapResponseToIntention(copilotResponse: any) {
    const action = copilotResponse.action || { type: 'none' };
    const entities: Array<{ type: string; value: string }> = [];
    let intent = 'consulta_general';

    if (action.type === 'navigate') {
      intent = 'navegar';
      if (action.route) {
        entities.push({ type: 'ruta', value: action.route });
      }
    } else if (action.type === 'add_to_cart') {
      intent = 'agregar_carrito';
      if (action.productId) {
        entities.push({ type: 'producto_id', value: action.productId });
      }
    } else if (action.type === 'search_products') {
      intent = 'buscar_producto';
      if (action.searchFilters) {
        const filters = action.searchFilters;
        if (filters.minPrice !== undefined) {
          entities.push({ type: 'precio_min', value: String(filters.minPrice) });
        }
        if (filters.maxPrice !== undefined) {
          entities.push({ type: 'precio_max', value: String(filters.maxPrice) });
        }
        if (filters.category) {
          entities.push({ type: 'categoria', value: filters.category });
        }
        if (filters.keyword) {
          entities.push({ type: 'keyword', value: filters.keyword });
        }
      }
    }

    return {
      intent,
      confidence: 0.95,
      entities,
    };
  }

  async processTextMessage(userId: string, text: string) {
    this.logger.log(`Processing text message for user ${userId}: ${text}`);

    // 1. Get Session & Conversation
    const { conversation } = await this.conversationsService.getOrCreateActiveSession(userId);

    // 2. Save User Message
    const userMessage = await this.conversationsService.saveMessage(conversation.id, 'USER', text);

    // 3. Get product context and conversation history
    const products = await this.getProductContext();
    const history = await this.getConversationMessages(conversation.id);

    // 4. Generate Copilot Response with full context (ONLY ONE LLM CALL NOW!)
    const copilotResponse = await this.llm.generateCopilotResponse(text, products, history);

    // 5. Map Copilot JSON to Intention data and save
    const intentionData = this.mapResponseToIntention(copilotResponse);
    await this.conversationsService.saveIntentionAndEntities(userMessage.id, intentionData);

    // 6. Save AI Message
    await this.conversationsService.saveMessage(conversation.id, 'AGENT', copilotResponse.message);

    return {
      message: copilotResponse.message,
      action: copilotResponse.action,
      products: copilotResponse.products,
      intention: intentionData,
    };
  }

  async processVoiceMessage(userId: string, audioBuffer: Buffer) {
    this.logger.log(`Processing voice message for user ${userId}`);

    // 1. STT: Audio -> Text
    const text = await this.stt.transcribe(audioBuffer);

    // Check if transcription failed or returned an error message
    if (
      !text ||
      text.startsWith('Error al transcribir') ||
      text.startsWith('No se pudo transcribir')
    ) {
      throw new BadRequestException(text || 'Error al transcribir el audio.');
    }

    // 2. Process as Text (gets full copilot response)
    const response = await this.processTextMessage(userId, text);

    return {
      transcribedText: text,
      message: response.message,
      action: response.action,
      products: response.products,
      intention: response.intention,
    };
  }
}
