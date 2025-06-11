export {}

declare global {
  interface Window {
    consentedLocalStorage?: {
      set: (key: string, value: any) => void;
      get: (key: string) => any;
      remove: (key: string) => void;
    }
  }
}