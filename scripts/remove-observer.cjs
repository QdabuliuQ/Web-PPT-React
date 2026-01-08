const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 查找所有使用 mobx-react-lite 的文件
const files = execSync('find src -name "*.tsx" -type f -exec grep -l "from \\"mobx-react-lite\\"" {} \\;')
  .toString()
  .trim()
  .split('\n')
  .filter(Boolean);

console.log(`Found ${files.length} files with mobx-react-lite`);

files.forEach((file) => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;

    // 移除 observer 导入行
    content = content.replace(/import\s+{\s*observer\s*}\s+from\s+["']mobx-react-lite["'];\s*\n/g, '');
    
    // 移除包含 observer 的多行导入
    content = content.replace(/import\s+{\s*[^}]*observer[^}]*}\s+from\s+["']mobx-react-lite["'];\s*\n/g, '');

    // 移除 observer() 包装 - 匹配 observer(ComponentName)
    content = content.replace(/=\s*observer\((\w+)\);/g, '= $1;');
    
    // 移除 export const X = observer(function ... 形式
    content = content.replace(/export\s+const\s+(\w+):\s*FC\s*=\s*observer\(/g, 'export const $1: FC = (');
    
    // 移除 export default observer(... 形式
    content = content.replace(/export\s+default\s+observer\(/g, 'export default (');

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`✓ Updated: ${file}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
});

console.log('\\nDone! Processed', files.length, 'files');

