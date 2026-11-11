const fs = require('fs');
const path = 'd:/FullStack/smart-menu/components/public/MenuItem.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace all occurrences of theme?.config?. with tConfig?.
content = content.replace(/theme\?\.config\?\./g, 'tConfig?.');

// Inject the normalization logic into the beginning of each component
content = content.replace(/(export function \w+\([^)]+\) {\s*)/g, '$1const tConfig = theme?.config || theme;\n    ');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed MenuItem.jsx');
