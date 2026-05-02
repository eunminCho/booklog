import {
  deleteSecureItem,
  getSecureItem,
  SECURE_STORE_KEYS,
  setSecureItem,
} from "../storage/secureStore";

export async function saveSession(token: string): Promise<void> {
  await setSecureItem(SECURE_STORE_KEYS.SESSION_TOKEN, token);
}

export async function loadSession(): Promise<string | null> {
  return getSecureItem(SECURE_STORE_KEYS.SESSION_TOKEN);
}

export async function clearSession(): Promise<void> {
  await deleteSecureItem(SECURE_STORE_KEYS.SESSION_TOKEN);
}
