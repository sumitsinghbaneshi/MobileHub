import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock: number;
}

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  error: string | null;
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearError: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE_URL = '/api';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCartItems();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/cart`);
      setCartItems(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching cart items:', err);
      setError('Failed to fetch cart items');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to cart');
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/cart`, {
        productId: product.id,
        quantity: 1,
        product,
      });
      setCartItems(prevItems => [...prevItems, response.data]);
      setError(null);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    if (!isAuthenticated) {
      throw new Error('Please login to remove items from cart');
    }

    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/cart/${itemId}`);
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
      setError(null);
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError('Failed to remove item from cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (!isAuthenticated) {
      throw new Error('Please login to update cart');
    }

    if (quantity < 1) {
      await removeFromCart(itemId);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.patch(`${API_BASE_URL}/cart/${itemId}`, { quantity });
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? response.data : item
        )
      );
      setError(null);
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Failed to update quantity');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        loading,
        error,
        clearError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 