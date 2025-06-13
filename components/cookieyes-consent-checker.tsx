"use client"

import { useEffect } from 'react';

const CookieConsentHandler = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.CookieYes) {
      window.CookieYes.on('consent', (consent: { necessary: boolean; analytics: boolean; marketing: boolean; functional: boolean; }) => {
        if (!consent.necessary && !consent.analytics && !consent.marketing && !consent.functional) {
          window.location.reload();
        }
      });
    }
  }, []);

  return null;
};

export default CookieConsentHandler;