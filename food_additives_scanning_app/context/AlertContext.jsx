import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { API_URL } from '@env';

const AlertContext = createContext();

export const useAlerts = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const { language } = useLanguage();

  const fetchAlerts = async () => {
    try {
      const langParam = language === 'zh' ? 'tc' : 'en';
      console.log(`Fetching alerts context from ${API_URL}/alerts?lang=${langParam}&t=${new Date().getTime()}`);
      const response = await fetch(`${API_URL}/alerts?lang=${langParam}&t=${new Date().getTime()}`);
      const data = await response.json();
      if (data.success) {
        console.log(`[AlertContext] Fetched ${data.data.length} alerts for language: ${language}`);
        setAlerts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch alerts context:', error);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [language]);

  return (
    <AlertContext.Provider value={{ alerts, setAlerts, fetchAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};
