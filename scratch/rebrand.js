const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('SmartMenu')) {
        content = content.replace(/SmartMenu/g, 'Davoriq');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

const filesToUpdate = [
    'app/layout.js',
    'app/dashboard/settings/BrandingTab.jsx',
    'app/onboarding/page.jsx',
    'app/dashboard/settings/branding/page-old-backup.jsx',
    'app/test-components/page.jsx',
    'app/dashboard/settings/branding/page.jsx',
    'app/(auth)/signup/page.jsx',
    'app/(auth)/login/page.jsx',
    'components/marketing/Navbar.jsx',
    'components/marketing/Footer.jsx',
    'components/dashboard/Sidebar.jsx',
    'components/dashboard/design-studio/presets.js',
    'components/dashboard/design-studio/DesignStudio.jsx',
    'components/dashboard/design-studio/config-defaults.js',
    'app/dashboard/settings/page.jsx' // Adding this just in case
];

filesToUpdate.forEach(file => {
    const fullPath = path.join('d:/FullStack/smart-menu', file);
    replaceInFile(fullPath);
});

console.log('Rebranding complete!');
