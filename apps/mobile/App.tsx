import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { t } from './src/i18n';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('app.title')}</Text>
      <Text style={styles.subtitle}>{t('check.in')} / {t('check.out')}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#525252',
  },
});
