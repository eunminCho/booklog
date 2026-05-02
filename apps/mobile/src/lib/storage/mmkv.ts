import { createMMKV } from "react-native-mmkv";

const mmkv = createMMKV({
  id: "booklog.mobile",
});

export const MMKV_KEYS = {
  DISPLAY_THEME: "booklog.display.theme",
  DISPLAY_FONT_SCALE_OVERRIDE: "booklog.display.fontScale.override",
} as const;

export type MMKVKey = (typeof MMKV_KEYS)[keyof typeof MMKV_KEYS];

export function getMMKVString(key: MMKVKey): string | undefined {
  return mmkv.getString(key);
}

export function getMMKVNumber(key: MMKVKey): number | undefined {
  return mmkv.getNumber(key);
}

export function setMMKVString(key: MMKVKey, value: string): void {
  mmkv.set(key, value);
}

export function setMMKVNumber(key: MMKVKey, value: number): void {
  mmkv.set(key, value);
}

export function deleteMMKVItem(key: MMKVKey): void {
  mmkv.remove(key);
}
