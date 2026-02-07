import React, { createContext, useContext, useEffect, useState } from 'react';
// FIX: Using v8 compat API. Removed named imports for functions.
import type { User } from 'firebase/auth';
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
    // FIX: Switched to the v8 namespaced `onAuthStateChanged` method.
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
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
      // FIX: Switched to the v8 namespaced `signOut` method.
      await auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, loginDemo }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
