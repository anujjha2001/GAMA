const fs = require('fs');

const targetFile = 'd:\\DMyProjectsGAMA\\src\\app\\auth\\page.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

// Remove glow backgrounds entirely to make the background perfectly black
content = content.replace(/<div className="absolute top-\[-20%\].*?\/>\n/g, '');
content = content.replace(/<div className="absolute bottom-\[-20%\].*?\/>\n/g, '');
content = content.replace(/<div className="absolute top-\[30%\].*?\/>\n/g, '');

// Replace hex backgrounds with black
content = content.replace(/#07090e|#0a0a0f|#0c0f17|#121316|#121318|#1c120c/g, 'black');
// Replace gray hex with white
content = content.replace(/#f3f4f6/g, 'white');

// Replace named tailwind grays with white opacities
content = content.replace(/gray-300/g, 'white/70');
content = content.replace(/gray-400/g, 'white/60');
content = content.replace(/gray-500/g, 'white/50');
content = content.replace(/gray-600/g, 'white/40');
content = content.replace(/gray-800/g, 'white/20');
content = content.replace(/neutral-500/g, 'white/50');

// Replace other colors with orange or white
// Tailwind classes
content = content.replace(/(purple|cyan|pink|emerald|yellow|green|red|blue|indigo)-[456]00/g, 'orange-500');

// specifically for the from-blue-600 to-blue-500 button gradient
content = content.replace(/from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400/g, 'from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400');
content = content.replace(/rgba\(59,130,246,0.3\)/g, 'rgba(249,115,22,0.3)');

// Replace specific hex codes that are colored
content = content.replace(/#3b82f6/g, '#f97316');
content = content.replace(/#0f0404ff/g, 'rgba(0,0,0,0.15)');
content = content.replace(/#d51515ff/g, 'transparent');
content = content.replace(/#000000ff/g, 'black'); 

// The inner forms background is bg-[#151923] and hover bg-[#1a202d]
content = content.replace(/#151923/g, 'black');
content = content.replace(/#1a202d/g, '#111');

// Mac controls colored dots
content = content.replace(/#ff5f56|#ffbd2e|#27c93f/g, 'orange');

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Colors replaced successfully in auth/page.tsx!');
