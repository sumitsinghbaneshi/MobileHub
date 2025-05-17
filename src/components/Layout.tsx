// src/components/Layout.tsx
import { Container, CssBaseline, Toolbar } from "@mui/material";
import AppBar from "./AppBar";
import Footer from "./Footer";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <CssBaseline />
      <AppBar />
      <Toolbar /> {/* For spacing below app bar */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {children}
      </Container>
      <Footer />
    </>
  );
};

export default Layout;
