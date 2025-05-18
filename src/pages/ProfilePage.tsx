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
  Button,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ChangePasswordDialog from '../components/ChangePasswordDialog';

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
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    fetchOrders();
    // Show change password dialog if user has temporary password
    if (user?.isTempPassword) {
      setShowChangePassword(true);
    }
  }, [user]);

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
              {user?.isTempPassword && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  You are using a temporary password. Please change it for security.
                </Alert>
              )}
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setShowChangePassword(true)}
                sx={{ mt: 2 }}
              >
                Change Password
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Order History
            </Typography>
            {orders.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No orders found.
              </Typography>
            ) : (
              <List>
                {orders.map((order) => (
                  <ListItem key={order.id} divider>
                    <ListItemText
                      primary={`Order #${order.id}`}
                      secondary={`Date: ${new Date(order.date).toLocaleDateString()}`}
                    />
                    <Typography variant="body1">
                      Total: ${order.total.toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            )}
          </Grid>
        </Grid>
      </Paper>
      <ChangePasswordDialog
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        isTempPassword={user?.isTempPassword}
      />
    </Container>
  );
};

export default ProfilePage; 