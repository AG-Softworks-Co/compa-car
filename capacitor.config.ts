import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.compacar.compacar',
  appName: 'CompaCar',
  webDir: 'dist',
  server: {
    url: "http://192.168.18.4:5173/",
    cleartext: true
  }
};

export default config;
