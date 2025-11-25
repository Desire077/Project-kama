module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // On désactive quelques règles trop strictes pour ce projet existant,
    // afin de ne pas avoir à réécrire tout le contenu marketing / maquettes.
    'react/prop-types': 'off',
    'no-console': 'off',
    'no-unused-vars': 'off',
    'react/no-unescaped-entities': 'off',
    'no-empty': ['error', { allowEmptyCatch: true }],
  },
  ignorePatterns: ['dist/', 'node_modules/'],
};


