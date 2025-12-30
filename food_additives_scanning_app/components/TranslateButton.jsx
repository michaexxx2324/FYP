import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

export default function TranslateButton({ style, textStyle }) {
  const { toggleLanguage, language } = useLanguage();

  return (
    <TouchableOpacity onPress={toggleLanguage} style={[styles.button, style]}>
      <Text style={[styles.text, textStyle]}>
        {language === 'en' ? '中' : 'ENG'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 15,
    marginRight: 10,
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});
