module.exports = {
  root: true,

  /* 继承某些已有的规则 */
  extends: [
    'stylelint-config-standard', // 配置stylelint拓展插件
    'stylelint-prettier/recommended', // 在 Stylelint 中集成 Prettier，使其成为 Stylelint 规则的一部分。
    'stylelint-config-recess-order', // 配置stylelint css属性书写顺序插件,
  ],

  plugins: ['stylelint-less', 'stylelint-prettier'], // 配置stylelint less拓展插件
  ignorePseudoClasses: [':global'],
  /* 自定义规则 */
  rules: {
    'selector-class-pattern': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],
  },
  overrides: [
    // 若项目中存在less文件，添加以下配置
    {
      files: ['*.less', '**/*.less'],
      customSyntax: 'postcss-less',
    },
  ],
};
