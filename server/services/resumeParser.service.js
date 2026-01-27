import pdfParse from 'pdf-parse';
import fs from 'fs/promises';

// Skill synonyms mapping
const skillSynonyms = {
  'js': ['javascript', 'js', 'ecmascript'],
  'javascript': ['javascript', 'js', 'ecmascript'],
  'react': ['react', 'reactjs', 'react.js'],
  'node': ['node', 'nodejs', 'node.js'],
  'python': ['python', 'py'],
  'java': ['java'],
  'c++': ['c++', 'cpp', 'c plus plus'],
  'c#': ['c#', 'csharp', 'c sharp'],
  'sql': ['sql', 'mysql', 'postgresql', 'mongodb', 'database'],
  'html': ['html', 'html5'],
  'css': ['css', 'css3'],
  'typescript': ['typescript', 'ts'],
  'angular': ['angular', 'angularjs'],
  'vue': ['vue', 'vuejs'],
  'express': ['express', 'expressjs'],
  'mongodb': ['mongodb', 'mongo'],
  'aws': ['aws', 'amazon web services'],
  'docker': ['docker'],
  'kubernetes': ['kubernetes', 'k8s'],
  'git': ['git', 'github', 'gitlab'],
  'agile': ['agile', 'scrum'],
  'rest': ['rest', 'restful', 'rest api'],
  'graphql': ['graphql'],
  'redux': ['redux'],
  'jest': ['jest', 'testing'],
  'ci/cd': ['ci/cd', 'cicd', 'continuous integration']
};

// Normalize skill name for matching
const normalizeSkill = (skill) => {
  return skill.toLowerCase().trim().replace(/[^a-z0-9+#]/g, '');
};

// Check if skill matches (with synonyms)
const skillMatches = (resumeSkill, jobSkill) => {
  const normalizedResume = normalizeSkill(resumeSkill);
  const normalizedJob = normalizeSkill(jobSkill);
  
  // Direct match
  if (normalizedResume === normalizedJob) return true;
  
  // Check synonyms
  const jobSynonyms = skillSynonyms[normalizedJob] || [normalizedJob];
  const resumeSynonyms = skillSynonyms[normalizedResume] || [normalizedResume];
  
  return jobSynonyms.some(js => resumeSynonyms.includes(js));
};

export const parsePDF = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    
    if (!data.text || data.text.trim().length < 50) {
      throw new Error('PDF appears to be image-based or empty. Please provide a text-based PDF.');
    }
    
    return data.text;
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
};

export const extractSkills = (text, jobSkills = []) => {
  const normalizedText = text.toLowerCase();
  const foundSkills = [];
  
  // Extract skills mentioned in the resume
  jobSkills.forEach(jobSkill => {
    const skillName = typeof jobSkill === 'object' ? jobSkill.name : jobSkill;
    const synonyms = skillSynonyms[normalizeSkill(skillName)] || [normalizeSkill(skillName)];
    
    synonyms.forEach(synonym => {
      // Match whole word or common variations
      const regex = new RegExp(`\\b${synonym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(normalizedText)) {
        if (!foundSkills.includes(skillName)) {
          foundSkills.push(skillName);
        }
      }
    });
  });
  
  // Also extract common tech skills from text
  const commonSkills = Object.keys(skillSynonyms);
  commonSkills.forEach(skill => {
    const synonyms = skillSynonyms[skill];
    synonyms.forEach(synonym => {
      const regex = new RegExp(`\\b${synonym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(normalizedText) && !foundSkills.includes(skill)) {
        foundSkills.push(skill);
      }
    });
  });
  
  return foundSkills;
};

export const extractEducation = (text) => {
  const educationKeywords = [
    'bachelor', 'master', 'phd', 'doctorate', 'degree', 'diploma',
    'university', 'college', 'education', 'bsc', 'msc', 'mba', 'ba', 'ma'
  ];
  
  const lines = text.split('\n');
  const education = [];
  
  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    if (educationKeywords.some(keyword => lowerLine.includes(keyword))) {
      // Extract degree and institution
      const cleanLine = line.trim();
      if (cleanLine.length > 5 && cleanLine.length < 200) {
        education.push(cleanLine);
      }
    }
  });
  
  return education.slice(0, 5); // Limit to 5 entries
};

export const extractExperience = (text) => {
  const experienceKeywords = [
    'experience', 'years', 'yr', 'yrs', 'worked', 'work experience',
    'professional', 'career', 'employment'
  ];
  
  // Try to extract years of experience
  const yearPattern = /(\d+)\+?\s*(?:years?|yrs?|yr)\s*(?:of\s*)?(?:experience|exp)/i;
  const match = text.match(yearPattern);
  
  if (match) {
    return match[1] + ' years';
  }
  
  // Fallback: count experience mentions
  const expCount = (text.match(/experience/gi) || []).length;
  if (expCount > 0) {
    return 'Experience mentioned';
  }
  
  return '';
};

export const normalizeText = (text) => {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s@.-]/g, ' ')
    .trim();
};

export { skillMatches, normalizeSkill };

