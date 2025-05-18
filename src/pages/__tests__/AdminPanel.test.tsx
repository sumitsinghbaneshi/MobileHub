import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPanel from '../AdminPanel';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import axios from 'axios';
import { ReactNode } from 'react';
import { act } from 'react';

// Mock axios
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

// Mock the auth context
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { role: 'admin' }
  }),
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>
}));

// Mock the cart context
jest.mock('../../context/CartContext', () => ({
  useCart: () => ({
    cartItems: [],
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn()
  }),
  CartProvider: ({ children }: { children: ReactNode }) => <>{children}</>
}));

describe('AdminPanel Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Mock successful API responses
    (axios.get as jest.Mock).mockResolvedValue({ data: [] });
    (axios.post as jest.Mock).mockResolvedValue({ data: { imageUrl: '/uploads/test.png' } });
  });

  it('renders admin panel with add product form', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <CartProvider>
            <AdminPanel />
          </CartProvider>
        </AuthProvider>
      );
    });

    // Wait for the loading state to finish
    await waitFor(() => {
      expect(screen.getByText('Products')).toBeInTheDocument();
    });

    // Click the Add Product button to open the form
    await act(async () => {
      fireEvent.click(screen.getByText('Add Product'));
    });

    // Wait for the dialog to open and check if form fields are present
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Check if form fields are present
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Add New Product');
    
    // Wait for form fields to be rendered
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/stock/i)).toBeInTheDocument();
    });
  });

  it('handles product form submission', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <CartProvider>
            <AdminPanel />
          </CartProvider>
        </AuthProvider>
      );
    });

    // Wait for the loading state to finish
    await waitFor(() => {
      expect(screen.getByText('Products')).toBeInTheDocument();
    });

    // Click the Add Product button to open the form
    await act(async () => {
      fireEvent.click(screen.getByText('Add Product'));
    });

    // Wait for the dialog to open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Fill in the form fields
    const nameInput = screen.getByLabelText(/name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const priceInput = screen.getByLabelText(/price/i);
    const stockInput = screen.getByLabelText(/stock/i);

    await act(async () => {
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Test Product');
      await userEvent.clear(descriptionInput);
      await userEvent.type(descriptionInput, 'Test Description');
      await userEvent.clear(priceInput);
      await userEvent.type(priceInput, '99.99');
      await userEvent.clear(stockInput);
      await userEvent.type(stockInput, '10');
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText('Add'));
    });

    // Verify that axios.post was called with the correct data
    await waitFor(() => {
      expect((axios.post as jest.Mock)).toHaveBeenCalledWith(
        'http://localhost:3001/products',
        expect.objectContaining({
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          stock: 10
        })
      );
    });
  });

  it('handles image upload', async () => {
    // Mock the axios.post response
    (axios.post as jest.Mock).mockResolvedValueOnce({ data: { imageUrl: '/uploads/test.png' } });

    await act(async () => {
      render(
        <AuthProvider>
          <CartProvider>
            <AdminPanel />
          </CartProvider>
        </AuthProvider>
      );
    });

    // Wait for the loading state to finish
    await waitFor(() => {
      expect(screen.getByText('Products')).toBeInTheDocument();
    });

    // Click the Add Product button to open the form
    await act(async () => {
      fireEvent.click(screen.getByText('Add Product'));
    });

    // Wait for the dialog to open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Fill in required form fields
    const nameInput = screen.getByLabelText(/name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const priceInput = screen.getByLabelText(/price/i);
    const stockInput = screen.getByLabelText(/stock/i);

    await act(async () => {
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Test Product');
      await userEvent.clear(descriptionInput);
      await userEvent.type(descriptionInput, 'Test Description');
      await userEvent.clear(priceInput);
      await userEvent.type(priceInput, '99.99');
      await userEvent.clear(stockInput);
      await userEvent.type(stockInput, '10');
    });

    // Create a test file
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    
    // Find the file input and upload button
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
    const uploadButton = screen.getByText('Upload Image');
    
    // Click the upload button to trigger the file input
    await act(async () => {
      fireEvent.click(uploadButton);
    });

    // Simulate file selection
    await act(async () => {
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(fileInput);
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText('Add'));
    });

    // Wait for the upload to complete and verify axios.post was called for the upload
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3001/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data'
          })
        })
      );
    }, { timeout: 3000 });

    // Optionally, check that one of the calls was to /products
    expect(
      (axios.post as jest.Mock).mock.calls.some(
        ([url]) => url === 'http://localhost:3001/products'
      )
    ).toBe(true);
  });
}); 