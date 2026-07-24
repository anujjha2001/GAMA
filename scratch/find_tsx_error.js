const ts = require('typescript');
const fs = require('fs');

const file = 'd:\\DMyProjectsGAMA\\new-dashboard.tsx';
const code = fs.readFileSync(file, 'utf8');

const sourceFile = ts.createSourceFile(
  file,
  code,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);

console.log('Parse diagnostics:');
for (const diag of sourceFile.parseDiagnostics) {
  const line = sourceFile.getLineAndCharacterOfPosition(diag.start).line + 1;
  console.log(`Line ${line}: ${ts.flattenDiagnosticMessageText(diag.messageText, '\n')}`);
}
