const fs = require('fs');
const path = require('path');

const localesDir = path.join('d:/FullStack/smart-menu/locales');
const files = fs.readdirSync(localesDir);

files.forEach(file => {
    if (file.endsWith('.json')) {
        const filePath = path.join(localesDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('SmartMenu')) {
            content = content.replace(/SmartMenu/g, 'Davoriq');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated: ${file}`);
        }
    }
});
console.log('Locale rebranding complete!');
