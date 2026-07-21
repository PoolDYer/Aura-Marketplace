import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgentStore, CopilotProduct, CopilotAction } from '../store/agentStore';
import { useCartStore } from '../store/cartStore';
import {
  Mic,
  Send,
  X,
  User,
  StopCircle,
  ShoppingCart,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Package,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from './ui/button';

/* ───── Product Card ───── */
function ProductCard({
  product,
  onView,
  onAddToCart,
}: {
  product: CopilotProduct;
  onView: () => void;
  onAddToCart: () => void;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-[#d6c3b0]/20 bg-white p-3 transition-all hover:border-[#845400]/30 hover:shadow-md">
      {/* Image */}
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[#f6f2f4]">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.nombre}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-6 w-6 text-[#d6c3b0]" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col">
        <h4 className="truncate text-[13px] font-semibold text-[#211527]">
          {product.nombre}
        </h4>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-[#524535]">
          {product.descripcion}
        </p>
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-[14px] font-bold text-[#845400]">
            S/ {Number(product.precio).toFixed(2)}
          </span>
          <div className="flex gap-1">
            <button
              onClick={onView}
              className="rounded-lg bg-[#f6f2f4] px-2 py-1 text-[10px] font-medium text-[#845400] transition-colors hover:bg-[#f1edef]"
              title="Ver producto"
            >
              <ExternalLink className="h-3 w-3" />
            </button>
            {product.stock > 0 && (
              <button
                onClick={onAddToCart}
                className="rounded-lg bg-[#845400] px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-[#704700]"
                title="Agregar al carrito"
              >
                <ShoppingCart className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───── Action Button ───── */
function ActionButton({
  action,
  onClick,
}: {
  action: CopilotAction;
  onClick: () => void;
}) {
  if (!action || action.type === 'none') return null;

  const labels: Record<string, string> = {
    navigate: '🧭 Ir ahora',
    search_products: '🔍 Ver resultados',
    add_to_cart: '🛒 Agregar al carrito',
  };

  return (
    <button
      onClick={onClick}
      className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#ffb95a] to-[#006b5b] px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-all hover:brightness-95 hover:shadow-md active:scale-95"
    >
      {labels[action.type] || 'Ejecutar'}
      <ArrowRight className="h-3 w-3" />
    </button>
  );
}

/* ───── Main Chat Component ───── */
export function ChatAgente() {
  const {
    isOpen,
    closeChat,
    messages,
    state,
    sendTextMessage,
    sendVoiceMessage,
    setState,
  } = useAgentStore();
  const { addItem } = useCartStore();
  const navigate = useNavigate();

  const [text, setText] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, state]);

  // Load voices for Web Speech API
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  if (!isOpen) return null;

  const handleSendText = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || state === 'PROCESANDO') return;
    sendTextMessage(text);
    setText('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
      ].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || 'audio/webm' });
        sendVoiceMessage(blob);
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        setMediaRecorder(null);
        setState('INACTIVO');
      };

      recorder.start();
      setMediaRecorder(recorder);
      setState('ESCUCHANDO');
    } catch (err) {
      console.error('Error accessing microphone', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    closeChat();
  };

  const handleAddToCart = async (product: CopilotProduct) => {
    try {
      await addItem(product.id, 1, {
        nombre: product.nombre,
        precio: product.precio,
        imageUrl: product.imageUrl,
        stock: product.stock,
      });
      navigate('/cart');
      closeChat();
    } catch (err) {
      console.error('Error adding to cart from chat', err);
    }
  };

  const handleActionClick = (action: CopilotAction, products?: CopilotProduct[]) => {
    if (action.type === 'navigate' && action.route) {
      handleNavigate(action.route);
    } else if (action.type === 'add_to_cart' && action.productId && products) {
      const product = products.find((p) => p.id === action.productId);
      if (product) handleAddToCart(product);
    }
  };

  const toggleTts = () => {
    if (ttsEnabled) {
      window.speechSynthesis?.cancel();
    }
    setTtsEnabled(!ttsEnabled);
  };

  return (
    <div className="fixed bottom-20 right-6 z-50 flex h-[560px] w-[400px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-2xl border border-[#d6c3b0]/30 bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#ffb95a] via-[#845400] to-[#006b5b] p-4 text-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-[14px] leading-tight">Aura Copilot</h3>
            <p className="text-[10px] font-medium text-white/80">
              {state === 'PROCESANDO'
                ? 'Pensando...'
                : state === 'ESCUCHANDO'
                  ? 'Escuchando...'
                  : 'Tu asistente inteligente'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTts}
            className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title={ttsEnabled ? 'Silenciar voz' : 'Activar voz'}
          >
            {ttsEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={closeChat}
            className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-[#FAF6F8] to-white p-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f6f2f4]">
              <Sparkles className="h-8 w-8 text-[#845400]" />
            </div>
            <h4 className="text-[15px] font-semibold text-[#211527]">
              ¡Hola! Soy tu Copilot 👋
            </h4>
            <p className="text-[12px] leading-5 text-[#524535]">
              Puedo buscar productos, llevarte a cualquier sección, o agregar artículos a tu
              carrito. ¡Solo dime qué necesitas!
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                'Busca articulos entre S/ 500 y S/ 900',
                'Llévame al carrito',
                '¿Qué productos hay?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setText('');
                    sendTextMessage(suggestion);
                  }}
                  className="rounded-xl border border-[#d6c3b0]/40 bg-[#fffaf6] px-3 py-1.5 text-[11px] font-medium text-[#845400] transition-all hover:border-[#845400]/30 hover:bg-[#f6f2f4] active:scale-95"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id}>
            {/* Message Bubble */}
            <div
              className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 ${
                  msg.role === 'USER'
                    ? 'bg-gradient-to-br from-[#845400] to-[#704700] text-white rounded-tr-sm'
                    : msg.role === 'SYSTEM'
                      ? 'bg-red-50 text-red-600 border border-red-100 mx-auto text-sm'
                      : 'bg-white border border-[#d6c3b0]/20 text-[#211527] rounded-tl-sm shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {msg.role === 'AGENT' && (
                    <Sparkles className="w-3.5 h-3.5 text-[#845400]" />
                  )}
                  {msg.role === 'USER' && (
                    <User className="w-3.5 h-3.5 text-white opacity-70" />
                  )}
                  <span className="text-[10px] opacity-60">
                    {msg.createdAt.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                {/* Action button */}
                {msg.role === 'AGENT' && msg.action && msg.action.type !== 'none' && (
                  <ActionButton
                    action={msg.action}
                    onClick={() => handleActionClick(msg.action!, msg.products)}
                  />
                )}
              </div>
            </div>

            {/* Product Cards */}
            {msg.role === 'AGENT' &&
              msg.products &&
              msg.products.length > 0 && (
                <div className="mt-2 ml-1 space-y-2">
                  <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-[#845400]">
                    Productos encontrados ({msg.products.length})
                  </p>
                  {msg.products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onView={() => handleNavigate(`/products/${product.id}`)}
                      onAddToCart={() => handleAddToCart(product)}
                    />
                  ))}
                </div>
              )}
          </div>
        ))}

        {state === 'PROCESANDO' && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-[#d6c3b0]/20 bg-white p-3 shadow-sm">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#845400] [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#845400] [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#845400] [animation-delay:300ms]" />
              </div>
              <span className="ml-1 text-[12px] text-[#524535]/70">Procesando tu solicitud...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#d6c3b0]/20 bg-white p-3">
        {state === 'ESCUCHANDO' ? (
          <div className="flex flex-col items-center justify-center py-4 gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-red-500 shadow-lg">
                <Mic className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-red-500 font-medium text-[13px] animate-pulse">
              Escuchando...
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={stopRecording}
              className="rounded-xl border-red-200 hover:bg-red-50 hover:text-red-600 text-[12px]"
            >
              <StopCircle className="w-4 h-4 mr-1" />
              Detener
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSendText} className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe un mensaje..."
              disabled={state === 'PROCESANDO'}
              className="flex-1 rounded-xl border border-[#d6c3b0]/30 bg-[#f6f2f4] px-4 py-2.5 text-[13px] text-[#211527] transition-all placeholder:text-[#524535]/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#845400]/30 disabled:opacity-50"
            />
            {text.trim() ? (
              <Button
                type="submit"
                size="icon"
                disabled={state === 'PROCESANDO'}
                className="h-10 w-10 rounded-xl bg-gradient-to-r from-[#ffb95a] to-[#006b5b] shadow-sm hover:brightness-95"
              >
                <Send className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={startRecording}
                disabled={state === 'PROCESANDO'}
                className="h-10 w-10 rounded-xl border-[#d6c3b0]/40 text-[#524535] transition-all hover:border-[#845400]/30 hover:bg-[#f6f2f4] hover:text-[#845400]"
              >
                <Mic className="w-4 h-4" />
              </Button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
