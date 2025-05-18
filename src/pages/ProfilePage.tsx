import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface Order {
  id: number;
  date: string;
  items: Array<{
    productId: number;
    quantity: number;
    product: {
      name: string;
      price: number;
    };
  }>;
  total: number;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/orders');
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch order history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                <strong>Email:</strong> {user?.email}
              </Typography>
              <Typography variant="body1">
                <strong>Role:</strong> {user?.role}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Order History
            </Typography>
            {orders.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No orders found
              </Typography>
            ) : (
              <List>
                {orders.map((order) => (
                  <ListItem key={order.id} divider>
                    <ListItemText
                      primary={`Order #${order.id} - ${new Date(order.date).toLocaleDateString()}`}
                      secondary={
                        <>
                          {order.items.map((item) => (
                            <Typography key={item.productId} variant="body2">
                              {item.product.name} x {item.quantity} - ${item.product.price * item.quantity}
                            </Typography>
                          ))}
                          <Typography variant="subtitle1" sx={{ mt: 1 }}>
                            Total: ${order.total}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProfilePage; 