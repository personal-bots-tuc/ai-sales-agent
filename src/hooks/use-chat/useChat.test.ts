import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChat } from './index';

// Mock the bot API
vi.mock('../../api/bot/bot', () => ({
  sendChatMessage: vi.fn(),
}));

const { sendChatMessage } = await import('../../api/bot/bot');

describe('useChat', () => {
  const mockOptions = {
    slug: 'test-shop',
    botKey: 'test-key',
    sessionId: 'test-session',
    businessName: 'Test Shop',
    onOrder: vi.fn(),
    onCustomer: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sendChatMessage).mockResolvedValue(undefined);
  });

  it('initializes with empty messages and not typing', () => {
    const { result } = renderHook(() => useChat(mockOptions));
    expect(result.current.messages).toEqual([]);
    expect(result.current.isTyping).toBe(false);
    expect(result.current.historyLoaded).toBe(true);
  });

  it('sends message and updates state', async () => {
    const { result } = renderHook(() => useChat(mockOptions));

    // Mock the onText callback to simulate streaming response
    vi.mocked(sendChatMessage).mockImplementation(async params => {
      params.onText?.('Hello');
      params.onDone?.();
    });

    await act(async () => {
      await result.current.sendMessage('Hola');
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toEqual({ role: 'user', content: 'Hola' });
    expect(result.current.messages[1]).toEqual({ role: 'assistant', content: 'Hello' });
    expect(result.current.isTyping).toBe(false);
  });

  it('sets isTyping to true while sending', async () => {
    let resolveSend: () => void;
    const sendPromise = new Promise<void>(resolve => {
      resolveSend = resolve;
    });

    vi.mocked(sendChatMessage).mockImplementation(async params => {
      await sendPromise;
      params.onDone?.();
    });

    const { result } = renderHook(() => useChat(mockOptions));

    act(() => {
      result.current.sendMessage('Hola');
    });

    expect(result.current.isTyping).toBe(true);

    await act(async () => {
      resolveSend!();
      await sendPromise;
    });

    expect(result.current.isTyping).toBe(false);
  });

  it('handles error correctly', async () => {
    vi.mocked(sendChatMessage).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useChat(mockOptions));

    await act(async () => {
      await result.current.sendMessage('Hola');
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].content).toContain('No pudimos conectar');
    expect(result.current.isTyping).toBe(false);
  });

  it('setGreeting adds assistant message', () => {
    const { result } = renderHook(() => useChat(mockOptions));

    act(() => {
      result.current.setGreeting('¡Bienvenido!');
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toEqual({ role: 'assistant', content: '¡Bienvenido!' });
  });

  it('calls onOrder callback when order event received', async () => {
    vi.mocked(sendChatMessage).mockImplementation(async params => {
      params.onOrder?.({
        publicCode: 'ORD-123',
        total: 5000,
        items: [{ name: 'Producto 1', quantity: 2, subtotal: 5000 }],
      });
      params.onDone?.();
    });

    const { result } = renderHook(() => useChat(mockOptions));

    await act(async () => {
      await result.current.sendMessage('Quiero comprar');
    });

    expect(mockOptions.onOrder).toHaveBeenCalledWith({
      publicCode: 'ORD-123',
      total: 5000,
      items: [{ name: 'Producto 1', quantity: 2, subtotal: 5000 }],
    });
  });

  it('calls onCustomer callback when customer event received', async () => {
    vi.mocked(sendChatMessage).mockImplementation(async params => {
      params.onCustomer?.({
        publicCode: 'ORD-123',
        customerName: 'Juan',
        paymentIntent: 'cash',
      });
      params.onDone?.();
    });

    const { result } = renderHook(() => useChat(mockOptions));

    await act(async () => {
      await result.current.sendMessage('Mi nombre es Juan');
    });

    expect(mockOptions.onCustomer).toHaveBeenCalledWith({
      publicCode: 'ORD-123',
      customerName: 'Juan',
      paymentIntent: 'cash',
    });
  });
});
