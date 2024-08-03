import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  clearScreen: false,
  plugins: [
    react(),
    // Need to have HTTPS to use the Geolocation API.
    basicSsl({
      name: "test",
      domains: ["192.168.0.227"],
      certDir: ".devServer/cert",
    }),
  ],
  base: "/satellite/",

  server: {
    host: "0.0.0.0",
  },
});
