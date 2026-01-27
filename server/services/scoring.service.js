import Score from '../models/Score.model.js';
import Resume from '../models/Resume.model.js';
import Job from '../models/Job.model.js';
import { extractSkills, skillMatches } from './resumeParser.service.js';
import { parseJobDescription } from './jobDescriptionParser.service.js';

/**
 * Calculate ATS Score for a resume (with job description text)
 * Skill Match: 60%
 * Experience Match: 25%
 * Education Match: 15%
 */
export const calculateScoreFromJobDescription = async (resumeId, jobDescriptionText) => {
  // Defensive validation: ensure jobDescriptionText is valid
  const MIN_JOB_DESCRIPTION_LENGTH = 30;
  
  // Store original for error logging
  const originalJobDescText = jobDescriptionText;
  
  try {
    console.log('=== calculateScoreFromJobDescription START ===');
    console.log('Input validation:', {
      resumeId,
      jobDescriptionTextType: typeof jobDescriptionText,
      jobDescriptionTextExists: !!jobDescriptionText,
      jobDescriptionTextLength: jobDescriptionText?.length || 0,
      jobDescriptionTextPreview: jobDescriptionText?.substring(0, 100) || 'NULL'
    });

    // Validate jobDescriptionText before proceeding
    if (typeof jobDescriptionText !== 'string') {
      throw new Error(`Invalid job description: expected string, got ${typeof jobDescriptionText}`);
    }

    const trimmedJobDesc = jobDescriptionText.trim();
    if (trimmedJobDesc.length < MIN_JOB_DESCRIPTION_LENGTH) {
      console.warn('Job description too short:', {
        length: trimmedJobDesc.length,
        minRequired: MIN_JOB_DESCRIPTION_LENGTH
      });
      // Still proceed with analysis but log warning
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      throw new Error('Resume not found');
    }

    console.log('Resume data:', {
      resumeId: resume._id,
      hasParsedText: !!resume.parsedText,
      parsedTextLength: resume.parsedText?.length || 0,
      extractedSkillsCount: resume.extractedSkills?.length || 0,
      hasExtractedExperience: !!resume.extractedExperience,
      extractedEducationCount: resume.extractedEducation?.length || 0
    });

    // Parse job description to extract requirements
    console.log('Calling parseJobDescription with:', {
      textLength: trimmedJobDesc.length,
      preview: trimmedJobDesc.substring(0, 100)
    });
    
    const jobRequirements = parseJobDescription(trimmedJobDesc);
    
    console.log('Job requirements parsed:', {
      skillsCount: jobRequirements.skills?.length || 0,
      experienceLevel: jobRequirements.experienceLevel,
      experienceYears: jobRequirements.experienceYears,
      education: jobRequirements.education,
      keywordsCount: jobRequirements.keywords?.length || 0
    });
    
    const jobSkills = jobRequirements.skills || [];
    const resumeSkills = resume.extractedSkills || [];
    const resumeText = resume.parsedText ? resume.parsedText.toLowerCase() : '';
    
    console.log('Before scoring calculation:', {
      jobSkillsCount: jobSkills.length,
      resumeSkillsCount: resumeSkills.length,
      resumeTextLength: resumeText.length
    });

    // 1. Skill Score (60%)
    const skillScore = calculateSkillScore(jobSkills, resumeSkills, resumeText);

    // 2. Experience Score (25%)
    const experienceScore = calculateExperienceScore(
      jobRequirements.experienceLevel, 
      resume.extractedExperience, 
      resumeText,
      jobRequirements.experienceYears
    );

    // 3. Education Score (15%)
    const educationScore = calculateEducationScore(
      resume.extractedEducation,
      jobRequirements.education
    );

    // Calculate final weighted score
    const finalScore = Math.round(
      (skillScore * 0.60) +
      (experienceScore * 0.25) +
      (educationScore * 0.15)
    );

    console.log('Score calculation results:', {
      skillScore,
      experienceScore,
      educationScore,
      finalScore
    });

    // Find missing skills
    const matchedSkills = [];
    const missingSkills = [];

    // If jobSkills is empty but JD text exists, still allow analysis
    if (jobSkills.length === 0 && trimmedJobDesc.length >= MIN_JOB_DESCRIPTION_LENGTH) {
      console.warn('No skills extracted from job description, but JD text exists. Proceeding with analysis.');
      // Use keywords or tools as fallback
      const fallbackSkills = [...(jobRequirements.keywords || []), ...(jobRequirements.tools || [])];
      if (fallbackSkills.length > 0) {
        console.log('Using fallback skills from keywords/tools:', fallbackSkills.length);
      }
    }

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

    console.log('Skill matching results:', {
      matchedSkillsCount: matchedSkills.length,
      missingSkillsCount: missingSkills.length,
      matchedSkills: matchedSkills.slice(0, 10),
      missingSkills: missingSkills.slice(0, 10)
    });

    // Save or update score
    const scoreData = {
      resumeId,
      jobId: null, // No jobId when using job description text
      skillScore,
      experienceScore,
      educationScore,
      finalScore,
      missingSkills,
      matchedSkills,
      scoreBreakdown: {
        skillWeight: 60,
        experienceWeight: 25,
        educationWeight: 15,
        jobDescription: true
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

    console.log('=== calculateScoreFromJobDescription SUCCESS ===');
    console.log('Final score:', {
      scoreId: score._id,
      finalScore: score.finalScore,
      skillScore: score.skillScore,
      experienceScore: score.experienceScore,
      educationScore: score.educationScore
    });

    return score;
  } catch (error) {
    console.error('=== calculateScoreFromJobDescription ERROR ===');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      resumeId,
      jobDescriptionTextType: typeof originalJobDescText,
      jobDescriptionTextLength: originalJobDescText?.length || 0
    });
    throw new Error(`Score calculation failed: ${error.message}`);
  }
};

