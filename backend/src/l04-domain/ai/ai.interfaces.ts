export interface CopilotProduct {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imageUrl?: string;
  stock: number;
  categoria: string;
}

export interface CopilotAction {
  type: 'navigate' | 'search_products' | 'add_to_cart' | 'none';
  route?: string;          // For navigate actions
  productId?: string;      // For add_to_cart actions
  searchFilters?: {        // For search_products actions
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    keyword?: string;
  };
}

export interface CopilotResponse {
  message: string;
  action: CopilotAction;
  products: CopilotProduct[];
}

export interface IntentionData {
  intent: string;
  confidence: number;
  entities: Array<{ type: string; value: string }>;
}

export interface LanguageModelProvider {
  generateResponse(prompt: string, context?: any): Promise<string>;
  extractEntities(text: string): Promise<IntentionData>;
  generateCopilotResponse(
    userMessage: string,
    products: CopilotProduct[],
    conversationHistory: Array<{ role: string; content: string }>,
  ): Promise<CopilotResponse>;
}

export interface SpeechToTextProvider {
  transcribe(audioBuffer: Buffer, mimeType?: string): Promise<string>;
}

export interface TextToSpeechProvider {
  synthesize(text: string): Promise<Buffer>;
}
