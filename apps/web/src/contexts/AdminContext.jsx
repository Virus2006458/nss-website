import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentAdmin(session.user);
      }
      setInitialLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentAdmin(session.user);
      } else {
        setCurrentAdmin(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const adminLogin = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      setCurrentAdmin(data.user);
      return { success: true, admin: data.user };
    } catch (error) {
      console.error('Admin login error:', error);
      throw new Error('Invalid admin credentials');
    }
  };

  const adminLogout = async () => {
    await supabase.auth.signOut();
    setCurrentAdmin(null);
  };

  const value = {
    currentAdmin,
    isAdminAuthenticated: !!currentAdmin,
    adminLogin,
    adminLogout,
    initialLoading
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};