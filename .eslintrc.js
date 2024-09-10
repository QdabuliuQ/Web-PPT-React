module.exports = {
  env: { browser: true, es2021: true, jest: true, node: true },
  globals: { React: true },
  extends: [
    '@feb/eslint-config-base',
    '@feb/eslint-config-base/typescript',
    '@feb/eslint-config-base/react',
    '@feb/eslint-config-base/prettier'
  ],
  parserOptions: {
    project: ['tsconfig.json', 'tsconfig.node.json']
  },
  overrides: [
    {
      files: ['./server/**/*.ts'],
      rules: {
        'class-methods-use-this': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/consistent-type-imports': 'off'
      }
    }
  ],
  ignorePatterns: [],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'simple-import-sort'],
  rules: {
    '@typescript-eslint/no-explicit-any': ['off'],
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ],
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // react放在首行
          ['^react', '^@?\\w'],
          // 内部导入
          ['^(@|components)(/.*|$)'],
          // 父级导入. 把 `..` 放在最后.
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          // 同级导入. 把同一个文件夹.放在最后
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          // 样式导入.
          ['^.+\\.?(css|less)$'],
          // 带有副作用导入，比如import 'a.css'这种.
          ['^\\u0000']
        ]
      }
    ]
  }
}
