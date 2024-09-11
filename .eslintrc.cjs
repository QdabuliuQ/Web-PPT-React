module.exports = {
  env: { browser: true, es2021: true, jest: true, node: true },
  parserOptions: {
    project: ['tsconfig.json', 'tsconfig.node.json']
  },
  ignorePatterns: [],
  parser: '@typescript-eslint/parser',
  plugins: ['simple-import-sort'],
  rules: {
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
