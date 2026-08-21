import { createClient } from '@insforge/sdk';

const baseUrl =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_INSFORGE_URL) ||
  'https://qpmq42rd.ap-southeast.insforge.app';
const anonKey =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_INSFORGE_ANON_KEY) ||
  'anon_8306839b9ffaa6949e16f425647064ee7cdab79683ed60eb8fa8cdd5842bf7c0';

export const insforge = createClient({
  baseUrl,
  anonKey,
});
