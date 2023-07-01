module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  env: {
    node: true,
  },
  rules: {
    curly: ['error', 'all'],
    'max-lines-per-function': ['error', 40],
    '@typescript-eslint/explicit-function-return-type': 'error',
  },
  overrides: [
    {
      files: ['**/*.test.[jt]s'],
      rules: {
        'max-lines-per-function': 'off',
      },
    },
    {
      files: ['**/*.c?js'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
  ],
  root: true,
};
