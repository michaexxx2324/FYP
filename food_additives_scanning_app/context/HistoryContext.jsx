import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HistoryContext = createContext();

export const HistoryProvider = ({ children }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem('scanHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history", error);
    }
  };

  const addToHistory = async (item) => {
    try {
      // Avoid duplicates at the top of the list
      const newHistory = [item, ...history.filter(h => h.itemCode !== item.itemCode)];
      setHistory(newHistory);
      await AsyncStorage.setItem('scanHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error("Failed to save history", error);
    }
  };

  const removeFromHistory = async (itemCode) => {
    try {
      // 1. Remove locally
      const newHistory = history.filter(h => h.itemCode !== itemCode);
      setHistory(newHistory);
      await AsyncStorage.setItem('scanHistory', JSON.stringify(newHistory));

      // 2. Remove from backend (ScanHistory collection)
      // Using the same IP as configured in other files
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
