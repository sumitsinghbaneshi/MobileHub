import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Link } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

// Mock the page components
jest.mock('../pages/HomePage', () => () => <div data-testid="home-page">Welcome to MobileHub</div>);
jest.mock('../pages/ProductsPage', () => () => <div data-testid="products-page">Our Products</div>);
jest.mock('../pages/CategoriesPage', () => () => <div data-testid="categories-page">Categories</div>);
jest.mock('../pages/LoginPage', () => () => <div data-testid="login-page">Login</div>);
jest.mock('../pages/SignupPage', () => () => <div data-testid="signup-page">Sign Up</div>);
jest.mock('../pages/ForgotPasswordPage', () => () => <div data-testid="forgot-password-page">Forgot Password</div>);
jest.mock('../pages/CartPage', () => () => <div data-testid="cart-page">Cart Page</div>);
jest.mock('../pages/AdminPanel', () => () => <div data-testid="admin-panel">Admin Panel</div>);

// Mock the Layout component to avoid navigation issues
jest.mock('../components/Layout', () => {
  return function MockLayout({ children }: { children: React.ReactNode }) {
    return (
      <div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/admin">Admin</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
          <Link to="/forgot-password">Forgot Password</Link>
        </nav>
        <main>{children}</main>
      </div>
    );
  };
});

// Mock the Router component to avoid nested routers
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

const renderApp = (initialPath = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('App Component', () => {
  it('renders home page by default', () => {
    renderApp();
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('navigates to products page', async () => {
    renderApp('/products');
    expect(screen.getByTestId('products-page')).toBeInTheDocument();
  });

  it('navigates to categories page', async () => {
    renderApp('/categories');
    expect(screen.getByTestId('categories-page')).toBeInTheDocument();
  });

  it('redirects to login page when accessing protected route', async () => {
    renderApp('/cart');
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('redirects to login page when accessing admin route', async () => {
    renderApp('/admin');
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('navigates to login page', async () => {
    renderApp('/login');
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('navigates to signup page', async () => {
    renderApp('/signup');
    expect(screen.getByTestId('signup-page')).toBeInTheDocument();
  });

  it('navigates to forgot password page', async () => {
    renderApp('/forgot-password');
    expect(screen.getByTestId('forgot-password-page')).toBeInTheDocument();
  });
}); 