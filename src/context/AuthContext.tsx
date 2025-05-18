import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  role: 'admin' | 'user';
  isTempPassword?: boolean;
}

interface RegisteredUser extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<string>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Test credentials
const TEST_USERS: RegisteredUser[] = [
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

// Initialize registered users from localStorage or use test users
const getInitialRegisteredUsers = (): RegisteredUser[] => {
  const savedUsers = localStorage.getItem('registeredUsers');
  return savedUsers ? JSON.parse(savedUsers) : TEST_USERS;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check if user data exists in localStorage
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(getInitialRegisteredUsers);

  // Update localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Update localStorage when registered users change
  useEffect(() => {
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  const login = async (email: string, password: string) => {
    console.log('Login attempt:', { email, password });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const foundUser = registeredUsers.find(
      (u: RegisteredUser) => u.email === email && u.password === password
    );

    console.log('Found user:', foundUser);

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      // Check if this is a temporary password (8 characters, alphanumeric)
      const isTempPassword = /^[a-zA-Z0-9]{8}$/.test(foundUser.password);
      setUser({ ...userWithoutPassword, isTempPassword });
      console.log('Setting user:', { ...userWithoutPassword, isTempPassword });
    } else {
      console.log('Login failed: Invalid credentials');
      throw new Error('Invalid email or password');
    }
  };

  const signup = async (email: string, password: string) => {
    console.log('Signup attempt:', { email, password });
    console.log('Current registered users:', registeredUsers.map(u => u.email));
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if email already exists
    if (registeredUsers.some((u: RegisteredUser) => u.email === email)) {
      console.log('Email already registered:', email);
      throw new Error('Email already registered');
    }

    // Create new user with 'user' role
    const newUser: RegisteredUser = {
      id: registeredUsers.length + 1,
      email,
      password,
      role: 'user' as const
    };

    // Add the new user to registered users
    setRegisteredUsers((prevUsers: RegisteredUser[]) => [...prevUsers, newUser]);

    // In a real app, this would create a new user in the database
    console.log('User registered successfully');
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
  };

  const resetPassword = async (email: string) => {
    console.log('Password reset attempt:', { email });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if email exists in registered users
    const userExists = registeredUsers.some((u: RegisteredUser) => u.email === email);
    console.log('User exists:', userExists);

    if (!userExists) {
      console.log('Password reset failed: Email not found');
      throw new Error('Email not found');
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Update the user's password in registeredUsers
    setRegisteredUsers(prevUsers => 
      prevUsers.map(user => 
        user.email === email 
          ? { ...user, password: tempPassword }
          : user
      )
    );

    // In a real app, this would send a password reset email
    console.log('Password reset successful. Your temporary password is:', tempPassword);
    
    // Return the temporary password for testing purposes
    return tempPassword;
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const foundUser = registeredUsers.find(
      (u: RegisteredUser) => u.email === user.email && u.password === currentPassword
    );

    if (!foundUser) {
      throw new Error('Current password is incorrect');
    }

    // Update the password in registeredUsers
    setRegisteredUsers(prevUsers => 
      prevUsers.map(u => 
        u.email === user.email 
          ? { ...u, password: newPassword }
          : u
      )
    );

    // Update user state to remove isTempPassword flag
    setUser(prev => prev ? { ...prev, isTempPassword: false } : null);
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
        changePassword,
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