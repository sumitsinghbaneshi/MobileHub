import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '../CartContext';
import { AuthProvider, useAuth } from '../AuthContext';
import axios from 'axios';
import { act } from 'react';
import React, { useRef, forwardRef, useImperativeHandle } from 'react';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Test component that uses both auth and cart contexts
const TestComponent = forwardRef((props, ref) => {
  const { isAuthenticated, login } = useAuth();
  const { cartItems, addToCart, removeFromCart, updateQuantity } = useCart();

  // Calculate total
  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  useImperativeHandle(ref, () => ({
    login,
    addToCart,
    removeFromCart,
    updateQuantity,
    cartItems,
    isAuthenticated,
    total,
  }));

  return (
    <div>
      <div data-testid="cart-total">${total.toFixed(2)}</div>
      <div data-testid="cart-count">{cartItems.length}</div>
      <button data-testid="login-button">Login</button>
      <button data-testid="add-button">Add Item</button>
      <button data-testid="remove-button">Remove Item</button>
      <button data-testid="update-button">Update Quantity</button>
    </div>
  );
});

const renderWithCart = () => {
  const ref = React.createRef<any>();
  const { unmount } = render(
    <AuthProvider>
      <CartProvider>
        <TestComponent ref={ref} />
      </CartProvider>
    </AuthProvider>
  );
  return { ref, unmount };
};

describe('CartContext', () => {
  let mockCart: any[] = [];
  let nextItemId = 1;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    mockCart = [];
    nextItemId = 1;

    mockedAxios.get.mockImplementation((url) => {
      if (url === 'http://localhost:3001/cart') {
        return Promise.resolve({ data: [...mockCart] });
      }
      if (url === 'http://localhost:3001/products/1') {
        return Promise.resolve({ 
          data: { 
            id: 1, 
            name: 'Test Product', 
            price: 10, 
            description: '', 
            image: '', 
            category: '', 
            stock: 10 
          } 
        });
      }
      return Promise.resolve({ data: [] });
    });

    mockedAxios.post.mockImplementation((url, body) => {
      if (url === 'http://localhost:3001/cart') {
        const newItem = { 
          id: nextItemId++, 
          productId: 1, 
          quantity: 1, 
          product: { 
            id: 1, 
            name: 'Test Product', 
            price: 10, 
            description: '', 
            image: '', 
            category: '', 
            stock: 10 
          } 
        };
        mockCart.push(newItem);
        return Promise.resolve({ data: newItem });
      }
      return Promise.resolve({ data: {} });
    });

    mockedAxios.patch.mockImplementation((url, body) => {
      const patchBody = body as any;
      if (url.startsWith('http://localhost:3001/cart/')) {
        const id = parseInt(url.split('/').pop()!);
        const itemIndex = mockCart.findIndex(i => i.id === id);
        if (itemIndex !== -1) {
          mockCart[itemIndex] = {
            ...mockCart[itemIndex],
            quantity: patchBody.quantity
          };
          return Promise.resolve({ data: mockCart[itemIndex] });
        }
      }
      return Promise.resolve({ data: {} });
    });

    mockedAxios.delete.mockImplementation((url) => {
      if (url.startsWith('http://localhost:3001/cart/')) {
        const id = parseInt(url.split('/').pop()!);
        mockCart = mockCart.filter(i => i.id !== id);
        return Promise.resolve({ data: {} });
      }
      return Promise.resolve({ data: {} });
    });
  });

  test('initial state is empty cart', async () => {
    const { ref } = renderWithCart();
    await act(async () => {
      await ref.current.login('user@mobilehub.com', 'user123');
    });
    await waitFor(() => {
      expect(ref.current.isAuthenticated).toBe(true);
    });
    await waitFor(() => {
      expect(ref.current.total).toBe(0);
    });
    expect(ref.current.cartItems.length).toBe(0);
  });

  test('adds item to cart', async () => {
    const { ref } = renderWithCart();
    await act(async () => {
      await ref.current.login('user@mobilehub.com', 'user123');
    });
    await waitFor(() => {
      expect(ref.current.isAuthenticated).toBe(true);
    });
    await act(async () => {
      await ref.current.addToCart(1);
    });
    await waitFor(() => {
      expect(ref.current.total).toBe(10);
      expect(ref.current.cartItems.length).toBe(1);
    });
  });

  test('removes item from cart', async () => {
    const { ref } = renderWithCart();
    await act(async () => {
      await ref.current.login('user@mobilehub.com', 'user123');
    });
    await waitFor(() => {
      expect(ref.current.isAuthenticated).toBe(true);
    });
    await act(async () => {
      await ref.current.addToCart(1);
    });
    await waitFor(() => {
      expect(ref.current.total).toBe(10);
      expect(ref.current.cartItems.length).toBe(1);
    });
    await act(async () => {
      await ref.current.removeFromCart(1);
    });
    await waitFor(() => {
      expect(ref.current.total).toBe(0);
      expect(ref.current.cartItems.length).toBe(0);
    });
  });

  test('updates item quantity', async () => {
    const { ref } = renderWithCart();
    await act(async () => {
      await ref.current.login('user@mobilehub.com', 'user123');
    });
    await waitFor(() => {
      expect(ref.current.isAuthenticated).toBe(true);
    });
    await act(async () => {
      await ref.current.addToCart(1);
    });
    await waitFor(() => {
      expect(ref.current.total).toBe(10);
      expect(ref.current.cartItems.length).toBe(1);
    });
    await act(async () => {
      await ref.current.updateQuantity(1, 2);
    });
    await waitFor(() => {
      expect(ref.current.total).toBe(20);
      expect(ref.current.cartItems.length).toBe(1);
    });
  });

  test('persists cart state after page reload', async () => {
    const { ref, unmount } = renderWithCart();
    await act(async () => {
      await ref.current.login('user@mobilehub.com', 'user123');
    });
    await waitFor(() => {
      expect(ref.current.isAuthenticated).toBe(true);
    });
    await act(async () => {
      await ref.current.addToCart(1);
    });
    await waitFor(() => {
      expect(ref.current.total).toBe(10);
      expect(ref.current.cartItems.length).toBe(1);
    });
    unmount();
    const { ref: ref2 } = renderWithCart();
    await act(async () => {
      await ref2.current.login('user@mobilehub.com', 'user123');
    });
    await waitFor(() => {
      expect(ref2.current.isAuthenticated).toBe(true);
    });
    await waitFor(() => {
      expect(ref2.current.total).toBe(10);
      expect(ref2.current.cartItems.length).toBe(1);
    });
  });

  test('handles multiple items in cart', async () => {
    const { ref } = renderWithCart();
    await act(async () => {
      await ref.current.login('user@mobilehub.com', 'user123');
    });
    await waitFor(() => {
      expect(ref.current.isAuthenticated).toBe(true);
    });
    await act(async () => {
      await ref.current.addToCart(1);
    });
    await waitFor(() => {
      expect(ref.current.total).toBe(10);
      expect(ref.current.cartItems.length).toBe(1);
    });
    await act(async () => {
      await ref.current.addToCart(1);
    });
    await waitFor(() => {
      expect(ref.current.total).toBe(20);
      expect(ref.current.cartItems.length).toBe(2);
    });
  });
}); 