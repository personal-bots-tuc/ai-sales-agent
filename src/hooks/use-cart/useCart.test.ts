import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from './index';

describe('useCart', () => {
  it('initializes with empty cart', () => {
    const { result } = renderHook(() => useCart());
    expect(result.current.items).toEqual([]);
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem('product-1', 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual({ product: 'product-1', quantity: 2 });
    expect(result.current.isEmpty).toBe(false);
    expect(result.current.itemCount).toBe(2);
  });

  it('increments quantity when adding same product', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem('product-1', 2);
      result.current.addItem('product-1', 3);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.itemCount).toBe(5);
  });

  it('removes item from cart', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem('product-1', 2);
      result.current.addItem('product-2', 1);
      result.current.removeItem('product-1');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product).toBe('product-2');
    expect(result.current.itemCount).toBe(1);
  });

  it('clears cart', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem('product-1', 2);
      result.current.clear();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.itemCount).toBe(0);
  });

  it('returns correct itemCount for multiple items', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem('product-1', 2);
      result.current.addItem('product-2', 3);
    });

    expect(result.current.itemCount).toBe(5);
  });
});
