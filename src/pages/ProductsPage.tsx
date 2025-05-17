// src/pages/ProductsPage.tsx
import { Typography } from "@mui/material";
import ProductList from "../features/products/ProductList";

const ProductsPage = () => {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Our Products
      </Typography>
      <ProductList />
    </>
  );
};

export default ProductsPage;
