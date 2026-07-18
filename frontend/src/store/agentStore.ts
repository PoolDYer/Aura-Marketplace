import { create } from 'zustand';
import api from '../lib/axios';

export type AgentState = 'INACTIVO' | 'ESCUCHANDO' | 'PROCESANDO' | 'CONFIRMANDO' | 'ERROR';

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
  route?: string;
  productId?: string;
  searchFilters?: {
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    keyword?: string;
  };
}

export interface Message {
  id: string;
  role: 'USER' | 'AGENT' | 'SYSTEM';
  content: string;
  createdAt: Date;
  intention?: any;
  action?: CopilotAction;
  products?: CopilotProduct[];
}

// Navigation callback - set by App component
let navigationCallback: ((path: string) => void) | null = null;

export function setNavigationCallback(cb: (path: string) => void) {
  navigationCallback = cb;
}

// Cart action callback - set by App component
let addToCartCallback: ((productId: string, cantidad: number, preview?: any) => Promise<void>) | null = null;

export function setAddToCartCallback(cb: (productId: string, cantidad: number, preview?: any) => Promise<void>) {
  addToCartCallback = cb;
}

interface AgentStore {
  isOpen: boolean;
  state: AgentState;
  messages: Message[];
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  setState: (state: AgentState) => void;
  addMessage: (msg: Omit<Message, 'id' | 'createdAt'>) => void;
  sendTextMessage: (text: string) => Promise<void>;
  sendVoiceMessage: (audioBlob: Blob) => Promise<void>;
  fetchHistory: () => Promise<void>;
  executeAction: (action: CopilotAction, products?: CopilotProduct[]) => void;
}

function speakText(text: string) {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find a Spanish voice
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(
      (v) => v.lang.startsWith('es') && v.localService,
    ) || voices.find((v) => v.lang.startsWith('es'));

    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    window.speechSynthesis.speak(utterance);
  }
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const responseMessage = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;

  if (Array.isArray(responseMessage)) {
    return responseMessage.join(' ');
  }

  return responseMessage || fallback;
};

const getAudioFilename = (audioBlob: Blob) => {
  if (audioBlob.type.includes('mp4')) return 'audio.mp4';
  if (audioBlob.type.includes('ogg')) return 'audio.ogg';
  return 'audio.webm';
};

export const useAgentStore = create<AgentStore>((set, get) => ({
  isOpen: false,
  state: 'INACTIVO',
  messages: [],

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  setState: (state) => set({ state }),

  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...msg, id: Date.now().toString(), createdAt: new Date() },
      ],
    })),

  executeAction: (action: CopilotAction, products?: CopilotProduct[]) => {
    if (!action || action.type === 'none') return;

    if (action.type === 'navigate' && action.route && navigationCallback) {
      // Small delay so user sees the response first
      setTimeout(() => {
        navigationCallback!(action.route!);
      }, 1200);
    }

    if (action.type === 'add_to_cart' && action.productId && addToCartCallback) {
      const product = products?.find((p) => p.id === action.productId);
      addToCartCallback(action.productId, 1, product ? {
        nombre: product.nombre,
        precio: product.precio,
        imageUrl: product.imageUrl,
        stock: product.stock,
      } : undefined);
    }
  },

  sendTextMessage: async (text: string) => {
    const { addMessage, setState, executeAction } = get();
    addMessage({ role: 'USER', content: text });
    setState('PROCESANDO');

    try {
      const res = await api.post('/agent/text', { text });
      const { message, action, products, intention } = res.data;

      addMessage({
        role: 'AGENT',
        content: message,
        intention,
        action,
        products,
      });

      // Speak the response
      speakText(message);

      // Execute action if present
      if (action) {
        executeAction(action, products);
      }

      setState('INACTIVO');
    } catch (error) {
      console.error(error);
      setState('ERROR');
      addMessage({
        role: 'SYSTEM',
        content: getApiErrorMessage(error, 'Hubo un error de conexion. Intenta de nuevo.'),
      });
      setTimeout(() => setState('INACTIVO'), 3000);
    }
  },

  sendVoiceMessage: async (audioBlob: Blob) => {
    const { addMessage, setState, executeAction } = get();

    if (audioBlob.size === 0) {
      addMessage({
        role: 'SYSTEM',
        content: 'No se detectó audio. Graba unos segundos y presiona Detener para enviarlo.',
      });
      setState('INACTIVO');
      return;
    }

    setState('PROCESANDO');

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, getAudioFilename(audioBlob));

      const res = await api.post('/agent/voice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { transcribedText, message, action, products, intention } = res.data;

      addMessage({
        role: 'USER',
        content: transcribedText || '🎤 Mensaje de voz',
      });
      addMessage({
        role: 'AGENT',
        content: message,
        intention,
        action,
        products,
      });

      // Speak the response
      speakText(message);

      // Execute action if present
      if (action) {
        executeAction(action, products);
      }

      setState('INACTIVO');
    } catch (error) {
      console.error(error);
      setState('ERROR');
      addMessage({
        role: 'SYSTEM',
        content: getApiErrorMessage(error, 'No pude procesar el audio. Intenta de nuevo.'),
      });
      setTimeout(() => setState('INACTIVO'), 3000);
    }
  },

  fetchHistory: async () => {
    try {
      const res = await api.get('/agent/history');
      if (res.data.length > 0 && res.data[0].mensajes) {
        const historyMsgs = res.data[0].mensajes.map((m: any) => ({
          id: m.id,
          role: m.rol,
          content: m.contenido,
          createdAt: new Date(m.createdAt),
        }));
        set({ messages: historyMsgs });
      }
    } catch {
      // Background history loading should never block the app shell.
    }
  },
}));
