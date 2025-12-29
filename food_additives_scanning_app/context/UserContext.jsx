import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    // Load VIP status from storage on app start
    const loadVipStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('isVip');
        if (value !== null) {
          setIsVip(JSON.parse(value));
        }
      } catch (e) {
        console.error('Failed to load VIP status', e);
      }
    };

    loadVipStatus();
  }, []);

  const setVipStatus = async (status) => {
    try {
      setIsVip(status);
      await AsyncStorage.setItem('isVip', JSON.stringify(status));
    } catch (e) {
      console.error('Failed to save VIP status', e);
    }
  };

  return (
    <UserContext.Provider value={{ isVip, setVipStatus }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
