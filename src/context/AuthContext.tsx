import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Test credentials
const TEST_USERS = [
  {
    id: 1,
    email: 'admin@mobilehub.com',
    password: 'admin123',
    role: 'admin' as const,
  },
  {
    id: 2,
    email: 'user@mobilehub.com',
    password: 'user123',
    role: 'user' as const,
  },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check if user data exists in localStorage
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Update localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    console.log('Login attempt:', { email, password });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const foundUser = TEST_USERS.find(
      u => u.email === email && u.password === password
    );

    console.log('Found user:', foundUser);

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      console.log('Setting user:', userWithoutPassword);
    } else {
      console.log('Login failed: Invalid credentials');
      throw new Error('Invalid email or password');
    }
  };

  const signup = async (email: string, password: string) => {
    console.log('Signup attempt:', { email, password });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if email already exists
    if (TEST_USERS.some(u => u.email === email)) {
      throw new Error('Email already registered');
    }

    // In a real app, this would create a new user in the database
    console.log('User registered successfully');
  };

  const resetPassword = async (email: string) => {
    console.log('Password reset attempt:', { email });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if email exists
    if (!TEST_USERS.some(u => u.email === email)) {
      throw new Error('Email not found');
    }

    // In a real app, this would send a password reset email
    console.log('Password reset email sent');
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        signup,
        resetPassword,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 