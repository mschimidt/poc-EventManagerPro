import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  loginDemo: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Only update if not in demo mode to prevent overwriting
      if (!isDemo) {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [isDemo]);

  const loginDemo = () => {
    setIsDemo(true);
    // Create a mock user object cast as Firebase User
    setUser({
      uid: 'demo-user-123',
      email: 'demo@exemplo.com',
      displayName: 'Usuário Demo',
      emailVerified: true,
      isAnonymous: true,
      providerData: [],
      metadata: {},
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => '',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({}),
      phoneNumber: null,
      photoURL: null,
      providerId: 'demo'
    } as unknown as User);
  };

  const logout = async () => {
    if (isDemo) {
      setIsDemo(false);
      setUser(null);
    } else {
      await signOut(auth);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, loginDemo }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};