// src/pages/CheckoutPage.tsx
import { Container, Typography } from "@mui/material";
import CheckoutStepper from "../features/checkout/CheckoutStepper";

const CheckoutPage = () => {
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Checkout
      </Typography>
      <CheckoutStepper />
    </Container>
  );
};

export default CheckoutPage;
