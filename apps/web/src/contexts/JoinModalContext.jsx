import React, { createContext, useContext, useState } from 'react';

const JoinModalContext = createContext(null);

export const JoinModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <JoinModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </JoinModalContext.Provider>
  );
};

export const useJoinModal = () => {
  const context = useContext(JoinModalContext);
  if (!context) {
    throw new Error('useJoinModal must be used within JoinModalProvider');
  }
  return context;
};