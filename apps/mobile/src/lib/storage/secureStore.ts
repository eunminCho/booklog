import * as SecureStore from "expo-secure-store";

export const SECURE_STORE_KEYS = {
  SESSION_TOKEN: "booklog.session.token",
} as const;

export type SecureStoreKey = (typeof SECURE_STORE_KEYS)[keyof typeof SECURE_STORE_KEYS];

export async function setSecureItem(key: SecureStoreKey, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function getSecureItem(key: SecureStoreKey): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

export async function deleteSecureItem(key: SecureStoreKey): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}
