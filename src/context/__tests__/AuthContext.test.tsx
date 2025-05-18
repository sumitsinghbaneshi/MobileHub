import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';

// Test component that uses the auth context
const TestComponent = () => {
  const { isAuthenticated, user, login, logout, signup } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'authenticated' : 'not-authenticated'}
      </div>
      <div data-testid="user-role">
        {user?.role || 'no-role'}
      </div>
      <button
        onClick={() => login('user@mobilehub.com', 'user123')}
        data-testid="login-button"
      >
        Login
      </button>
      <button
        onClick={logout}
        data-testid="logout-button"
      >
        Logout
      </button>
      <button
        onClick={() => signup('newuser@mobilehub.com', 'password123')}
        data-testid="signup-button"
      >
        Signup
      </button>
    </div>
  );
};

const renderWithAuth = () => {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('initial state is not authenticated', () => {
    renderWithAuth();
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user-role')).toHaveTextContent('no-role');
  });

  test('successful login sets user role', async () => {
    renderWithAuth();
    await userEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-role')).toHaveTextContent('user');
    });
  });

  test('logout clears user role', async () => {
    renderWithAuth();
    // First login
    await userEvent.click(screen.getByTestId('login-button'));
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    // Then logout
    await userEvent.click(screen.getByTestId('logout-button'));
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      expect(screen.getByTestId('user-role')).toHaveTextContent('no-role');
    });
  });

  test('successful signup sets user role', async () => {
    renderWithAuth();
    await userEvent.click(screen.getByTestId('signup-button'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-role')).toHaveTextContent('user');
    });
  });

  test('auth state persists after page reload', async () => {
    const { unmount } = renderWithAuth();
    // First login
    await userEvent.click(screen.getByTestId('login-button'));
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-role')).toHaveTextContent('user');
    });

    // Unmount and remount to simulate page reload
    unmount();
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-role')).toHaveTextContent('user');
    });
  });
}); 