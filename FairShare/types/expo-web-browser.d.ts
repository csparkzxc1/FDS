// Minimal type shim for expo-web-browser (not installed in dev node_modules; installed by EAS Build).
// Full types are available after `npm install` once expo-web-browser is added to package.json.

declare module 'expo-web-browser' {
  export type WebBrowserResult =
    | { type: 'success'; url: string }
    | { type: 'cancel' | 'dismiss' | 'locked' };

  export function openAuthSessionAsync(
    url: string,
    redirectUrl: string,
    options?: { dismissButtonStyle?: string; readerMode?: boolean },
  ): Promise<WebBrowserResult>;

  export function warmUpAsync(browserPackage?: string): Promise<void>;
  export function coolDownAsync(browserPackage?: string): Promise<void>;
  export function maybeCompleteAuthSession(options?: { skipRedirectCheck?: boolean }): { type: string };
}
