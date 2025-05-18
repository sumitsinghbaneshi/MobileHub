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
  addToCart: (productId: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

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
      const response = await axios.get('http://localhost:3001/cart');
      setCartItems(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to fetch cart items');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to cart');
    }

    try {
      setLoading(true);
      // First get the product details
      const productResponse = await axios.get(`http://localhost:3001/products/${productId}`);
      const product = productResponse.data;

      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.productId === productId);
      if (existingItem) {
        // Update quantity if item exists
        await updateQuantity(existingItem.id, existingItem.quantity + 1);
        return;
      }

      // Add new item to cart
      const response = await axios.post('http://localhost:3001/cart', {
        productId,
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
      await axios.delete(`http://localhost:3001/cart/${itemId}`);
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
      const response = await axios.patch(`http://localhost:3001/cart/${itemId}`, {
        quantity,
      });
      setCartItems(prevItems =>
        prevItems.map(item => (item.id === itemId ? response.data : item))
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