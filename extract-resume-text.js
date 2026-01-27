import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('../server/node_modules/pdf-parse');
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function extractText(pdfPath) {
    try {
        const dataBuffer = readFileSync(pdfPath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('Error extracting PDF text:', error.message);
        return null;
    }
}

// Try to find the resume PDF
const possiblePaths = [
    join(__dirname, 'Front-End Resume.pdf'),
    join(__dirname, 'Front-End Resume.pdf'),
    join(__dirname, '..', 'Front-End Resume.pdf'),
];

for (const pdfPath of possiblePaths) {
    try {
        const text = await extractText(pdfPath);
        if (text) {
            console.log('=== EXTRACTED RESUME TEXT ===');
            console.log(text);
            console.log('=== END OF TEXT ===');
            process.exit(0);
        }
    } catch (error) {
        // Try next path
        continue;
    }
}

console.log('PDF file not found. Please ensure "Front-End Resume.pdf" is in the project root.');
process.exit(1);

