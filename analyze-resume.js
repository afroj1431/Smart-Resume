import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_BASE_URL = 'http://localhost:5000/api';

async function analyzeResume() {
    try {
        const resumePath = join(__dirname, 'Afroj_Shaikh_Resume_ATS.pdf');
        
        // Check if file exists
        if (!fs.existsSync(resumePath)) {
            console.error('❌ Resume PDF not found:', resumePath);
            process.exit(1);
        }

        console.log('📄 Found resume:', resumePath);
        console.log('📤 Uploading resume...\n');

        // Create form data
        const formData = new FormData();
        formData.append('resume', fs.createReadStream(resumePath));
        formData.append('candidateName', 'Afroj Shaikh');

        // Upload resume
        const uploadResponse = await axios.post(`${API_BASE_URL}/resumes/upload`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        const resumeId = uploadResponse.data.data.resume._id;
        console.log('✅ Resume uploaded successfully!');
        console.log('📋 Resume ID:', resumeId);
        console.log('\n🔍 Calculating ATS score...\n');

        // Wait a moment for processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Calculate score
        const scoreResponse = await axios.post(`${API_BASE_URL}/score/${resumeId}`);
        const score = scoreResponse.data.data.score;

        console.log('═══════════════════════════════════════');
        console.log('📊 ATS SCORE RESULTS');
        console.log('═══════════════════════════════════════\n');
        console.log(`🎯 Overall ATS Score: ${score.overallScore}/100\n`);
        
        if (score.breakdown) {
            console.log('📈 Score Breakdown:');
            console.log(`   • Skill Match: ${score.breakdown.skillMatch || 'N/A'}%`);
            console.log(`   • Experience: ${score.breakdown.experience || 'N/A'}%`);
            console.log(`   • Education: ${score.breakdown.education || 'N/A'}%\n`);
        }

        if (score.skills && score.skills.length > 0) {
            console.log('💡 Detected Skills:');
            score.skills.slice(0, 10).forEach(skill => {
                console.log(`   • ${skill}`);
            });
            if (score.skills.length > 10) {
                console.log(`   ... and ${score.skills.length - 10} more`);
            }
            console.log('');
        }

        console.log('═══════════════════════════════════════');
        console.log(`\n🌐 View full analysis: http://localhost:3001/analyzer/${resumeId}`);
        console.log('═══════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Error:', error.response?.data?.message || error.message);
        if (error.response?.data) {
            console.error('Details:', JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
    }
}

analyzeResume();









