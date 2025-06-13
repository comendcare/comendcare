export {}

declare global {
  interface Window {
    functionalConsentedLocalStorage?: {
      set: (key: string, value: any) => void;
      get: (key: string) => any;
      remove: (key: string) => void;
    },
    analyticsConsentedLocalStorage?: {
      set: (key: string, value: any) => void;
      get: (key: string) => any;
      remove: (key: string) => void;
    },
    CookieYes?: {
      on: (
        key: string, 
        consent: (consent: {
          necessary: boolean, 
          analytics: boolean, 
          marketing: boolean, 
          functional: boolean
        }) => void
      ) => void
    }
  }
}