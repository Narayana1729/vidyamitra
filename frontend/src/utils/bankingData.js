// ─── BANKING EXAM INFO ───
export const BANKING_EXAM_INFO = {
  name: 'Banking Exams (IBPS/SBI)',
  fullName: 'Institute of Banking Personnel Selection / State Bank of India',
  conductedBy: 'IBPS / SBI',
  duration: 'Prelims: 60 mins, Mains: ~3 hrs',
  totalMarks: 'Prelims: 100, Mains: Varies (~200)',
  totalQuestions: 'Prelims: 100, Mains: ~155 to 190',
  sections: [
    { name: 'Quantitative Aptitude', questions: 35, marks: 35, detail: 'DI, Arithmetic, Number Series, Simplification' },
    { name: 'Reasoning Ability', questions: 35, marks: 35, detail: 'Puzzles, Seating Arrangement, Syllogism, inequalities' },
    { name: 'English Language', questions: 30, marks: 30, detail: 'Reading Comprehension, Error Spotting, Cloze Test' },
  ],
  markingScheme: [
    { type: 'Correct Answer', correct: '+1', wrong: '-0.25' },
  ],
  eligibility: [
    'A bachelor\'s degree in any discipline from a recognized university',
    'Age Limit: Generally 20-30 years (varies by specific exam)'
  ],
  importantDates: [
    { event: 'SBI PO Notification', date: 'September - October' },
    { event: 'IBPS PO Notification', date: 'August - September' },
  ],
  cutoffs: {
    note: 'Expected Prelims Cutoff (General/UR)',
    categories: [
      { name: 'SBI PO Prelims', range: '55-60 marks out of 100' },
      { name: 'IBPS PO Prelims', range: '50-55 marks out of 100' },
    ],
  },
  benefits: [
    'Job Security & Prestige',
    'High Salary Package & Perks',
    'Fast career progression to management roles'
  ],
};

export const BANKING_PLATFORMS = [
  { name: 'Adda247', url: 'https://www.adda247.com/', type: 'Freemium', icon: '🏦', desc: 'Popular for daily quizzes and video courses.' },
  { name: 'Oliveboard', url: 'https://www.oliveboard.in/', type: 'Paid', icon: '📝', desc: 'Renowned for high-level mock tests matching exact exam patterns.' },
];

export const BANKING_BRANCHES = {
  BANKING: {
    code: 'BANKING', name: 'General Banking Preparation',
    subjects: [
      {
        id: 'quant', name: 'Quantitative & Numerical Ability', weightage: 35, icon: '➗', color: '#10b981', phase: 1, studyWeeks: 4, order: 1,
        topics: ['Data Interpretation (DI)', 'Quadratic Equations', 'Number Series', 'Simplification & Approximation', 'Arithmetic (Time & Work, Profit Loss)'],
        books: [{ name: 'Quantitative Aptitude', author: 'R.S. Aggarwal' }],
        questions: []
      },
      {
        id: 'reasoning', name: 'Reasoning & Computer Aptitude', weightage: 35, icon: '🧠', color: '#3b82f6', phase: 1, studyWeeks: 5, order: 2,
        topics: ['Puzzles & Seating Arrangement', 'Syllogism', 'Inequalities', 'Blood Relations', 'Pattern & Coding'],
        books: [{ name: 'A Modern Approach to Verbal Reasoning', author: 'R.S. Aggarwal' }],
        questions: []
      },
      {
        id: 'english', name: 'English Language', weightage: 30, icon: '📖', color: '#f59e0b', phase: 1, studyWeeks: 4, order: 3,
        topics: ['Reading Comprehension', 'Error Spotting', 'Cloze Test', 'Para Jumbles'],
        books: [{ name: 'Word Power Made Easy', author: 'Norman Lewis' }],
        questions: []
      },
      {
        id: 'ga', name: 'General & Financial Awareness (Mains)', weightage: 20, icon: '📰', color: '#ec4899', phase: 2, studyWeeks: 3, order: 4,
        topics: ['Current Affairs (Last 6 months)', 'Banking & Financial Terms', 'Static GK'],
        books: [],
        questions: []
      }
    ],
    youtubeChannels: [
      { name: 'Bankers Point', url: 'https://youtube.com/@BankersPoint', desc: 'Daily current affairs and banking basics.' }
    ]
  }
};

export const BANKING_STUDY_PHASES = [
  { id: 1, name: 'Speed & Fundamentals', color: '#3b82f6', description: 'Master multiplication tables, square roots, and basic grammar rules.' },
  { id: 2, name: 'Moderate Practice', color: '#f59e0b', description: 'Focus on Data Interpretation and moderate level Puzzles daily.' },
  { id: 3, name: 'Mains & Current Affairs', color: '#10b981', description: 'Daily reading of current affairs capsule & High-level DI/Puzzles.' },
  { id: 4, name: 'Mock Mastery', color: '#ef4444', description: 'At least one full-length mock test daily with 1-hour deep analysis.' }
];
