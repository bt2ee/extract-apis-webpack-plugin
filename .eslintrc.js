module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2020: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 11
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  rules: {
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'linebreak-style': ['error', 'unix'],
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off'
  },
  overrides: [{
      files: ['config/**/*.js', 'config/**/.*.js'],
      parserOptions: {
        sourceType: 'script'
      },
      rules: {
        strict: ['error', 'safe'],
        '@typescript-eslint/no-var-requires': 'off'
      }
    },
    {
      files: [
        'config/**/*.test.js',
        'config/**/*.spec.js',
        'src/**/*.test.js',
        'src/**/*.spec.js'
      ],
      rules: {
        'no-undef': 'off'
      }
    }
  ]
};