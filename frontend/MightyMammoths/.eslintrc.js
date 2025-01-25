// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ['expo', 'plugin:jest/recommended'],
  ignorePatterns: ['/dist/*'],
  env: {
    jest: true
  },
  plugins: ['jest'],
  globals: {
    device: 'readonly',
    element: 'readonly',
    by: 'readonly',
    expect: 'readonly',
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/e2e/**/*.js'],
      env: {
        jest: true
      }
    }
  ]
};

