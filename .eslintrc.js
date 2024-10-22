module.exports = {
  extends: ['standard'],
  plugins: ['@typescript-eslint'],
  rules: {
    'space-before-function-paren': 0,
    curly: [2, 'all']
  },
  overrides: [
    {
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/space-before-function-paren': 0,
        '@typescript-eslint/no-explicit-any': 0
      },
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: 'tsconfig.json'
      }
    }
  ]
}