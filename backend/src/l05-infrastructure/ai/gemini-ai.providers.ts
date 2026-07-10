import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  LanguageModelProvider,
  CopilotProduct,
  CopilotResponse,
  IntentionData,
} from '../../l04-domain/ai/ai.interfaces';

const COPILOT_SYSTEM_PROMPT = `Eres "Aura AI", el asistente copiloto inteligente del marketplace "Aura". Tu rol es ayudar a los clientes a:

1. **Buscar productos**: Cuando el usuario pide buscar artículos por precio, categoría o nombre, analiza la lista de productos disponibles y devuelve los que coincidan.
2. **Navegar por la app**: Cuando el usuario quiere ir a una sección, redirigirlo a la ruta correcta.
3. **Agregar al carrito**: Cuando el usuario quiere agregar un producto al carrito.

RUTAS DISPONIBLES de la app:
- /catalog → Catálogo de productos
- /cart → Carrito de compras
- /profile → Mi perfil
- /profile/orders → Mis pedidos/órdenes
- /profile/favorites → Mis favoritos
- /profile/addresses → Mis direcciones
- /checkout → Checkout / Proceso de compra
- /products/{id} → Detalle de un producto específico

SIEMPRE responde en formato JSON válido con esta estructura exacta:
{
  "message": "Tu mensaje amigable al usuario en español",
  "action": {
    "type": "navigate" | "search_products" | "add_to_cart" | "none",
    "route": "/ruta" (solo si type es navigate),
    "productId": "id-del-producto" (solo si type es add_to_cart),
    "searchFilters": {
      "minPrice": número (opcional),
      "maxPrice": número (opcional),
      "category": "categoría" (opcional),
      "keyword": "palabra clave" (opcional)
    } (solo si type es search_products)
  },
  "products": [] (array de productos filtrados, solo cuando muestras resultados de búsqueda)
}

REGLAS:
- Sé amable, conciso y útil. Usa emojis moderadamente.
- Si el usuario pide ver productos con filtros de precio, filtra de la lista que te doy y devuélvelos en "products".
- Si el usuario quiere navegar (ir al carrito, ver pedidos, etc.), usa action type "navigate" con la ruta correcta.
- Si el usuario quiere agregar un producto al carrito y puedes identificar cuál, usa action type "add_to_cart" con el productId.
- Si el usuario solo saluda o hace una pregunta general, usa action type "none".
- Cuando devuelvas productos en "products", incluye máximo 6 resultados.
- Cada producto en "products" debe tener: id, nombre, descripcion (corta), precio (número), imageUrl (puede ser null), stock (número), categoria (string).
- SOLO responde JSON puro, sin markdown, sin \`\`\`json, sin texto extra.
`;

