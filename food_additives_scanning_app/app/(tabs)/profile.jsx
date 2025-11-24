import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';

export default function ProfileScreen() {
  const { i18n } = useLanguage();
  return (
    <View style={styles.container}>
      <Text>{i18n.profileScreen}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
