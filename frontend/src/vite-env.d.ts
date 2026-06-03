/// <reference types="vite/client" />

interface RegisterSWOptions {
  onNeedRefresh?: () => void;
  onOfflineReady?: () => void;
  onRegistered?: (registration: ServiceWorkerRegistration) => void;
  onRegisteredSW?: (scriptUrl: string, registration: ServiceWorkerRegistration) => void;
  immediate?: boolean;
}

declare module 'virtual:pwa-register' {
  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => void;
}
