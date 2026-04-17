// Config plugin: Android App Shortcuts (long-press home screen icon)
// Applied at EAS Build time — does NOT work in Expo Go.
// On Android 7.1+, long-pressing the app icon shows these shortcut items.

const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const SHORTCUTS_XML = `<?xml version="1.0" encoding="utf-8"?>
<shortcuts xmlns:android="http://schemas.android.com/apk/res/android">

  <!-- 빠른 체크: opens the chores tab directly -->
  <shortcut
    android:shortcutId="quick_check"
    android:enabled="true"
    android:icon="@mipmap/ic_launcher"
    android:shortcutShortLabel="@string/shortcut_quick_check_short"
    android:shortcutLongLabel="@string/shortcut_quick_check_long">
    <intent
      android:action="android.intent.action.VIEW"
      android:data="fairshare://home" />
    <categories android:name="android.shortcut.conversation" />
  </shortcut>

  <!-- 주간 현황: opens the dashboard tab -->
  <shortcut
    android:shortcutId="weekly_status"
    android:enabled="true"
    android:icon="@mipmap/ic_launcher"
    android:shortcutShortLabel="@string/shortcut_weekly_short"
    android:shortcutLongLabel="@string/shortcut_weekly_long">
    <intent
      android:action="android.intent.action.VIEW"
      android:data="fairshare://dashboard" />
    <categories android:name="android.shortcut.conversation" />
  </shortcut>

</shortcuts>`;

const SHORTCUT_STRINGS = `
  <string name="shortcut_quick_check_short">빠른 체크</string>
  <string name="shortcut_quick_check_long">집안일 빠른 체크</string>
  <string name="shortcut_weekly_short">주간 현황</string>
  <string name="shortcut_weekly_long">이번 주 공정성 현황</string>`;

/** Write shortcuts.xml into Android res/xml/ */
function withShortcutsXml(config) {
  return withDangerousMod(config, [
    'android',
    async (c) => {
      const xmlDir = path.join(c.modRequest.platformProjectRoot, 'app/src/main/res/xml');
      fs.mkdirSync(xmlDir, { recursive: true });
      fs.writeFileSync(path.join(xmlDir, 'shortcuts.xml'), SHORTCUTS_XML, 'utf8');

      // Inject string resources into values/strings.xml
      const stringsPath = path.join(
        c.modRequest.platformProjectRoot,
        'app/src/main/res/values/strings.xml',
      );
      if (fs.existsSync(stringsPath)) {
        let content = fs.readFileSync(stringsPath, 'utf8');
        if (!content.includes('shortcut_quick_check_short')) {
          content = content.replace('</resources>', `${SHORTCUT_STRINGS}\n</resources>`);
          fs.writeFileSync(stringsPath, content, 'utf8');
        }
      }

      return c;
    },
  ]);
}

/** Add meta-data to MainActivity in AndroidManifest.xml pointing to shortcuts.xml */
function withShortcutsManifest(config) {
  return withAndroidManifest(config, (c) => {
    const app = c.modResults.manifest.application?.[0];
    if (!app) return c;

    const activities = app.activity ?? [];
    const mainActivity = activities.find(
      (a) =>
        a.$?.['android:name'] === '.MainActivity' ||
        a.$?.['android:name']?.includes('MainActivity'),
    );

    if (!mainActivity) return c;

    mainActivity['meta-data'] = mainActivity['meta-data'] ?? [];
    const already = mainActivity['meta-data'].some(
      (m) => m.$?.['android:name'] === 'android.app.shortcuts',
    );
    if (!already) {
      mainActivity['meta-data'].push({
        $: {
          'android:name': 'android.app.shortcuts',
          'android:resource': '@xml/shortcuts',
        },
      });
    }

    return c;
  });
}

/** Combined plugin */
const withAndroidShortcuts = (config) => {
  config = withShortcutsXml(config);
  config = withShortcutsManifest(config);
  return config;
};

module.exports = withAndroidShortcuts;
