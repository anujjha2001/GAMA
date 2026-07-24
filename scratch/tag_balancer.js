const fs = require('fs');

const content = fs.readFileSync('d:\\DMyProjectsGAMA\\new-dashboard.tsx', 'utf8');

// A simple script to match JSX tags and trace them
function checkTags(code) {
  const lines = code.split('\n');
  const stack = [];
  
  // Simple regex to find XML/JSX tags. We need to be careful with script braces, comments, etc.
  // Let's just scan for <tag> and </tag> while ignoring self-closing tags <tag/> and comments
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Ignore lines that are comments
    if (line.trim().startsWith('//')) continue;
    
    // Find all tags in this line
    const tagRegex = /<\/?[a-zA-Z0-9_\.]+(?:\s+[a-zA-Z0-9_\.-]+(?:=(?:"[^"]*"|'[^']*'|{[^}]*}|[^>\s]+))?)*\s*\/?>/g;
    let match;
    while ((match = tagRegex.exec(line)) !== null) {
      const tagStr = match[0];
      const isClosing = tagStr.startsWith('</');
      const isSelfClosing = tagStr.endsWith('/>');
      
      if (isSelfClosing) continue;
      
      const tagNameMatch = tagStr.match(/<\/?([a-zA-Z0-9_\.]+)/);
      if (!tagNameMatch) continue;
      const tagName = tagNameMatch[1];
      
      // Ignore some standard HTML self-closing elements that might not have slash in HTML style
      if (['img', 'input', 'br', 'hr', 'meta', 'link'].includes(tagName.toLowerCase())) {
        continue;
      }
      
      if (isClosing) {
        if (stack.length === 0) {
          console.log(`Line ${i + 1}: Unexpected closing tag </${tagName}>`);
        } else {
          const last = stack.pop();
          if (last.name !== tagName) {
            console.log(`Line ${i + 1}: Mismatched tags: opened <${last.name}> at line ${last.line}, closed with </${tagName}>`);
            // put back to keep stack sync
            stack.push(last);
          }
        }
      } else {
        stack.push({ name: tagName, line: i + 1 });
      }
    }
  }
  
  console.log('Unclosed tags at the end of file:');
  while (stack.length > 0) {
    const tag = stack.pop();
    console.log(`- <${tag.name}> opened at line ${tag.line}`);
  }
}

checkTags(content);
