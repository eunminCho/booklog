import Constants from "expo-constants";

export function getApiBaseUrl(): string {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (typeof envBaseUrl === "string" && envBaseUrl.length > 0) {
    return envBaseUrl.replace(/\/$/, "");
  }

  const extraBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  if (typeof extraBaseUrl === "string" && extraBaseUrl.length > 0) {
    return extraBaseUrl.replace(/\/$/, "");
  }

  return "http://127.0.0.1:3000";
}
