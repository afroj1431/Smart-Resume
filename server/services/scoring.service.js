import Score from '../models/Score.model.js';
import Resume from '../models/Resume.model.js';
import Job from '../models/Job.model.js';
import { extractSkills, skillMatches } from './resumeParser.service.js';

/**
 * Calculate ATS Score for a resume
 * Skill Match: 60%
 * Experience Match: 25%
 * Education Match: 15%
 */
export const calculateScore = async (resumeId, jobId) => {
  try {
    const resume = await Resume.findById(resumeId);
    const job = await Job.findById(jobId);

    if (!resume || !job) {
      throw new Error('Resume or Job not found');
    }

    const jobSkills = job.skills || [];
    const resumeSkills = resume.extractedSkills || [];
    const resumeText = resume.parsedText.toLowerCase();

    // 1. Skill Score (60%)
    const skillScore = calculateSkillScore(jobSkills, resumeSkills, resumeText);

    // 2. Experience Score (25%)
    const experienceScore = calculateExperienceScore(job.experienceLevel, resume.extractedExperience, resumeText);

    // 3. Education Score (15%)
    const educationScore = calculateEducationScore(resume.extractedEducation);

    // Calculate final weighted score
    const finalScore = Math.round(
      (skillScore * 0.60) +
      (experienceScore * 0.25) +
      (educationScore * 0.15)
    );

    // Find missing skills
    const matchedSkills = [];
    const missingSkills = [];

    jobSkills.forEach(jobSkill => {
      const skillName = typeof jobSkill === 'object' ? jobSkill.name : jobSkill;
      const found = resumeSkills.some(resumeSkill => 
        skillMatches(resumeSkill, skillName)
      );
      
      if (found) {
        matchedSkills.push(skillName);
      } else {
        missingSkills.push(skillName);
      }
    });

    // Save or update score
    const scoreData = {
      resumeId,
      jobId,
      skillScore,
      experienceScore,
      educationScore,
      finalScore,
      missingSkills,
      matchedSkills,
      scoreBreakdown: {
        skillWeight: 60,
        experienceWeight: 25,
        educationWeight: 15
      }
    };

    let score = await Score.findOne({ resumeId });
    if (score) {
      Object.assign(score, scoreData);
      await score.save();
    } else {
      score = await Score.create(scoreData);
    }

    // Update resume status
    resume.status = 'scored';
    await resume.save();

    return score;
  } catch (error) {
    throw new Error(`Score calculation failed: ${error.message}`);
  }
};

/**
 * Calculate skill match score (0-100)
 */
const calculateSkillScore = (jobSkills, resumeSkills, resumeText) => {
  if (jobSkills.length === 0) return 100;

  let totalWeight = 0;
  let matchedWeight = 0;

  jobSkills.forEach(jobSkill => {
    const skillName = typeof jobSkill === 'object' ? jobSkill.name : jobSkill;
    const weight = typeof jobSkill === 'object' ? (jobSkill.weight || 1) : 1;
    
    totalWeight += weight;

    // Check if skill is in resume
    const found = resumeSkills.some(resumeSkill => 
      skillMatches(resumeSkill, skillName)
    );

    if (found) {
      matchedWeight += weight;
    }
  });

  if (totalWeight === 0) return 100;

  return Math.round((matchedWeight / totalWeight) * 100);
};

/**
 * Calculate experience match score (0-100)
 */
const calculateExperienceScore = (requiredLevel, extractedExp, resumeText) => {
  const levelMap = {
    'entry': 0,
    'mid': 2,
    'senior': 5,
    'executive': 10
  };

  const requiredYears = levelMap[requiredLevel] || 0;

  // Extract years from experience
  let candidateYears = 0;
  
  if (extractedExp) {
    const yearMatch = extractedExp.match(/(\d+)/);
    if (yearMatch) {
      candidateYears = parseInt(yearMatch[1]);
    }
  }

  // Also check resume text for years
  const yearPatterns = [
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/i,
    /experience[:\s]+(\d+)/i
  ];

  yearPatterns.forEach(pattern => {
    const match = resumeText.match(pattern);
    if (match && !candidateYears) {
      candidateYears = parseInt(match[1]);
    }
  });

  // Score based on how close candidate is to required level
  if (candidateYears >= requiredYears) {
    return 100;
  } else if (requiredYears === 0) {
    return 100; // Entry level - any experience is fine
  } else {
    // Partial score based on percentage
    const percentage = Math.max(0, (candidateYears / requiredYears) * 100);
    return Math.round(Math.min(100, percentage + 20)); // Add 20 points for partial match
  }
};

/**
 * Calculate education score (0-100)
 */
const calculateEducationScore = (education) => {
  if (!education || education.length === 0) {
    return 30; // Low score if no education mentioned
  }

  const educationText = education.join(' ').toLowerCase();
  
  // Higher education gets higher score
  if (educationText.includes('phd') || educationText.includes('doctorate')) {
    return 100;
  } else if (educationText.includes('master') || educationText.includes('mba') || educationText.includes('ms')) {
    return 90;
  } else if (educationText.includes('bachelor') || educationText.includes('bsc') || educationText.includes('ba') || educationText.includes('bs')) {
    return 80;
  } else if (educationText.includes('diploma') || educationText.includes('degree')) {
    return 60;
  } else {
    return 50;
  }
};

