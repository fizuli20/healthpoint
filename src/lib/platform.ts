export const PRODUCTION_API_ORIGIN = "https://healthpoint-tawny.vercel.app";

export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
    .Capacitor;
  if (typeof cap?.isNativePlatform === "function") {
    return cap.isNativePlatform();
  }
  return window.location.protocol === "capacitor:";
}

export function resolveApiUrl(path: string): string {
  if (isNativeApp()) {
    return `${PRODUCTION_API_ORIGIN}${path}`;
  }
  return path;
}
