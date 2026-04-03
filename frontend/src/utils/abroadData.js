// ─── ABROAD EXAM INFO ───
export const ABROAD_EXAM_INFO = {
  name: 'Study Abroad (IELTS/TOEFL/GMAT)',
  fullName: 'International English Language Testing System & GMAT',
  conductedBy: 'British Council / IDP / GMAC',
  duration: 'IELTS: 2 hours 45 mins, GMAT: 2 hours 15 mins',
  totalMarks: 'IELTS: 9 Band, GMAT: 805',
  totalQuestions: 'Varies by test',
  sections: [
    { name: 'Reading', questions: 40, marks: 9, detail: '3 passages, matching, multiple choice (IELTS)' },
    { name: 'Listening', questions: 40, marks: 9, detail: '4 audio recordings, monologues and conversations' },
    { name: 'Speaking', questions: 3, marks: 9, detail: 'Interview, Short Presentation, Discussion (11-14 mins)' },
    { name: 'Writing', questions: 2, marks: 9, detail: 'GMAT AWA or IELTS Task 1 (Graph) & Task 2 (Essay)' },
  ],
  markingScheme: [
    { type: 'GMAT Computer Adaptive', correct: 'Varies', wrong: 'Penalty for unattempted' },
  ],
  eligibility: [
    'Valid Passport required to book exams',
    'No strict age limit usually',
  ],
  importantDates: [
    { event: 'Exam Dates', date: 'Multiple dates available every month' },
    { event: 'Fall Intake', date: 'Applications due Oct - Jan' },
  ],
  cutoffs: {
    note: 'Good Scores for Top Universities',
    categories: [
      { name: 'Top Tier MBA', range: 'GMAT 650+ (Focus Edition equivalent)' },
      { name: 'Top Univ English', range: 'IELTS 7.0+ (No band < 6.5)' },
    ],
  },
  benefits: [
    'Global Exposure and high standard of living',
    'Post-study work visas (OPT, PSW)',
    'Immigration pathways via education (e.g. Canada Express Entry)'
  ],
};

export const ABROAD_PLATFORMS = [
  { name: 'IELTS Liz', url: 'https://ieltsliz.com/', type: 'Free', icon: '📝', desc: 'Amazing resource for sample essays and speaking topics.' },
  { name: 'GMAT Club', url: 'https://gmatclub.com/', type: 'Free', icon: '🌐', desc: 'The largest global community for GMAT preparation and MBA admissions.' },
];

export const ABROAD_BRANCHES = {
  GENERAL_ABROAD: {
    code: 'GENERAL_ABROAD', name: 'Pathways: Masters / MBA Abroad',
    subjects: [
      {
        id: 'ielts_reading', name: 'IELTS/TOEFL Reading & Listening', weightage: 30, icon: '📖', color: '#10b981', phase: 1, studyWeeks: 2, order: 1,
        topics: ['Skimming & Scanning', 'True/False/Not Given', 'Note Completion', 'Active Listening Strategies'],
        books: [{ name: 'Cambridge IELTS Academic 11-18', author: 'Cambridge' }],
        questions: []
      },
      {
        id: 'ielts_writing', name: 'Writing & Speaking', weightage: 30, icon: '✍️', color: '#3b82f6', phase: 1, studyWeeks: 3, order: 2,
        topics: ['Graph analysis (Task 1)', 'Opinion Essays (Task 2)', 'Speaking Fluency & Lexical Resource'],
        books: [],
        questions: []
      },
      {
        id: 'gmat_quant', name: 'GMAT/GRE Quant & Logic', weightage: 40, icon: '➗', color: '#f59e0b', phase: 2, studyWeeks: 6, order: 3,
        topics: ['Data Insights', 'Problem Solving', 'Critical Reasoning'],
        books: [{ name: 'GMAT Official Guide', author: 'GMAC' }],
        questions: []
      }
    ],
    youtubeChannels: [
      { name: 'E2 IELTS', url: 'https://youtube.com', desc: 'Excellent score-boosting strategies.' }
    ]
  }
};

export const ABROAD_STUDY_PHASES = [
  { id: 1, name: 'English Proficiency', color: '#3b82f6', description: 'Schedule your IELTS/TOEFL and practice daily using Cambridge Books.' },
  { id: 2, name: 'Aptitude/GMAT', color: '#f59e0b', description: 'Begin intensive quantitative and verbal logic prep.' },
  { id: 3, name: 'Applications & SOP', color: '#10b981', description: 'Shortlist universities, draft Statement of Purpose (SOP) and Letters of Recommendation (LOR).' }
];
