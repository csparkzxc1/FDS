import { supabase } from './supabase';
import { IS_DEV_BYPASS, MOCK_USER } from '@/utils/devMode';
import type { AuthUser } from '@/types';

export type AuthProvider = 'email' | 'apple' | 'kakao';

export interface SignInResult {
  user: AuthUser;
}

export async function signInWithEmail(email: string, password: string): Promise<SignInResult> {
  if (IS_DEV_BYPASS) {
    return { user: { id: MOCK_USER.id, email: MOCK_USER.email, displayName: MOCK_USER.display_name, avatarUrl: null } };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('No user returned');

  return {
    user: {
      id: data.user.id,
      email: data.user.email ?? '',
      displayName: data.user.user_metadata?.display_name ?? null,
      avatarUrl: data.user.user_metadata?.avatar_url ?? null,
    },
  };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<SignInResult> {
  if (IS_DEV_BYPASS) {
    return { user: { id: MOCK_USER.id, email, displayName, avatarUrl: null } };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) throw error;
  if (!data.user) throw new Error('No user returned');

  await upsertUserProfile(data.user.id, email, displayName);

  return {
    user: {
      id: data.user.id,
      email: data.user.email ?? '',
      displayName,
      avatarUrl: null,
    },
  };
}

export async function signInWithApple(): Promise<SignInResult> {
  // expo-apple-authentication is imported dynamically to avoid crashing on Android
  const AppleAuth = await import('expo-apple-authentication');
  const credential = await AppleAuth.signInAsync({
    requestedScopes: [
      AppleAuth.AppleAuthenticationScope.FULL_NAME,
      AppleAuth.AppleAuthenticationScope.EMAIL,
    ],
  });

  const { identityToken } = credential;
  if (!identityToken) throw new Error('No identity token from Apple');

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: identityToken,
  });
  if (error) throw error;
  if (!data.user) throw new Error('No user returned');

  const displayName =
    credential.fullName?.givenName
      ? `${credential.fullName.givenName}${credential.fullName.familyName ?? ''}`
      : data.user.user_metadata?.full_name ?? null;

  if (displayName) {
    await upsertUserProfile(data.user.id, data.user.email ?? '', displayName);
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email ?? '',
      displayName,
      avatarUrl: null,
    },
  };
}

export async function signInWithKakao(): Promise<SignInResult> {
  if (IS_DEV_BYPASS) {
    return {
      user: {
        id: MOCK_USER.id,
        email: 'kakao-dev@fairshare.local',
        displayName: '카카오유저(DEV)',
        avatarUrl: null,
      },
    };
  }

  // Supabase supports Kakao natively — enable it in Supabase Dashboard > Auth > Providers > Kakao
  // and set your Kakao REST API key + client secret there.
  const Linking = await import('expo-linking');
  const redirectUri = Linking.createURL('auth/callback');

  const { data, error } = await (supabase.auth as any).signInWithOAuth({
    provider: 'kakao',
    options: { redirectTo: redirectUri, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data?.url) throw new Error('카카오 로그인 URL을 가져올 수 없습니다');

  const WebBrowser = await import('expo-web-browser');
  const result = await WebBrowser.openAuthSessionAsync(data.url as string, redirectUri);

  if (result.type !== 'success') {
    const err = new Error('카카오 로그인이 취소되었습니다');
    (err as any).code = 'ERR_REQUEST_CANCELED';
    throw err;
  }

  const { data: sessionData, error: sessionError } = await (supabase.auth as any).exchangeCodeForSession(result.url);
  if (sessionError) throw sessionError;
  if (!sessionData?.user) throw new Error('No user returned');

  const u = sessionData.user as any;
  const displayName: string | null =
    u.user_metadata?.full_name ?? u.user_metadata?.name ?? null;
  const avatarUrl: string | null = u.user_metadata?.avatar_url ?? null;

  if (u.email) {
    await upsertUserProfile(u.id, u.email, displayName ?? u.email, avatarUrl);
  }

  return {
    user: {
      id: u.id,
      email: u.email ?? '',
      displayName,
      avatarUrl,
    },
  };
}

export async function signOut(): Promise<void> {
  if (IS_DEV_BYPASS) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string): Promise<void> {
  if (IS_DEV_BYPASS) return;
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function upsertUserProfile(
  userId: string,
  email: string,
  displayName: string,
  avatarUrl?: string | null,
): Promise<void> {
  if (IS_DEV_BYPASS) return;

  const { error } = await (supabase.from('users') as any).upsert(
    {
      id: userId,
      email,
      display_name: displayName,
      ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
    },
    { onConflict: 'id' },
  );
  if (error) throw error;
}

export async function getCurrentSession() {
  if (IS_DEV_BYPASS) {
    return {
      user: { id: MOCK_USER.id, email: MOCK_USER.email, displayName: MOCK_USER.display_name, avatarUrl: null } as AuthUser,
    };
  }

  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return null;

  const u = data.session.user;
  return {
    user: {
      id: u.id,
      email: u.email ?? '',
      displayName: u.user_metadata?.display_name ?? null,
      avatarUrl: u.user_metadata?.avatar_url ?? null,
    } as AuthUser,
  };
}
