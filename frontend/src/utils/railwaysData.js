// ─── RAILWAYS EXAM INFO ───
export const RAILWAYS_EXAM_INFO = {
  name: 'RRB Exams (NTPC/ALP)',
  fullName: 'Railway Recruitment Board - NTPC & ALP',
  conductedBy: 'Ministry of Railways (RRB)',
  duration: 'CBT-1: 90 minutes',
  totalMarks: 100,
  totalQuestions: 100,
  sections: [
    { name: 'General Awareness', questions: 40, marks: 40, detail: 'Current Affairs, General Science, History, Polity' },
    { name: 'Mathematics', questions: 30, marks: 30, detail: 'Arithmetic, Basic Algebra, Geometry' },
    { name: 'General Intelligence & Reasoning', questions: 30, marks: 30, detail: 'Coding-Decoding, Puzzles, Series' },
  ],
  markingScheme: [
    { type: 'Correct Answer', correct: '+1', wrong: '-1/3' },
  ],
  eligibility: [
    'NTPC: 12th pass (for some levels) or Graduation (for higher levels)',
    'ALP: 10th pass + ITI/Diploma/Engineering Degree',
    'Age Limit: Usually 18-30 or 18-33 (with category relaxations)'
  ],
  importantDates: [
    { event: 'Notifications Release', date: 'Varies radically (usually announced in batches)' },
    { event: 'CBT-1 Examination', date: 'Varies' },
  ],
  cutoffs: {
    note: 'Variable due to Normalization across shifts',
    categories: [
      { name: 'General', range: '70-80 marks (Normalized)' },
      { name: 'OBC', range: '65-75 marks' },
    ],
  },
  benefits: [
    'Central Government Job Profile',
    'Travel allowances and medical facilities',
    'Excellent Job Security'
  ],
};

export const RAILWAYS_PLATFORMS = [
  { name: 'Testbook', url: 'https://testbook.com/', type: 'Freemium', icon: '📊', desc: 'The gold standard platform for RRB Mock Tests.' },
  { name: 'Exampur', url: 'https://exampur.com/', type: 'Free', icon: '📺', desc: 'Excellent youtube coverage and marathon sessions.' },
];

export const RAILWAYS_BRANCHES = {
  RAILWAYS: {
    code: 'RAILWAYS', name: 'RRB Common Preparation',
    subjects: [
      {
        id: 'maths', name: 'Mathematics', weightage: 30, icon: '➗', color: '#10b981', phase: 1, studyWeeks: 4, order: 1,
        topics: ['Number System', 'BODMAS', 'Decimals & Fractions', 'LCM & HCF', 'Ratio and Proportion', 'Percentages', 'Mensuration'],
        books: [{ name: 'Fast Track Objective Arithmetic', author: 'Rajesh Verma' }],
        questions: []
      },
      {
        id: 'reasoning', name: 'General Intelligence & Reasoning', weightage: 30, icon: '🧠', color: '#3b82f6', phase: 1, studyWeeks: 4, order: 2,
        topics: ['Analogies', 'Alphabetical and Number Series', 'Coding and Decoding', 'Mathematical operations', 'Relationships', 'Syllogism'],
        books: [{ name: 'A Modern Approach to Verbal & Non-Verbal Reasoning', author: 'R.S. Aggarwal' }],
        questions: []
      },
      {
        id: 'ga', name: 'General Awareness', weightage: 40, icon: '📰', color: '#f59e0b', phase: 2, studyWeeks: 6, order: 3,
        topics: ['Current Events of National and International Importance', 'Games and Sports', 'Art and Culture of India', 'Indian Literature', 'General Science and Life Science (up to 10th CBSE)'],
        books: [{ name: 'Lucent\'s General Knowledge', author: 'Lucent' }],
        questions: []
      }
    ],
    youtubeChannels: [
      { name: 'WiFiStudy', url: 'https://youtube.com/@wifistudy', desc: 'Extensive RRB playlist coverage.' }
    ]
  }
};

export const RAILWAYS_STUDY_PHASES = [
  { id: 1, name: 'Basic Core Concepts', color: '#3b82f6', description: 'Cover NCERT Science class 9 & 10. Learn arithmetic shortcuts.' },
  { id: 2, name: 'Pattern Recognition', color: '#f59e0b', description: 'Solve last 5 years RRB Group D and NTPC previous year papers.' },
  { id: 3, name: 'Current Affairs & Speed', color: '#10b981', description: 'Revise 1-year current affairs and start taking daily timed sectional tests.' }
];
