// Shared app configuration.
// The demo key ships with the app so visitors can try the playground immediately;
// override it at build time with VITE_INCEPTION_API_KEY.
export const DEFAULT_API_KEY =
  import.meta.env.VITE_INCEPTION_API_KEY || 'sk_1460488f4edc9f3230a7eecd506da5d7';
