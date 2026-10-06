import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useShop } from './index';

// Mock the bot API
vi.mock('../../api/bot/bot', () => ({
  getBotConfig: vi.fn(),
}));

const { getBotConfig } = await import('../../api/bot/bot');

describe('useShop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading true initially', () => {
    const { result } = renderHook(() => useShop('test-shop', 'test-key'));
    expect(result.current.loading).toBe(true);
    expect(result.current.config).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('returns loading false when no slug or botKey', () => {
    const { result } = renderHook(() => useShop('', ''));
    expect(result.current.loading).toBe(false);
    expect(result.current.config).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('loads config successfully', async () => {
    const mockConfig = {
      available: true,
      businessName: 'Test Shop',
      greeting: '¡Hola! ¿En qué te ayudo?',
      quickReplies: ['Catálogo', 'Pedidos'],
      whatsappNumber: '+5491112345678',
      transferInfo: { alias: 'test.alias', cbu: '1234567890123456789012' },
    };

    vi.mocked(getBotConfig).mockResolvedValue(mockConfig);

    const { result } = renderHook(() => useShop('test-shop', 'test-key'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.config).toEqual(mockConfig);
    expect(result.current.error).toBeNull();
  });

  it('handles error correctly', async () => {
    vi.mocked(getBotConfig).mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useShop('test-shop', 'test-key'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.config).toBeNull();
    expect(result.current.error).toBe('Not found');
  });

  it('cancels previous request when slug or botKey changes', async () => {
    let resolveFirst: (value: any) => void;
    const firstPromise = new Promise(resolve => {
      resolveFirst = resolve;
    });

    vi.mocked(getBotConfig)
      .mockReturnValueOnce(firstPromise)
      .mockResolvedValueOnce({ available: true, businessName: 'Second Shop' });

    const { result, rerender } = renderHook(({ slug, botKey }) => useShop(slug, botKey), {
      initialProps: { slug: 'first-shop', botKey: 'first-key' },
    });

    // Change props before first request resolves
    rerender({ slug: 'second-shop', botKey: 'second-key' });

    // Resolve first request
    resolveFirst!({ available: true, businessName: 'First Shop' });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Should have second shop's config (first was cancelled)
    expect(result.current.config?.businessName).toBe('Second Shop');
  });
});
