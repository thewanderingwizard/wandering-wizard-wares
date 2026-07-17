import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    ignores: [
      ".next/**",
      "dist/**",
      "node_modules/**",
      "outputs/**",
      "work/**",
    ],
  },
];

export default eslintConfig;
