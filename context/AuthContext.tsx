import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { getUsers, addUser, saveSession, getSession, clearSession } from '../services/storageService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (name: string, email: string, pass: string, profileType: User['profileType']) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sessionUser = getSession();
    if (sessionUser) {
      setUser(sessionUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, pass: string): Promise<User> => {
    const users = getUsers();
    const foundUser = users.find(u => u.email === email && u.passwordHash === pass); // In real app, compare hashed password
    if (!foundUser) {
      throw new Error("Credenciais inválidas");
    }
    setUser(foundUser);
    saveSession(foundUser);
    return foundUser;
  }, []);

  const register = useCallback(async (name: string, email: string, pass: string, profileType: User['profileType']): Promise<User> => {
    const users = getUsers();
    if (users.some(u => u.email === email)) {
      throw new Error("Usuário com este e-mail já existe");
    }
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      passwordHash: pass, // In real app, hash this password
      profileType,
    };
    addUser(newUser);
    setUser(newUser);
    saveSession(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};