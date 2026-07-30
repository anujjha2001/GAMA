const fs = require('fs');
const paths = [
  'src/app/(dashboard)/devices/components/AuraAIPanel.tsx',
  'src/app/(dashboard)/devices/components/ConnectedDevices.tsx',
  'src/app/(dashboard)/devices/components/ConnectNewDevice.tsx',
  'src/app/(dashboard)/devices/components/SyncCenter.tsx'
];

paths.forEach(p => {
  let content = fs.readFileSync(p, 'utf8');
  // In the file, the literal strings are something like \`\${...}%\`
  // We want to remove the backslash before ` and before $
  content = content.replace(/\\`\\?\${/g, '`${');
  content = content.replace(/\\`\${/g, '`${');
  content = content.replace(/\\`/g, '`');
  content = content.replace(/\\\${/g, '${');
  content = content.replace(/"\${/g, '`${');
  content = content.replace(/}"/g, '}`');
  fs.writeFileSync(p, content);
  console.log('Fixed ' + p);
});
