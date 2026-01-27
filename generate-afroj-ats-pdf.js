import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generatePDF() {
    let browser;
    try {
        // Try to use system Chrome first
        browser = await puppeteer.launch({
            headless: true,
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    } catch (error) {
        // Fallback to default
        console.log('Trying default Chrome path...');
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }
    
    try {
        const page = await browser.newPage();
        
        // Read the HTML file
        const htmlPath = join(__dirname, 'Afroj_Shaikh_Resume_ATS.html');
        const htmlContent = readFileSync(htmlPath, 'utf-8');
        
        // Set content
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0'
        });
        
        // Generate PDF
        const pdfPath = join(__dirname, 'Afroj_Shaikh_Resume_ATS.pdf');
        await page.pdf({
            path: pdfPath,
            format: 'Letter',
            margin: {
                top: '0.5in',
                right: '0.5in',
                bottom: '0.5in',
                left: '0.5in'
            },
            printBackground: true,
            preferCSSPageSize: true
        });
        
        console.log(`✅ PDF generated successfully: ${pdfPath}`);
    } catch (error) {
        console.error('❌ Error generating PDF:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

generatePDF();

