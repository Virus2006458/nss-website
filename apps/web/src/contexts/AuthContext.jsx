import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Check local storage for volunteer session
    const saved = localStorage.getItem('nss_volunteer');
    if (saved) {
      const parsedUser = JSON.parse(saved);
      setCurrentUser(parsedUser);
      
      // Quietly fetch fresh data from database to keep session up to date
      supabase.from('volunteers').select('*').eq('id', parsedUser.id).single()
        .then(({ data }) => {
          if (data) {
            setCurrentUser(data);
            localStorage.setItem('nss_volunteer', JSON.stringify(data));
          }
        });
    }
    setInitialLoading(false);
  }, []);

  const login = async (rollNumber) => {
    try {
      const { data: volunteer, error: fetchError } = await supabase
        .from('volunteers')
        .select('*')
        .eq('rollNumber', rollNumber)
        .single();
        
      if (fetchError || !volunteer) throw new Error('Invalid roll number');

      setCurrentUser(volunteer);
      localStorage.setItem('nss_volunteer', JSON.stringify(volunteer));
      
      return { success: true, user: volunteer };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid roll number or authentication failed');
    }
  };

  const logout = async () => {
    localStorage.removeItem('nss_volunteer');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    logout,
    initialLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};