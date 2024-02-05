module.exports = {
  rules: {
    'no-console': 'warn',
    'no-shadow': 'off',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
  },
  env: {
    browser: true,
    commonjs: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  extends: ['prettier'],
  plugins: ['prettier'],
}
