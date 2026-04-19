import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { toast } from 'react-hot-toast';

export interface AppUser {
  uid: string;
  email: string | null;
  username: string;
  role: 'user' | 'admin';
  xp: number;
  level: number;
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  streak: number;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: data.username || firebaseUser.displayName || 'Bằng Hữu',
          role: data.role || 'user',
          xp: data.xp || 0,
          level: data.level || 1,
          rank: data.rank || 'Bronze',
          streak: data.streak || 0,
        });
      } else {
        // Create new user (should be handled in signup, but fallback here)
        const isLeKimLam = firebaseUser.email?.startsWith('lekimlam') || false; // Quick hack for admin
        const newUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Tân binh',
          role: isLeKimLam ? 'admin' : 'user',
          xp: 0,
          level: 1,
          rank: 'Bronze',
          streak: 0,
        };
        await setDoc(userDocRef, {
          email: newUser.email,
          username: newUser.username,
          role: newUser.role,
          xp: newUser.xp,
          level: newUser.level,
          rank: newUser.rank,
          streak: newUser.streak,
          createdAt: new Date().toISOString()
        });
        setUser(newUser);
      }
    } catch (error) {
      console.error("Error fetching user data", error);
      toast.error("Không thể tải thông tin người dùng");
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await fetchUserData(auth.currentUser);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
