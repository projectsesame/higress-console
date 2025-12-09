import { defineConfig } from "@ice/app";
import request from "@ice/plugin-request";
import store from "@ice/plugin-store";
import auth from "@ice/plugin-auth";
import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import { fileURLToPath } from 'url';

// The project config, see https://v3.ice.work/docs/guide/basic/config
export default defineConfig(() => ({
  publicPath: process.env.PUBLIC_PATH,
  define: {
    // 将构建时的 PUBLIC_PATH 注入到运行时环境变量中
    'process.env.ICE_PUBLIC_PATH': JSON.stringify(process.env.PUBLIC_PATH),
  },
  ssr: false,
  ssg: false,
  hash: "contenthash",
  routes: {
    defineRoutes: (route) => {
      // route("*", "404.tsx");
    },
  },
  proxy: {
    "/api": {
      target: "http://demo.higress.io/",
      changeOrigin: true,
      pathRewrite: { "^/api": "" },
    },
  },
  plugins: [
    request(),
    store(),
    auth(),
  ],
  webpack: (config) => {
    config.plugins = config.plugins || [];
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'node_modules/monaco-editor/min/vs'),
            to: 'vs',
          },
        ],
      }),
    );
    return config;
  },
}));
