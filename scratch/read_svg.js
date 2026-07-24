const fs = require('fs');
const path = require('path');

const filePath = `C:\\Users\\anujj\\.gemini\\antigravity-ide\\brain\\2d06747f-a67a-4507-8008-f12eab42b277\\.system_generated\\steps\\63\\content.md`;
const content = fs.readFileSync(filePath, 'utf8');

// The SVG starts with <svg and ends with </svg>
const match = content.match(/<svg[\s\S]*<\/svg>/);
if (match) {
  console.log(match[0].replace(/></g, '>\n<'));
} else {
  console.log("No SVG found");
}
