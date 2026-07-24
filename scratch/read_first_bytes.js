const fs = require('fs');

const buf = fs.readFileSync('d:\\DMyProjectsGAMA\\new-dashboard.tsx');
console.log('Bytes length:', buf.length);
console.log('First 50 bytes:', buf.slice(0, 50));
console.log('First 50 chars:', buf.slice(0, 50).toString('utf8'));