/**
 * Calculate ATS Score for a resume (with Job model)
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
const calculateExperienceScore = (requiredLevel, extractedExp, resumeText, requiredYearsOverride = null) => {
  const levelMap = {
    'entry': 0,
    'mid': 2,
    'senior': 5,
    'executive': 10
  };

  const requiredYears = requiredYearsOverride !== null ? requiredYearsOverride : (levelMap[requiredLevel] || 0);

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
const calculateEducationScore = (education, requiredEducation = null) => {
  if (!education || education.length === 0) {
    return requiredEducation ? 30 : 50; // Lower score if education required but not found
  }

  const educationText = education.join(' ').toLowerCase();
  
  // If specific education is required, check match
  if (requiredEducation) {
    const requiredLevel = requiredEducation.toLowerCase();
    const candidateLevel = getEducationLevel(educationText);
    
    // Score based on how well candidate education matches requirement
    if (requiredLevel === 'phd' && candidateLevel === 'phd') return 100;
    if (requiredLevel === 'master' && (candidateLevel === 'master' || candidateLevel === 'phd')) return 100;
    if (requiredLevel === 'bachelor' && (candidateLevel === 'bachelor' || candidateLevel === 'master' || candidateLevel === 'phd')) return 100;
    if (requiredLevel === 'diploma' && candidateLevel !== 'none') return 80;
    
    // Partial match
    if (requiredLevel === 'master' && candidateLevel === 'bachelor') return 70;
    if (requiredLevel === 'bachelor' && candidateLevel === 'diploma') return 60;
    
    return 40; // Low match
  }
  
  // Higher education gets higher score (general scoring)
  return getEducationLevelScore(educationText);
};

const getEducationLevel = (educationText) => {
  if (educationText.includes('phd') || educationText.includes('doctorate')) return 'phd';
  if (educationText.includes('master') || educationText.includes('mba') || educationText.includes('ms')) return 'master';
  if (educationText.includes('bachelor') || educationText.includes('bsc') || educationText.includes('ba') || educationText.includes('bs')) return 'bachelor';
  if (educationText.includes('diploma') || educationText.includes('degree')) return 'diploma';
  return 'none';
};

const getEducationLevelScore = (educationText) => {
  if (educationText.includes('phd') || educationText.includes('doctorate')) return 100;
  if (educationText.includes('master') || educationText.includes('mba') || educationText.includes('ms')) return 90;
  if (educationText.includes('bachelor') || educationText.includes('bsc') || educationText.includes('ba') || educationText.includes('bs')) return 80;
  if (educationText.includes('diploma') || educationText.includes('degree')) return 60;
  return 50;
};

