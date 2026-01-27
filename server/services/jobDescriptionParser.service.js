import { extractSkills, skillSynonyms, normalizeSkill } from './resumeParser.service.js';

/**
 * Extract requirements from job description text
 */
export const parseJobDescription = (jobDescriptionText) => {
  // Defensive validation: ensure jobDescriptionText is a valid string
  if (typeof jobDescriptionText !== 'string') {
    console.warn('parseJobDescription: jobDescriptionText is not a string:', typeof jobDescriptionText);
    return {
      skills: [],
      requiredSkills: [],
      preferredSkills: [],
      experienceLevel: null,
      experienceYears: null,
      education: null,
      keywords: [],
      tools: [],
      responsibilities: []
    };
  }

  const trimmedText = jobDescriptionText.trim();
  const MIN_LENGTH = 30;
  
  if (trimmedText.length === 0) {
    console.warn('parseJobDescription: jobDescriptionText is empty after trimming');
    return {
      skills: [],
      requiredSkills: [],
      preferredSkills: [],
      experienceLevel: null,
      experienceYears: null,
      education: null,
      keywords: [],
      tools: [],
      responsibilities: []
    };
  }

  // Log parsing attempt
  console.log('parseJobDescription: Parsing job description:', {
    length: trimmedText.length,
    preview: trimmedText.substring(0, 100),
    minRequired: MIN_LENGTH,
    isValid: trimmedText.length >= MIN_LENGTH
  });

  const normalizedText = trimmedText.toLowerCase();
  
  // Extract skills from job description
  const skills = extractSkillsFromJobDescription(normalizedText);
  
  // Extract experience requirements
  const experience = extractExperienceRequirements(normalizedText);
  
  // Extract education requirements
  const education = extractEducationRequirements(normalizedText);
  
  // Extract important keywords
  const keywords = extractKeywords(normalizedText);

  const tools = extractTools(normalizedText);
  const responsibilities = extractResponsibilities(trimmedText);
  
  // Log parsing results
  console.log('parseJobDescription: Parsing results:', {
    skillsCount: skills.length,
    requiredSkillsCount: skills.length,
    preferredSkillsCount: 0,
    experienceLevel: experience.level,
    experienceYears: experience.years,
    education,
    keywordsCount: keywords.length,
    toolsCount: tools.length,
    responsibilitiesCount: responsibilities.length
  });

  return {
    skills, // Combined required + preferred skills
    requiredSkills: skills, // For now, treat all as required (can be enhanced)
    preferredSkills: [], // Can be enhanced to separate preferred skills
    experienceLevel: experience.level,
    experienceYears: experience.years,
    education,
    keywords,
    tools, // Extract tools & technologies
    responsibilities // Extract role responsibilities
  };
};

/**
 * Extract skills from job description
 * Returns: { required: [], preferred: [] }
 */
