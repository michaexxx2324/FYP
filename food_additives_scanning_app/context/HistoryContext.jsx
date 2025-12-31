import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const HistoryContext = createContext();

export const HistoryProvider = ({ children }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    try {
      const key = user ? `scanHistory_${user.userId}` : 'scanHistory_guest';
      const storedHistory = await AsyncStorage.getItem(key);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Failed to load history", error);
    }
  };

  const addToHistory = async (item) => {
    try {
      
      const newHistory = [item, ...history.filter(h => h.itemCode !== item.itemCode)];
      setHistory(newHistory);
      
      const key = user ? `scanHistory_${user.userId}` : 'scanHistory_guest';
      await AsyncStorage.setItem(key, JSON.stringify(newHistory));
    } catch (error) {
      console.error("Failed to save history", error);
    }
  };

  const removeFromHistory = async (itemCode) => {
    try {
      
      const newHistory = history.filter(h => h.itemCode !== itemCode);
      setHistory(newHistory);
      
      const key = user ? `scanHistory_${user.userId}` : 'scanHistory_guest';
      await AsyncStorage.setItem(key, JSON.stringify(newHistory));

      
      
      try {
        await fetch(`http://192.168.50.124:3000/api/DeleteScanHistory?itemCode=${itemCode}`, {
          method: 'DELETE',
        });
      } catch (serverError) {
        console.error("Failed to delete from server", serverError);
      }
    } catch (error) {
      console.error("Failed to remove from history", error);
    }
  };

  return (
    <HistoryContext.Provider value={{ history, addToHistory, removeFromHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => useContext(HistoryContext);
