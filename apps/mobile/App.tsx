import { StatusBar } from 'expo-status-bar';
import { type ReactElement } from 'react';
import { useAuth } from './src/stores/auth';
import { SignInScreen } from './src/screens/SignInScreen';
import { HomeScreen } from './src/screens/HomeScreen';

export default function App(): ReactElement {
  const token = useAuth((s) => s.accessToken);
  return (
    <>
      {token ? <HomeScreen /> : <SignInScreen />}
      <StatusBar style="auto" />
    </>
  );
}
