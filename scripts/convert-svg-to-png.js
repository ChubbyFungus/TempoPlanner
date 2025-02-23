import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INKSCAPE_PATH = '"C:\\Program Files\\Inkscape\\bin\\inkscape.exe"';

async function convertSvgToPng() {
    const diagramsDir = path.join(__dirname, '../docs/diagrams');
    const files = fs.readdirSync(diagramsDir);
    
    console.log('Converting SVG files to PNG...');
    
    for (const file of files) {
        if (path.extname(file).toLowerCase() === '.svg') {
            const svgPath = path.join(diagramsDir, file);
            const pngPath = path.join(diagramsDir, file.replace('.svg', '.png'));
            
            try {
                console.log(`\nProcessing: ${file}`);
                
                // Convert directly to PNG with text-to-paths conversion
                console.log('Converting to PNG with text conversion...');
                await execAsync(`${INKSCAPE_PATH} --export-type="png" --export-filename="${pngPath}" --export-dpi=300 --export-text-to-path --export-area-drawing "${svgPath}"`);
                
                console.log(`✓ Created: ${path.basename(pngPath)}`);
            } catch (error) {
                console.error(`✗ Error converting ${file}:`, error.message);
            }
        }
    }
    
    console.log('\nConversion complete!');
}

// Check if Inkscape is accessible
async function checkInkscape() {
    try {
        const { stdout } = await execAsync(`${INKSCAPE_PATH} --version`);
        console.log('Found Inkscape:', stdout.trim());
        return true;
    } catch (error) {
        console.error('Error running Inkscape:', error.message);
        console.error(`Make sure Inkscape is installed at: ${INKSCAPE_PATH}`);
        return false;
    }
}

// Execute with proper error handling
async function main() {
    if (await checkInkscape()) {
        await convertSvgToPng();
    } else {
        process.exit(1);
    }
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
