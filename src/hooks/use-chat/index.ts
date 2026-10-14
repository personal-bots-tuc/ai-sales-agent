import { useState, useCallback, useEffect, useRef } from 'react';
import { sendChatMessage } from '../../api/bot/bot';

interface UseChatOptions {
  slug: string;
  botKey: string;
  sessionId: string;
  businessName?: string;
  onOrder?: (_order: {
    publicCode: string;
    total: number;
    items: Array<{ name: string; quantity: number; subtotal: number }>;
  }) => void;
  onCustomer?: (_customer: {
    publicCode: string;
    customerName: string | null;
    paymentIntent: 'cash' | 'transfer' | null;
  }) => void;
}

export function useChat({ slug, botKey, sessionId, onOrder, onCustomer }: UseChatOptions) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>(
    []
  );
  const [isTyping, setIsTyping] = useState(false);
  // AbortController del stream en curso: al desmontar o cambiar de sesión se
  // aborta y la conexión HTTP se libera (no mantiene Railway despierto).
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  // Cambio de sesión: reset de estado en render (patrón "derived state") y
  // abort del stream en efecto (los refs no se tocan durante el render).
  const [prevSessionId, setPrevSessionId] = useState(sessionId);
  const sessionChanged = prevSessionId !== sessionId;
  if (sessionChanged) {
    setPrevSessionId(sessionId);
    setMessages([]);
    setIsTyping(false);
  }
  useEffect(() => {
    if (sessionChanged) stop();
  }, [sessionChanged, stop]);

  const sendMessage = useCallback(
    async (text: string) => {
      // Un solo stream a la vez: el nuevo aborta al anterior.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setMessages(prev => [...prev, { role: 'user', content: text }]);
      setIsTyping(true);

      try {
        await sendChatMessage(
          {
            slug,
            botKey,
            sessionId,
            message: text,
            onText: (content: string) => {
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'assistant') {
                  return [...prev.slice(0, -1), { ...last, content: last.content + content }];
                }
                return [...prev, { role: 'assistant', content }];
              });
            },
            onToolCall: () => {},
            onOrder: onOrder
              ? o => {
                  onOrder(o);
                }
              : undefined,
            onCustomer: onCustomer
              ? c => {
                  onCustomer(c);
                }
              : undefined,
            onDone: () => {
              setIsTyping(false);
            },
            onError: (msg: string) => {
              setMessages(prev => [...prev, { role: 'assistant', content: msg }]);
              setIsTyping(false);
            },
          },
          { signal: controller.signal }
        );
      } catch (err) {
        if (controller.signal.aborted) return; // abortado por desmontaje/nuevo mensaje
        void err;
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'No pudimos conectar con el asistente. Probá de nuevo en un momento.',
          },
        ]);
        setIsTyping(false);
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [slug, botKey, sessionId, onOrder, onCustomer]
  );

  const setGreeting = useCallback((greeting: string) => {
    setMessages(prev => [...prev, { role: 'assistant', content: greeting }]);
  }, []);

  return { messages, isTyping, sendMessage, setGreeting, stop, historyLoaded: true };
}
