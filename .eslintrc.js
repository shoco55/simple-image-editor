module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    '@vue/typescript/recommended',
    'eslint-config-prettier',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {},
};
