import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "az.opencarepoint.app",
  appName: "OpenCarePoint",
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
