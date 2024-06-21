import js from '@eslint/js';
import globals from 'globals';
import mochaPlugin from 'eslint-plugin-mocha';
import chaiExpectPlugin from 'eslint-plugin-chai-expect';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [{
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.es2021,
      ...globals.mocha,
    },
  },
  plugins: {
    'mocha': mochaPlugin,
    'chai-expect': chaiExpectPlugin,
  },
  rules: {
    ...js.configs.recommended.rules,
    ...eslintConfigPrettier.rules,
    ...mochaPlugin.configs.flat.recommended.rules,
    ...chaiExpectPlugin.configs['recommended-flat'].rules,
  },
  files: ['src/**/*.js'],
}];
