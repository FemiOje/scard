import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import mkcert from "vite-plugin-mkcert";
import fs from "fs";

export default defineConfig(() => {
  const sslKeyPath = process.env.VITE_SSL_KEY;
  const sslCertPath = process.env.VITE_SSL_CERT;

  const httpsConfig =
    sslKeyPath &&
    sslCertPath &&
    fs.existsSync(sslKeyPath) &&
    fs.existsSync(sslCertPath)
      ? {
          key: fs.readFileSync(sslKeyPath),
          cert: fs.readFileSync(sslCertPath),
        }
      : true; // fallback to mkcert plugin behavior

  // Use mkcert only when we don't explicitly provide key/cert
  const plugins =
    sslKeyPath && sslCertPath
      ? [react(), wasm(), topLevelAwait()]
      : [
          react(),
          wasm(),
          topLevelAwait(),
          mkcert({
            hostnames: [
              "localhost",
              "127.0.0.1",
              "::1",
              "0.0.0.0",
              // Add container hostname if known
            ],
          }),
        ];

  return {
    plugins,
    server: {
      https: httpsConfig,
      host: true,
    },
    preview: {
      https: httpsConfig,
      host: true,
    },
  };
});
