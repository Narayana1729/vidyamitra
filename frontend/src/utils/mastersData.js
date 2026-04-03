// ─── MASTERS EXAM INFO ───
export const MASTERS_EXAM_INFO = {
  name: 'GRE / TOEFL / IELTS',
  fullName: 'Graduate Record Examination & English Proficiency Tests',
  conductedBy: 'ETS / BC',
  duration: 'GRE: 1 hr 58 mins, English: ~2-3 hrs',
  totalMarks: 'GRE: 340, TOEFL: 120, IELTS: 9.0 Bands',
  totalQuestions: 'Varies',
  sections: [
    { name: 'GRE Quant', questions: 27, marks: 170, detail: 'Arithmetic, Algebra, Geometry, Data Analysis' },
    { name: 'GRE Verbal', questions: 27, marks: 170, detail: 'Reading Comprehension, Text Completion, Sentence Equivalence' },
    { name: 'GRE AWA', questions: 1, marks: 6.0, detail: 'Analytical Writing Assessment' },
  ],
  markingScheme: [
    { type: 'GRE Section adaptive', correct: '+1', wrong: '0' },
  ],
  eligibility: [
    'Valid Passport',
    'Undergraduate Degree (for Master\'s programs)'
  ],
  importantDates: [
    { event: 'Exam Dates', date: 'Available year-round' },
    { event: 'Fall Admissions Deadline', date: 'Dec - Jan' },
    { event: 'Spring Admissions Deadline', date: 'Aug - Sep' },
  ],
  cutoffs: {
    note: 'Good Scores for Top 50 Universities (US)',
    categories: [
      { name: 'STEM Programs', range: 'GRE: 320+ (Q:165+)' },
      { name: 'Humanities', range: 'GRE: 315+ (V:160+)' },
    ],
  },
  benefits: [
    'Admission to Top Global Universities (USA, UK, Canada, Germany)',
    'Scholarships and Fellowships',
    'STEM OPT (3 years work permit in USA)',
  ],
};

export const MASTERS_BRANCHES = {
  GRE: {
    code: 'GRE', name: 'GRE General Test',
    subjects: [
      {
        id: 'quant', name: 'Quantitative Reasoning', weightage: 50, icon: '➗', color: '#10b981', phase: 1, studyWeeks: 4, order: 1,
        topics: ['Arithmetic', 'Algebra', 'Geometry', 'Data Analysis (Probability, Statistics)'],
        books: [{ name: 'ETS Official Guide', author: 'ETS' }, { name: 'Manhattan 5 lb.', author: 'Manhattan Prep' }],
        questions: []
      },
      {
        id: 'verbal', name: 'Verbal Reasoning', weightage: 50, icon: '📖', color: '#3b82f6', phase: 1, studyWeeks: 6, order: 2,
        topics: ['Vocabulary Building (GregMat List)', 'Reading Comprehension', 'Text Completion', 'Sentence Equivalence'],
        books: [{ name: 'Word Power Made Easy', author: 'Norman Lewis' }, { name: 'ETS Verbal Reasoning', author: 'ETS' }],
        questions: []
      },
      {
        id: 'awa', name: 'Analytical Writing', weightage: 0, icon: '✍️', color: '#f59e0b', phase: 2, studyWeeks: 2, order: 3,
        topics: ['Analyze an Issue'],
        books: [{ name: 'ETS Official Guide', author: 'ETS' }],
        questions: []
      }
    ],
    youtubeChannels: [
      { name: 'GregMat', url: 'https://youtube.com/@GregMat', desc: 'The gold standard for GRE prep.' },
      { name: 'Magoosh', url: 'https://youtube.com/@MagooshGRE', desc: 'Great vocabulary and quant tricks.' }
    ]
  }
};

export const MASTERS_STUDY_PHASES = [
  { id: 1, name: 'Vocab & Fundamentals', color: '#3b82f6', description: 'Memorize 900+ vocab words. Revise basic high school math.' },
  { id: 2, name: 'Practice & Strategies', color: '#f59e0b', description: 'Learn test-taking strategies (e.g., math strategies, RC mapping).' },
  { id: 3, name: 'Mocks & AWA', color: '#ef4444', description: 'Take full-length ETS PowerPrep tests to build stamina.' },
];
