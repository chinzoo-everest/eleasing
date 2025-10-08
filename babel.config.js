module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      "react-native-reanimated/plugin",
      [
        "module-resolver",
        {
          extensions: [
            ".ios.js",
            ".android.js",
            ".ios.jsx",
            ".android.jsx",
            ".js",
            ".jsx",
            ".json",
            ".ts",
            ".tsx",
          ],
          root: ["./"],
          alias: {
            "@api": "./shared/api",
            "@assets": "./assets",
            "@components": "./components",
            "@modals": "./modals",
            "@customHooks": "./hooks",
            "@customConfig": "./config",
            "@context": "./shared/context",
            "@constant": "./shared/constants",
            "@hooks": "./shared/hooks",
            "@services": "./shared/services",
            "@screens": "./screens",
            "@type": "./shared/types",
            "@utils": "./shared/utils",
          },
        },
      ],
    ],
  };
};
