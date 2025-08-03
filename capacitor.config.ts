import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.3e39544fa27d429c9e0dac51e25d775f',
  appName: 'Audiolibros Android Auto',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://3e39544f-a27d-429c-9e0d-ac51e25d775f.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#2a3441',
      showSpinner: false
    }
  }
};

export default config;