// ─── NEET EXAM INFO ───
export const NEET_EXAM_INFO = {
  name: 'NEET PG & UG / CSIR NET',
  fullName: 'National Eligibility cum Entrance Test / CSIR National Eligibility Test',
  conductedBy: 'NBE / NTA',
  duration: 'NEET PG: 3 hours 30 mins',
  totalMarks: 'NEET PG: 800 marks (200 Questions)',
  totalQuestions: 200,
  sections: [
    { name: 'Clinical Subjects', questions: 100, marks: 400, detail: 'Medicine, Surgery, Pediatrics, etc' },
    { name: 'Pre-Clinical Subjects', questions: 50, marks: 200, detail: 'Anatomy, Physiology, Biochemistry' },
    { name: 'Para-Clinical Subjects', questions: 50, marks: 200, detail: 'Pathology, Pharmacology, Microbiology' },
  ],
  markingScheme: [
    { type: 'Correct Answer', correct: '+4', wrong: '-1' },
  ],
  eligibility: [
    'MBBS degree or Provisional MBBS Pass Certificate',
    'Completion of one year of internship',
  ],
  importantDates: [
    { event: 'NEET PG Notification', date: 'Usually January' },
    { event: 'NEET PG Exam', date: 'Usually March (Dates subject to shift)' },
  ],
  cutoffs: {
    note: 'Percentile based qualifying criteria',
    categories: [
      { name: 'General/EWS', range: '50th Percentile' },
      { name: 'SC/ST/OBC', range: '40th Percentile' },
      { name: 'General-PwBD', range: '45th Percentile' },
    ],
  },
  benefits: [
    'Admission to MD/MS and PG Diploma Courses',
    'Career progression into medical specialization',
  ],
};

export const NEET_PLATFORMS = [
  { name: 'Marrow', url: 'https://www.marrow.com/', type: 'Paid', icon: '🩺', desc: 'Highly recommended for detailed clinical videos and QBank.' },
  { name: 'PrepLadder', url: 'https://www.prepladder.com/', type: 'Paid', icon: '📈', desc: 'Excellent faculty and rapid revision modules.' },
];

export const NEET_BRANCHES = {
  NEET_PG: {
    code: 'NEET_PG', name: 'NEET Post Graduate Medical',
    subjects: [
      {
        id: 'clinic', name: 'Clinical Subjects (Medicine, Surgery, OBG)', weightage: 50, icon: '🏥', color: '#10b981', phase: 3, studyWeeks: 12, order: 3,
        topics: ['Internal Medicine', 'General Surgery', 'Obstetrics & Gynaecology', 'Pediatrics'],
        books: [{ name: 'Harrison\'s Principles of Internal Medicine', author: 'Harrison' }],
        questions: []
      },
      {
        id: 'preclinic', name: 'Pre-Clinical (Anatomy, Physio, Biochem)', weightage: 25, icon: '🧬', color: '#3b82f6', phase: 1, studyWeeks: 6, order: 1,
        topics: ['Gross Anatomy', 'Systemic Physiology', 'Metabolism and Genetics'],
        books: [{ name: 'Guyton & Hall Physiology', author: 'Guyton' }],
        questions: []
      },
      {
        id: 'paraclinic', name: 'Para-Clinical (Patho, Pharma, Micro)', weightage: 25, icon: '🔬', color: '#f59e0b', phase: 2, studyWeeks: 8, order: 2,
        topics: ['General Pathology', 'General Pharmacology', 'Bacteriology & Virology'],
        books: [{ name: 'Robbins Basic Pathology', author: 'Robbins' }],
        questions: []
      }
    ],
    youtubeChannels: [
      { name: 'Dr. Gobind Rai Garg (Pharma)', url: 'https://youtube.com', desc: 'Exceptional pharmacology mnemonics.' }
    ]
  }
};

export const NEET_STUDY_PHASES = [
  { id: 1, name: 'First Reading', color: '#3b82f6', description: 'Comprehensive reading of all 19 subjects with video lectures (6-7 Months).' },
  { id: 2, name: 'First Revision & QBank', color: '#f59e0b', description: 'Solve QBank daily and annotate notes with high yield points (3 Months).' },
  { id: 3, name: 'Rapid Revision & Grand Tests', color: '#10b981', description: 'Give 1 Grand Test a week and revise volatile subjects (2 Months).' }
];