@Injectable()
export class GeminiLanguageModelProvider implements LanguageModelProvider {
  private readonly logger = new Logger(GeminiLanguageModelProvider.name);
  private readonly model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not found, Gemini provider will not work');
      return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async generateResponse(prompt: string, context?: any): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      this.logger.error('Error generating response from Gemini', error);
      return 'Lo siento, hubo un error al procesar tu solicitud. Intenta de nuevo.';
    }
  }

  async extractEntities(text: string): Promise<IntentionData> {
    try {
      const extractionPrompt = `Analiza el siguiente mensaje de un usuario de un marketplace e-commerce y extrae la intención y entidades.

Mensaje: "${text}"

Responde SOLO en JSON con esta estructura:
{
  "intent": "buscar_producto" | "navegar" | "agregar_carrito" | "consulta_general" | "saludo",
  "confidence": 0.0-1.0,
  "entities": [
    { "type": "precio_min" | "precio_max" | "categoria" | "keyword" | "ruta" | "producto_id", "value": "valor" }
  ]
}

Solo JSON puro, sin markdown.`;

      const result = await this.model.generateContent(extractionPrompt);
      const responseText = result.response.text().trim();
      
      // Clean potential markdown wrapping
      const cleaned = responseText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();

      return JSON.parse(cleaned);
    } catch (error) {
      this.logger.error('Error extracting entities', error);
      return {
        intent: 'unknown',
        confidence: 0,
        entities: [],
      };
    }
  }

  private getMockFallbackResponse(
    userMessage: string,
    products: CopilotProduct[],
  ): CopilotResponse {
    const text = userMessage.toLowerCase();
    
    // 1. Check Navigation Intents
    if (text.includes('carrito') || text.includes('cart') || text.includes('compra')) {
      return {
        message: '¡Por supuesto! Te llevo al carrito de compras de inmediato para que revises tus artículos.',
        action: { type: 'navigate', route: '/cart' },
        products: [],
      };
    }
    if (text.includes('pedido') || text.includes('orden') || text.includes('historial')) {
      return {
        message: 'Con gusto. Aquí puedes ver tu historial de pedidos y el estado de tus compras.',
        action: { type: 'navigate', route: '/profile/orders' },
        products: [],
      };
    }
    if (text.includes('perfil') || text.includes('usuario') || text.includes('cuenta')) {
      return {
        message: 'Entendido. Redirigiéndote a la sección de tu perfil.',
        action: { type: 'navigate', route: '/profile' },
        products: [],
      };
    }
    if (text.includes('favorito')) {
      return {
        message: 'Claro, vamos a ver tus productos guardados en favoritos.',
        action: { type: 'navigate', route: '/profile/favorites' },
        products: [],
      };
    }
    if (text.includes('catalogo') || text.includes('explorar') || text.includes('tienda') || text.includes('inicio') || text.includes('casa') || text.includes('principal')) {
      return {
        message: 'Volvamos a la página principal para seguir explorando el catálogo.',
        action: { type: 'navigate', route: '/catalog' },
        products: [],
      };
    }

    // 2. Check Add to Cart Intent
    if (text.includes('agrega') || text.includes('añad') || text.includes('comprar')) {
      // Find matching products
      const matched = products.filter(p => 
        text.includes(p.nombre.toLowerCase()) || 
        text.includes('silla') || 
        text.includes('sillon')
      );
      const product = matched[0] || products[0];

      if (product) {
        return {
          message: `¡Excelente elección! Añadiendo ${product.nombre} a tu carrito de compras de forma autónoma.`,
          action: { type: 'add_to_cart', productId: product.id },
          products: [product],
        };
      }
    }

    // 3. Check Search / Filter Intent
    if (text.includes('busca') || text.includes('filtr') || text.includes('oferta') || text.includes('silla') || text.includes('sillon') || text.includes('precio') || text.includes('dolar') || text.includes('dólar')) {
      let filtered = [...products];

      // Parse price ranges (e.g. 500 a 900)
      const prices = text.match(/\d+/g);
      let minPrice = 0;
      let maxPrice = 999999;
      if (prices && prices.length >= 2) {
        minPrice = Math.min(Number(prices[0]), Number(prices[1]));
        maxPrice = Math.max(Number(prices[0]), Number(prices[1]));
        filtered = filtered.filter(p => p.precio >= minPrice && p.precio <= maxPrice);
      } else if (prices && prices.length === 1) {
        if (text.includes('menor') || text.includes('menos') || text.includes('bajo')) {
          maxPrice = Number(prices[0]);
          filtered = filtered.filter(p => p.precio <= maxPrice);
        } else {
          minPrice = Number(prices[0]);
          filtered = filtered.filter(p => p.precio >= minPrice);
        }
      }

      // Keyword search
      if (text.includes('silla') || text.includes('sillon') || text.includes('sillón')) {
        filtered = filtered.filter(p => p.nombre.toLowerCase().includes('silla') || p.nombre.toLowerCase().includes('sillon'));
      }

      if (filtered.length > 0) {
        return {
          message: `He encontrado estos productos para ti que coinciden con tu búsqueda.`,
          action: { 
            type: 'search_products',
            searchFilters: {
              minPrice: minPrice > 0 ? minPrice : undefined,
              maxPrice: maxPrice < 999999 ? maxPrice : undefined,
            }
          },
          products: filtered.slice(0, 6),
        };
      }
    }

    // 4. Default general fallback response
    return {
      message: 'Hola, soy Aura AI. Mi cuota de conexión directa con Gemini se ha completado por hoy, pero sigo activo en modo offline. ¿Quieres que busque productos, te lleve al carrito o agregue artículos a tu compra?',
      action: { type: 'none' },
      products: [],
    };
  }

  async generateCopilotResponse(
    userMessage: string,
    products: CopilotProduct[],
    conversationHistory: Array<{ role: string; content: string }>,
  ): Promise<CopilotResponse> {
    try {
      // Build context with available products
      const productsSummary = products.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion.substring(0, 100),
        precio: p.precio,
        stock: p.stock,
        categoria: p.categoria,
        imageUrl: p.imageUrl || null,
      }));

      // Build conversation context
      const historyContext = conversationHistory
        .slice(-10) // last 10 messages for context
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n');

      const fullPrompt = `${COPILOT_SYSTEM_PROMPT}

PRODUCTOS DISPONIBLES EN LA TIENDA (usa estos datos para filtrar y responder):
${JSON.stringify(productsSummary, null, 0)}

HISTORIAL DE CONVERSACIÓN RECIENTE:
${historyContext}

MENSAJE ACTUAL DEL USUARIO:
${userMessage}

Responde SOLO con JSON válido:`;

      const result = await this.model.generateContent(fullPrompt);
      const responseText = result.response.text().trim();

      // Clean potential markdown wrapping
      const cleaned = responseText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();

      const parsed = JSON.parse(cleaned);

      return {
        message: parsed.message || 'No pude procesar tu solicitud.',
        action: parsed.action || { type: 'none' },
        products: Array.isArray(parsed.products) ? parsed.products : [],
      };
    } catch (error) {
      this.logger.error('Error generating copilot response', error);
      return this.getMockFallbackResponse(userMessage, products);
    }
  }
}
