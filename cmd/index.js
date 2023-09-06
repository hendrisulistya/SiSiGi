const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

// Function to ensure that the destination directory exists, creating it if necessary
function ensureDirectoryExists(directoryPath) {
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }
}

// Function to generate a page
function generatePage(templatePath, stylePath, outputPath) {
    const rootDir = process.cwd();

    // Define source and destination directories
    const srcDir = path.join(rootDir, 'src'); // Assuming the script is in the root directory
    const distDir = path.join(rootDir, 'dist'); // Assuming the dist directory is in the root directory

    // Function to generate the navigation menu
    function generateNavigation() {
        const pagesDir = path.join(srcDir, 'pages'); // Adjust the path as needed
        const files = fs.readdirSync(pagesDir);

        const navigationItems = files
            .filter(file => file.endsWith('.html'))
            .map(file => {
                const sectionId = path.basename(file, '.html');
                return `<li><a href="#${sectionId}" onclick="loadSection('${sectionId}', 'pages/${file}')">${sectionId}</a></li>`;
            });

        return navigationItems.join('\n');
    }

    // Generate the navigation menu
    const navigation = generateNavigation();

    // Read the template file
    const template = fs.readFileSync(path.join(srcDir, templatePath), 'utf8');

    // Replace the navigation placeholder in the template
    const templatePlaceholder = template
    .replace('{{navigation}}', navigation)
    .replace('{{style}}', stylePath);

    // Ensure that the destination directory exists
    ensureDirectoryExists(distDir);

    // Write the template file with navigation to the destination
    fs.writeFileSync(path.join(distDir, outputPath), templatePlaceholder, 'utf8');

    // Copy style.css from src to dist/
    const styleSource = path.join(srcDir, stylePath);
    const styleDest = path.join(distDir, stylePath);
    fs.copyFileSync(styleSource, styleDest);

    // Copy the contents of src/pages to dist/pages using fs-extra
    const pagesSource = path.join(srcDir, 'pages'); // Adjust the path as needed
    const pagesDest = path.join(distDir, 'pages'); // Adjust the path as needed
    fse.copySync(pagesSource, pagesDest);

    console.log(`Build complete for ${outputPath}`);
}

module.exports = generatePage