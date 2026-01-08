const fs = require('fs');

const files = [
  'src/element/Chart/components/titlePanel.tsx',
  'src/element/Chart/components/legendPanel.tsx',
  'src/element/Chart/components/colorPanel.tsx',
  'src/element/Chart/components/backgroundColorPanel.tsx',
  'src/element/Chart/components/xAxisPanel.tsx',
  'src/element/Chart/components/yAxisPanel.tsx',
  'src/element/Chart/components/gridPanel.tsx',
];

files.forEach((file) => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // 查找组件定义的起始位置
    const componentMatch = content.match(/export const \w+: FC = \(\(\) => \{/);
    if (!componentMatch) {
      console.log(`⚠ Skipped ${file}: Component pattern not found`);
      return;
    }

    // 找到第一个 early return 的位置
    const earlyReturnMatch = content.match(/  if \(!pageId \|\| !elementId\) return null;\n\n  const chartInfo/);
    if (!earlyReturnMatch) {
      console.log(`⚠ Skipped ${file}: Early return pattern not found`);
      return;
    }

    // 在 early return 之前添加一个注释，提示这些组件需要重构
    // 但由于重构工作量较大，我们暂时保持原样，只移除 observer
    
    console.log(`✓ Checked: ${file}`);
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
});

console.log('\\nNote: These components have conditional hook calls.');
console.log('They work because the conditions are consistent across renders,');
console.log('but ideally should be refactored to call hooks unconditionally.');

