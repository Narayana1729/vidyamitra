// ─── MBA / CAT EXAM INFO ───
export const CAT_EXAM_INFO = {
  name: 'CAT 2026',
  fullName: 'Common Admission Test',
  conductedBy: 'IIMs (Rotating)',
  duration: '2 hours (120 minutes) — 40 mins per section',
  totalMarks: 198,
  totalQuestions: 66,
  sections: [
    { name: 'VARC (Verbal Ability & Reading Comprehension)', questions: 24, marks: 72, detail: '16 RC + 8 VA' },
    { name: 'DILR (Data Interpretation & Logical Reasoning)', questions: 20, marks: 60, detail: '4 sets of 5 questions each' },
    { name: 'QA (Quantitative Aptitude)', questions: 22, marks: 66, detail: 'Arithmetic, Algebra, Number System, Geometry' },
  ],
  markingScheme: [
    { type: 'MCQs', correct: '+3', wrong: '-1' },
    { type: 'TITA (Non-MCQs)', correct: '+3', wrong: '0' },
  ],
  eligibility: [
    'Bachelor\'s degree with at least 50% marks (45% for SC/ST/PwD)',
    'Final year undergraduate students can apply',
    'No upper age limit',
  ],
  importantDates: [
    { event: 'Notification Release', date: 'July' },
    { event: 'Registration Opens', date: 'August' },
    { event: 'Admit Card', date: 'October' },
    { event: 'Exam Date', date: 'November (Last Sunday)' },
  ],
  cutoffs: {
    note: 'Percentile required for top IIMs (Approx)',
    categories: [
      { name: 'BLACKI IIMs', range: '99+ %ile' },
      { name: 'New IIMs', range: '95+ %ile' },
      { name: 'Baby IIMs', range: '90+ %ile' },
    ],
  },
  benefits: [
    'Admission to 21 IIMs and other top B-Schools (FMS, SPJIMR, MDI)',
    'Excellent ROI and placements (Avg 20LPA+)',
    'Fast-track to management and strategy roles',
  ],
};

export const CAT_BRANCHES = {
  CAT: {
    code: 'CAT', name: 'Common Admission Test',
    subjects: [
      {
        id: 'varc', name: 'Verbal Ability & Reading Comprehension', weightage: 36, icon: '📖', color: '#3b82f6', phase: 1, studyWeeks: 4, order: 1,
        topics: ['Reading Comprehension', 'Para Jumbles', 'Para Summary', 'Odd Sentence Out'],
        books: [{ name: 'How to Prepare for VARC for CAT', author: 'Meenakshi Upadhyay & Arun Sharma' }, { name: 'Word Power Made Easy', author: 'Norman Lewis' }],
        questions: []
      },
      {
        id: 'dilr', name: 'Data Interpretation & Logical Reasoning', weightage: 30, icon: '🧩', color: '#f59e0b', phase: 2, studyWeeks: 5, order: 2,
        topics: ['Seating Arrangement', 'Blood Relations', 'Syllogism', 'Tables & Pie Charts', 'Games & Tournaments', 'Set Theory (Venn Diagrams)'],
        books: [{ name: 'Logical Reasoning for CAT', author: 'Arun Sharma' }, { name: 'Data Interpretation for CAT', author: 'Arun Sharma' }],
        questions: []
      },
      {
        id: 'qa', name: 'Quantitative Aptitude', weightage: 34, icon: '➗', color: '#10b981', phase: 1, studyWeeks: 6, order: 3,
        topics: ['Arithmetic (Profit/Loss, Time/Work)', 'Algebra (Equations, Inequalities)', 'Geometry & Mensuration', 'Number System', 'Modern Math (P&C, Probability)'],
        books: [{ name: 'Quantitative Aptitude for CAT', author: 'Arun Sharma' }, { name: 'Quantum CAT', author: 'Sarvesh K. Verma' }],
        questions: []
      }
    ],
    youtubeChannels: [
      { name: 'Rodha', url: 'https://youtube.com/@Rodha', desc: 'Best for QA and DILR basics.' },
      { name: '2IIM CAT Preparation', url: 'https://youtube.com/@2iim', desc: 'Excellent conceptual clarity.' }
    ]
  }
};

export const CAT_STUDY_PHASES = [
  { id: 1, name: 'Concept Building', color: '#3b82f6', description: 'Clear basics of Arithmetic, Algebra, and start reading editorials.' },
  { id: 2, name: 'Practice & DILR Intensive', color: '#f59e0b', description: 'Solve 2-3 DILR sets daily. Advanced QA topics.' },
  { id: 3, name: 'Sectional Tests & Strategy', color: '#10b981', description: 'Take timed sectional tests to master the 40-minute limit.' },
  { id: 4, name: 'Full Mock Mela', color: '#ef4444', description: '1 mock every 2 days. Analyze weak areas.' },
];
