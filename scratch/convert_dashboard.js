const fs = require('fs');

const filePath = 'd:\\DMyProjectsGAMA\\new-dashboard.tsx';
const buf = fs.readFileSync(filePath);

// Detect if it's UTF-16LE by checking BOM (0xFF 0xFE)
const isUtf16le = buf[0] === 0xff && buf[1] === 0xfe;
console.log('Is UTF-16LE:', isUtf16le);

// Read file using correct encoding
const content = fs.readFileSync(filePath, isUtf16le ? 'utf16le' : 'utf8');

// Write back in UTF-8
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully converted new-dashboard.tsx to UTF-8');
