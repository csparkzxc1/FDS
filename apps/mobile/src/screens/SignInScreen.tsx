import { useState, type ReactElement } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { api, ApiError } from '../api/client';
import { useAuth } from '../stores/auth';
import { t } from '../i18n';

export function SignInScreen(): ReactElement {
  const setTokens = useAuth((s) => s.setTokens);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setLoading(true);
    try {
      const tokens = await api.signIn({ email, password });
      setTokens(tokens);
    } catch (err) {
      Alert.alert(t('auth.signIn'), err instanceof ApiError ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('app.title')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('auth.email')}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder={t('auth.password')}
        secureTextEntry
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.button} onPress={onSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? '…' : t('auth.signIn')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fafafa' },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 32, textAlign: 'center' },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  button: {
    backgroundColor: '#171717',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
});
