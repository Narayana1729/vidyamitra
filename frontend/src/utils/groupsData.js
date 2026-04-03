// ─── GROUPS / SSC EXAM INFO ───
export const GROUPS_EXAM_INFO = {
  name: 'State Groups & SSC CGL',
  fullName: 'State Public Service Commissions / Staff Selection Commission',
  conductedBy: 'SPSC / SSC',
  duration: 'SSC Tier 1: 60 mins',
  totalMarks: 'SSC: 200 (Tier 1)',
  totalQuestions: 'SSC: 100 (Tier 1)',
  sections: [
    { name: 'General Intelligence & Reasoning', questions: 25, marks: 50, detail: 'Logical thinking, spatial visualization' },
    { name: 'General Awareness', questions: 25, marks: 50, detail: 'Static GK, Current Affairs, Science' },
    { name: 'Quantitative Aptitude', questions: 25, marks: 50, detail: 'Arithmetic, Advanced Math (Algebra, Trig, Geometry)' },
    { name: 'English Comprehension', questions: 25, marks: 50, detail: 'Grammar, Vocabulary, Reading Comprehension' },
  ],
  markingScheme: [
    { type: 'Correct Answer', correct: '+2', wrong: '-0.5' },
  ],
  eligibility: [
    'SSC CGL: Bachelor\'s degree from a recognized university',
    'State Groups: Varies (12th for Group-D/C, Graduation for Group-A/B)',
    'Age Limit: 18 - 32 years (depending on post)'
  ],
  importantDates: [
    { event: 'SSC CGL Notification', date: 'Usually April-May' },
    { event: 'Tier 1 Exam', date: 'Usually July-August' },
  ],
  cutoffs: {
    note: 'Expected Tier 1 Cutoff (UR)',
    categories: [
      { name: 'SSC CGL Tier 1', range: '130 - 150 out of 200' },
    ],
  },
  benefits: [
    'Prestigious Government Roles (Income Tax Inspector, MEA)',
    'Excellent Salary and Perks',
    'Stable Work-Life Balance'
  ],
};

export const GROUPS_PLATFORMS = [
  { name: 'SSC Adda', url: 'https://sscadda.com/', type: 'Freemium', icon: '🏢', desc: 'Good for daily study material and updates.' },
  { name: 'Testbook', url: 'https://testbook.com/', type: 'Freemium', icon: '📝', desc: 'Huge repository of previous year papers as mocks.' },
];

export const GROUPS_BRANCHES = {
  SSC_CGL: {
    code: 'SSC_CGL', name: 'SSC CGL / State Groups Common Focus',
    subjects: [
      {
        id: 'maths', name: 'Quantitative Aptitude (Arithmetic & Advanced)', weightage: 30, icon: '➗', color: '#10b981', phase: 1, studyWeeks: 6, order: 1,
        topics: ['Percentages, Ratio, Average', 'Profit Loss & SI/CI', 'Algebra & Polynomials', 'Trigonometry', 'Geometry & Mensuration'],
        books: [{ name: 'Advance Maths', author: 'Rakesh Yadav' }],
        questions: []
      },
      {
        id: 'english', name: 'English Comprehension', weightage: 30, icon: '📖', color: '#3b82f6', phase: 1, studyWeeks: 5, order: 2,
        topics: ['Idioms & Phrases', 'One Word Substitution', 'Error Spotting (Grammar)', 'Active/Passive Voice & Direct/Indirect Speech', 'Reading Comprehension & Cloze Test'],
        books: [{ name: 'Objective General English', author: 'S.P. Bakshi' }, { name: 'Neetu Singh English Vol 1', author: 'Neetu Singh' }],
        questions: []
      },
      {
        id: 'reasoning', name: 'General Intelligence & Reasoning', weightage: 20, icon: '🧩', color: '#f59e0b', phase: 2, studyWeeks: 3, order: 3,
        topics: ['Analogy & Classification', 'Series (Number & Letter)', 'Coding Decoding', 'Paper Folding & Mirror Images', 'Venn Diagrams'],
        books: [{ name: 'Reasoning', author: 'Piyush Varshney' }],
        questions: []
      },
      {
        id: 'ga', name: 'General Awareness', weightage: 20, icon: '📰', color: '#ec4899', phase: 2, studyWeeks: 6, order: 4,
        topics: ['History, Geography, Polity', 'General Science (Physics, Chem, Biology)', 'Static GK', 'Current Affairs'],
        books: [{ name: 'Lucent General Knowledge', author: 'Lucent Publications' }],
        questions: []
      }
    ],
    youtubeChannels: [
      { name: 'Gagan Pratap Maths', url: 'https://youtube.com/@GaganPratapMaths', desc: 'Best for advanced math shortcuts.' }
    ]
  }
};

export const GROUPS_STUDY_PHASES = [
  { id: 1, name: 'Core Foundations', color: '#3b82f6', description: 'Complete Arithmetic basics and cover primary Grammar Rules.' },
  { id: 2, name: 'Advanced Concepts & Memorization', color: '#f59e0b', description: 'Study Geometry/Trigonometry. Start memorizing vocab and static GK daily.' },
  { id: 3, name: 'PYQ & Mock Tests', color: '#ef4444', description: 'Solve last 5 years of SSC CGL / CHSL papers in a time-bound manner.' }
];
