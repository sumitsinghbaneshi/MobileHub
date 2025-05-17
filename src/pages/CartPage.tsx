// src/pages/CartPage.tsx
import { Container, Typography } from "@mui/material";
import CartItems from "../features/cart/CartItems";

const CartPage = () => {
  return (
    <Container>
      <Typography variant="h4">Your Shopping Cart</Typography>
      <CartItems />
    </Container>
  );
};

export default CartPage;