const extractSkillsFromJobDescription = (text) => {
  const requiredSkills = [];
  const preferredSkills = [];
  const commonSkills = Object.keys(skillSynonyms);
  
  // Check for common tech skills
  commonSkills.forEach(skill => {
    const synonyms = skillSynonyms[skill];
    synonyms.forEach(synonym => {
      const regex = new RegExp(`\\b${synonym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(text) && !requiredSkills.includes(skill) && !preferredSkills.includes(skill)) {
        // Check if it's marked as required or preferred
        const requiredPattern = new RegExp(`(?:required|must have|essential|mandatory).*?${synonym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
        const preferredPattern = new RegExp(`(?:preferred|nice to have|plus|bonus).*?${synonym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
        
        if (requiredPattern.test(text)) {
          requiredSkills.push(skill);
        } else if (preferredPattern.test(text)) {
          preferredSkills.push(skill);
        } else {
          // Default to required if not specified
          requiredSkills.push(skill);
        }
      }
    });
  });

  // Also look for skills mentioned in "Requirements" or "Skills" sections
  const requirementPatterns = [
    /(?:required|must have|essential|mandatory|skills?|technologies?|proficiency in)[:\s]+([^\.]+)/gi,
    /(?:experience with|knowledge of|familiarity with)[:\s]+([^\.]+)/gi
  ];

  requirementPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const skillsText = match[1];
      const skillList = skillsText.split(/[,;•\-\n]/);
      skillList.forEach(skill => {
        const cleanSkill = skill.trim().toLowerCase();
        if (cleanSkill.length > 2 && cleanSkill.length < 30) {
          // Check if it matches any known skill
          const matchedSkill = commonSkills.find(s => {
            const synonyms = skillSynonyms[s] || [s];
            return synonyms.some(syn => cleanSkill.includes(syn) || syn.includes(cleanSkill));
          });
          if (matchedSkill && !requiredSkills.includes(matchedSkill) && !preferredSkills.includes(matchedSkill)) {
            requiredSkills.push(matchedSkill);
          } else if (!requiredSkills.includes(cleanSkill) && !preferredSkills.includes(cleanSkill)) {
            requiredSkills.push(cleanSkill);
          }
        }
      });
    }
  });

  // Combine required and preferred, prioritizing required
  const allSkills = [...requiredSkills, ...preferredSkills.filter(s => !requiredSkills.includes(s))];
  return allSkills; // Return flat array for backward compatibility
};

/**
 * Extract experience requirements
 */
const extractExperienceRequirements = (text) => {
  let level = null;
  let years = null;

  // Check for experience level keywords
  const levelPatterns = {
    'entry': /entry[\s-]?level|junior|0[\s-]?2\s*years|fresh|graduate/i,
    'mid': /mid[\s-]?level|intermediate|2[\s-]?5\s*years|3[\s-]?5\s*years/i,
    'senior': /senior|5[\s+]?\s*years|5\+|lead|principal/i,
    'executive': /executive|director|vp|vice[\s-]?president|10\+|10[\s+]?\s*years/i
  };

  for (const [key, pattern] of Object.entries(levelPatterns)) {
    if (pattern.test(text)) {
      level = key;
      break;
    }
  }

  // Extract specific years
  const yearPatterns = [
    /(\d+)[\s-]?(\+)?\s*(?:years?|yrs?|yr)\s*(?:of\s*)?(?:experience|exp)/i,
    /(?:minimum|at least|minimum of)\s*(\d+)\s*(?:years?|yrs?)/i,
    /(\d+)[\s-](\d+)\s*years/i
  ];

  for (const pattern of yearPatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[2] === '+' || match[2] === undefined) {
        years = parseInt(match[1]);
      } else if (match[2] && match[3]) {
        // Range like "3-5 years"
        years = Math.max(parseInt(match[1]), parseInt(match[2]));
      }
      break;
    }
  }

  // Set default level based on years if not found
  if (!level && years !== null) {
    if (years === 0 || years <= 2) level = 'entry';
    else if (years <= 5) level = 'mid';
    else if (years <= 10) level = 'senior';
    else level = 'executive';
  }

  return { level, years };
};

/**
 * Extract education requirements
 */
const extractEducationRequirements = (text) => {
  const educationKeywords = {
    'phd': /ph\.?d\.?|doctorate|doctoral/i,
    'master': /master['s]?|m\.?s\.?|m\.?a\.?|mba|msc/i,
    'bachelor': /bachelor['s]?|b\.?s\.?|b\.?a\.?|bsc|degree/i,
    'diploma': /diploma|certificate/i
  };

  for (const [level, pattern] of Object.entries(educationKeywords)) {
    if (pattern.test(text)) {
      return level;
    }
  }

  return null;
};

/**
 * Extract important keywords from job description
 */
const extractKeywords = (text) => {
  const keywords = [];
  
  // Common important keywords
  const importantKeywords = [
    'agile', 'scrum', 'ci/cd', 'devops', 'microservices', 'api', 'rest', 'graphql',
    'cloud', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'testing', 'tdd', 'bdd',
    'leadership', 'mentoring', 'team', 'collaboration', 'communication', 'problem solving'
  ];

  importantKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text)) {
      keywords.push(keyword);
    }
  });

  return keywords;
};

/**
 * Extract tools & technologies from job description
 */
const extractTools = (text) => {
  const tools = [];
  const toolKeywords = [
    'jira', 'confluence', 'slack', 'github', 'gitlab', 'jenkins', 'docker', 'kubernetes',
    'aws', 'azure', 'gcp', 'terraform', 'ansible', 'chef', 'puppet', 'vagrant',
    'postman', 'swagger', 'graphql', 'rest', 'soap', 'microservices', 'api',
    'ci/cd', 'devops', 'agile', 'scrum', 'kanban', 'trello'
  ];

  toolKeywords.forEach(tool => {
    const regex = new RegExp(`\\b${tool.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text) && !tools.includes(tool)) {
      tools.push(tool);
    }
  });

  return tools;
};

/**
 * Extract role responsibilities from job description
 */
const extractResponsibilities = (text) => {
  const responsibilities = [];
  const responsibilityPatterns = [
    /(?:you will|responsibilities?|duties?|key responsibilities?)[:\s]+([^\.]+)/gi,
    /(?:•|[-*])\s*([^\.]+)/g
  ];

  responsibilityPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const responsibility = match[1]?.trim();
      if (responsibility && responsibility.length > 10 && responsibility.length < 200) {
        responsibilities.push(responsibility);
      }
    }
  });

  return responsibilities.slice(0, 10); // Limit to 10 responsibilities
};

