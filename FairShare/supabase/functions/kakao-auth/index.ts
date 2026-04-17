// Kakao Auth Edge Function — Case B fallback
//
// Use this ONLY if Supabase does not have Kakao enabled as a native provider
// in your project's Auth > Providers settings.
//
// If Kakao IS enabled natively in Supabase (recommended), the client uses
// supabase.auth.signInWithOAuth({ provider: 'kakao' }) directly and this
// function is not needed.
//
// Deploy: supabase functions deploy kakao-auth
// Secrets: supabase secrets set KAKAO_CLIENT_ID=xxx KAKAO_CLIENT_SECRET=xxx

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { code, redirectUri } = await req.json() as { code: string; redirectUri: string };

    // 1. Exchange authorization code for Kakao access token
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: Deno.env.get('KAKAO_CLIENT_ID')!,
        client_secret: Deno.env.get('KAKAO_CLIENT_SECRET') ?? '',
        redirect_uri: redirectUri,
        code,
      }),
    });

    const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
    if (!tokenData.access_token) {
      throw new Error(`Kakao token error: ${tokenData.error ?? 'unknown'}`);
    }

    // 2. Fetch Kakao user profile
    const profileRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const kakaoUser = await profileRes.json() as {
      id: number;
      kakao_account?: { email?: string; email_needs_agreement?: boolean };
      properties?: { nickname?: string; profile_image?: string };
    };

    const email = kakaoUser.kakao_account?.email;
    const nickname = kakaoUser.properties?.nickname ?? `Kakao${kakaoUser.id}`;
    const avatarUrl = kakaoUser.properties?.profile_image ?? null;

    if (!email) {
      // Email consent was not granted — prompt user to use email login or grant consent
      return new Response(
        JSON.stringify({ error: '카카오 계정의 이메일 제공에 동의해주세요.' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 3. Find or create Supabase user
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const existing = listData?.users.find((u) => u.email === email);

    let userId: string;
    if (existing) {
      userId = existing.id;
      // Update metadata with latest Kakao profile info
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { display_name: nickname, avatar_url: avatarUrl, provider: 'kakao' },
      });
    } else {
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { display_name: nickname, avatar_url: avatarUrl, provider: 'kakao' },
      });
      if (createErr || !newUser.user) throw createErr ?? new Error('Failed to create user');
      userId = newUser.user.id;
    }

    // 4. Generate a one-time magic link token for the client to sign in with
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });
    if (linkErr || !linkData) throw linkErr ?? new Error('Failed to generate link');

    // Extract hashed_token from the generated link properties
    const hashedToken = (linkData as any).properties?.hashed_token as string | undefined;

    return new Response(
      JSON.stringify({ hashedToken, email, nickname, avatarUrl }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }
});
