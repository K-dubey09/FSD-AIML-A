import { describe, it, expect, beforeEach } from 'vitest';
import { loadCart, saveCart } from '../utils/storage';

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads cart', () => {
    const cart = [{ id: 1, title: 'A', qty: 2 }];
    saveCart(cart);
    const loaded = loadCart();
    expect(loaded).toEqual(cart);
  });
});
