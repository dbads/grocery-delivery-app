module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    // Additional rules or overrides can be added here
    'semi': ['error', 'always'],
    'indent': ['error', 2],
    'max-len': ['error', {
      code: 90, // Set the maximum line length to 120 characters
      //   tabWidth: 2, // Optional: Set the number of spaces for each tab
      //   ignoreUrls: true, // Optional: Ignore URL strings
      //   ignoreComments: false, // Optional: Don't ignore comments
      // Other options...
    }],
    'object-curly-spacing': ['error', 'always'],
    "key-spacing": ["error", { "afterColon": true }]
  },
};
