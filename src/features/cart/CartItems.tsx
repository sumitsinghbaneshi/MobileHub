import { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { Delete, Add, Remove } from '@mui/icons-material';
import axios from 'axios';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    name: string;
    price: number;
    image: string;
  };
}

const CartItems = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get('http://localhost:3001/cart');
        setCartItems(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch cart items');
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await axios.patch(`http://localhost:3001/cart/${itemId}`, {
        quantity: newQuantity,
      });
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      setError('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await axios.delete(`http://localhost:3001/cart/${itemId}`);
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    } catch (err) {
      setError('Failed to remove item');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (cartItems.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6">Your cart is empty</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <List>
        {cartItems.map((item) => (
          <ListItem key={item.id} divider>
            <ListItemText
              primary={item.product.name}
              secondary={`$${item.product.price} x ${item.quantity}`}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <IconButton
                size="small"
                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              >
                <Remove />
              </IconButton>
              <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
              <IconButton
                size="small"
                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              >
                <Add />
              </IconButton>
            </Box>
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleRemoveItem(item.id)}
              >
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 4, textAlign: 'right' }}>
        <Typography variant="h6" gutterBottom>
          Total: ${calculateTotal().toFixed(2)}
        </Typography>
        <Button variant="contained" color="primary" size="large">
          Proceed to Checkout
        </Button>
      </Box>
    </Box>
  );
};

export default CartItems; 