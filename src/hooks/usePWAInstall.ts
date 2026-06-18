import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser default prompt (e.g. mini-infobar on mobile)
      e.preventDefault();
      // Store event
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Track app installation
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsStandalone(true);
      console.log('FinVik PWA successfully installed!');
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return false;
    
    // Trigger prompt
    deferredPrompt.prompt();
    
    // Await result
    const { outcome } = await deferredPrompt.userChoice;
    
    // Reset state
    setDeferredPrompt(null);
    setIsInstallable(false);
    
    return outcome === 'accepted';
  };

  // Platform detection helpers
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  };

  const isMacSafari = () => {
    const ua = navigator.userAgent;
    return /Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome/.test(ua) && !/Firefox/.test(ua);
  };

  // Determine what platform type we are on
  let platform: 'ios' | 'mac-safari' | 'other' = 'other';
  if (isIOS()) {
    platform = 'ios';
  } else if (isMacSafari()) {
    platform = 'mac-safari';
  }

  // Show installation option if:
  // 1. It is natively installable via prompt (Chrome/Edge/Android)
  // 2. OR it is iOS / macOS Safari and not yet installed (standalone)
  const shouldShowInstallButton = isInstallable || ((isIOS() || isMacSafari()) && !isStandalone);

  return {
    isInstallable,
    isStandalone,
    shouldShowInstallButton,
    platform,
    triggerInstall,
  };
}
