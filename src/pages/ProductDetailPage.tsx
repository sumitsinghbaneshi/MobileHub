// src/pages/ProductDetailPage.tsx
import { useParams } from "react-router-dom";
import { Typography } from "@mui/material";

const ProductDetailPage = () => {
  const { id } = useParams();

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Product Details: {id}
      </Typography>
      {/* Product details will be implemented later */}
    </>
  );
};

export default ProductDetailPage;
