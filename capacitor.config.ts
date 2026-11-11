import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "az.healthpoint.app",
  appName: "HealthPoint",
  webDir: "dist",
  android: {
    allowMixedContent: false,
    backgroundColor: "#ffffff",
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
