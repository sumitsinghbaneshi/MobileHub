// src/pages/HomePage.tsx
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Sample images for featured products
const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: 'Smartphone X',
    price: 799,
    description: 'Latest flagship smartphone with advanced features',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
  },
  {
    id: 2,
    name: 'Budget Phone Y',
    price: 299,
    description: 'Affordable smartphone with great performance',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
  },
  {
    id: 3,
    name: 'Phone Case A',
    price: 25,
    description: 'Premium protective case for your smartphone',
    image: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=500',
  },
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Welcome to MobileHub
              </Typography>
              <Typography variant="h5" paragraph>
                Your one-stop shop for mobile devices and accessories
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate('/products')}
                sx={{ mt: 2 }}
              >
                Shop Now
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
                alt="Mobile devices"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Products Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h3" component="h2" gutterBottom align="center">
          Featured Products
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {FEATURED_PRODUCTS.map((product) => (
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
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {product.description}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${product.price}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/products')}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Categories Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" gutterBottom align="center">
            Shop by Category
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {['Mobile', 'Accessory', 'Spare Part'].map((category) => (
              <Grid item xs={12} md={4} key={category}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      transition: 'transform 0.2s ease-in-out',
                    },
                  }}
                  onClick={() => navigate('/products')}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={
                      category === 'Mobile'
                        ? 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'
                        : category === 'Accessory'
                        ? 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=500'
                        : 'https://images.unsplash.com/photo-1583863788434-e58b8f6a2f74?w=500'
                    }
                    alt={category}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography variant="h5" component="div" align="center">
                      {category}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
