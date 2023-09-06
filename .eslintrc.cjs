module.exports = {
  env: {
    es2021: true,
    node: true
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 13,
  },
  plugins: [
    'mocha',
    'chai-expect',
  ],
  extends: [
    'eslint:recommended',
    'prettier',
    'plugin:mocha/recommended',
    'plugin:chai-expect/recommended',
  ],
}
