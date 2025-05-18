// src/pages/ProductsPage.tsx
import { Container, Typography } from '@mui/material';
import ProductList from '../features/products/ProductList';

const ProductsPage = () => {
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Our Products
      </Typography>
      <ProductList />
    </Container>
  );
};

export default ProductsPage;
