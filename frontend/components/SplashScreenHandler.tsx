"use client";

import { useEffect } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';

export default function SplashScreenHandler() {
  useEffect(() => {
    const hideSplash = async () => {
      try {
        await SplashScreen.hide();
      } catch (e) {
        console.error('Error hiding splash screen', e);
      }
    };
    
    // Small delay to ensure the UI is ready
    setTimeout(hideSplash, 100);
  }, []);

  return null;
}
