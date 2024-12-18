import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  clearScreen: false,
  plugins: [
    react(),
    vike({ prerender: true }),
    // Need to have HTTPS to use the Geolocation API.
    basicSsl({
      name: "test",
      domains: ["192.168.0.227"],
      certDir: ".devServer/cert",
    }),
  ],
  base: "/satellite/",

  esbuild: {
    // Need to explicitly set target to ES2020. Otherwise, some other statements
    // are reordered incorrectly and when `useDefineForClassFields` is true the
    // class fields will be initialized before constructor shorthand properties
    // are assigned.
    //
    // https://github.com/vitejs/vite/issues/11722#issuecomment-1831895962
    target: "ES2020",
  },

  server: {
    host: "0.0.0.0",
  },
});
