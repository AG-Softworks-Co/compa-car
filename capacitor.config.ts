import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.compacar.compacar',
  appName: 'CompaCar',
  webDir: 'dist',
  server: {
    url: "https://dev.faun-scylla.ts.net",
    cleartext: true
  }
};

export default config;
