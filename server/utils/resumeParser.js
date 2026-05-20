const pdfParse = require('pdf-parse');

const SKILL_LIST = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Express',
  'MongoDB',
  'SQL',
  'Python',
  'Java',
  'C++',
  'AWS',
  'Docker',
  'Git',
  'REST API',
  'GraphQL',
  'HTML',
  'CSS',
  'Tailwind',
  'Redux',
  'Vue',
  'Angular',
  'PostgreSQL',
  'MySQL',
  'Redis',
  'Kubernetes',
  'CI/CD',
  'Agile',
  'Scrum',
  'Figma',
  'Communication',
  'Leadership',
  'Project Management',
  'HR',
  'Recruiting',
  'Onboarding',
  'Payroll',
  'Excel',
  'Power BI',
  'Tableau',
  'Data Analysis',
  'Machine Learning',
];

const parsePDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch {
    return '';
  }
};

const extractFields = (text = '') => {
  const emailMatch = text.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i
  );
  const email = emailMatch ? emailMatch[0].toLowerCase() : '';

  const phoneMatch = text.match(
    /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}(?:[\s-]?\d{1,4})?/
  );
  const phone = phoneMatch ? phoneMatch[0].trim() : '';

  const linkedInMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?/i
  );
  const linkedIn = linkedInMatch
    ? linkedInMatch[0].startsWith('http')
      ? linkedInMatch[0]
      : `https://${linkedInMatch[0]}`
    : '';

  const lowerText = text.toLowerCase();
  const skills = SKILL_LIST.filter((skill) =>
    lowerText.includes(skill.toLowerCase())
  );

  return {
    email,
    phone,
    linkedIn,
    skills: [...new Set(skills)],
  };
};

module.exports = {
  parsePDF,
  extractFields,
};
