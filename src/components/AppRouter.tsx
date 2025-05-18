// src/components/AppRouter.tsx
import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import HomePage from "../pages/HomePage";
import ProductsPage from "../pages/ProductsPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout><HomePage /></Layout>}>
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
