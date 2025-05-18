import { Grid, Card, CardContent, CardMedia, Typography, Button, Box, CircularProgress, Alert, Snackbar } from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock: number;
}

// Sample product images
const SAMPLE_IMAGES = {
  'Smartphone X': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
  'Budget Phone Y': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
  'Flagship Phone Z': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
  'Phone Case A': 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=500',
  'Wireless Charger B': 'https://images.unsplash.com/photo-1583863788434-e58b8f6a2f74?w=500',
  'Screen Replacement Kit': 'https://images.unsplash.com/photo-1583863788434-e58b8f6a2f74?w=500',
};

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/products');
      // Add sample images to products
      const productsWithImages = response.data.map((product: Product) => ({
        ...product,
        image: SAMPLE_IMAGES[product.name as keyof typeof SAMPLE_IMAGES] || product.image,
      }));
      setProducts(productsWithImages);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/products' } } });
      return;
    }

    try {
      await addToCart(product);
      setSnackbar({ open: true, message: 'Item added to cart successfully!' });
    } catch (err) {
      console.error('Error adding to cart:', err);
      if (err instanceof Error) {
        setSnackbar({ open: true, message: err.message });
      } else {
        setSnackbar({ open: true, message: 'Failed to add item to cart' });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
    <>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.description}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                  ${product.price}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </>
  );
};

export default ProductList; 