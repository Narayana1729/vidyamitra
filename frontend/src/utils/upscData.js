// ─── UPSC Exam Common Info ───
export const UPSC_EXAM_INFO = {
  name: 'UPSC CSE 2027',
  fullName: 'Union Public Service Commission - Civil Services Examination',
  conductedBy: 'UPSC',
  duration: '1 Year Process (Prelims, Mains, Interview)',
  totalMarks: 2025,
  totalQuestions: 'Varies',
  sections: [
    { name: 'Prelims - GS Paper 1', questions: 100, marks: 200, detail: 'Current Affairs, Indian History, Geography, Polity, Economy' },
    { name: 'Prelims - CSAT', questions: 80, marks: 200, detail: 'Comprehension, Logical Reasoning, Basic Numeracy (Qualifying 33%)' },
  ],
  markingScheme: [
    { type: 'Prelims (GS)', correct: '+2', wrong: '-0.66' },
    { type: 'Prelims (CSAT)', correct: '+2.5', wrong: '-0.83' },
    { type: 'Mains', correct: 'Descriptive', wrong: 'N/A' },
  ],
  eligibility: [
    'A bachelor\'s degree from a recognized university',
    'Age: 21 to 32 years (General category)',
    'Number of attempts: 6 (General), 9 (OBC), Unlimited (SC/ST)',
  ],
  importantDates: [
    { event: 'Notification Release', date: 'February 2027' },
    { event: 'Prelims Exam', date: 'May/June 2027' },
    { event: 'Mains Exam', date: 'September 2027' },
    { event: 'Interviews (Personality Test)', date: 'Jan-April 2028' },
  ],
  cutoffs: {
    note: 'Approximate Prelims Cutoff (Out of 200 in GS1)',
    categories: [
      { name: 'General', range: '85-95 marks' },
      { name: 'OBC', range: '85-90 marks' },
      { name: 'SC/ST', range: '70-80 marks' },
    ],
  },
  benefits: [
    'IAS - Indian Administrative Service',
    'IPS - Indian Police Service',
    'IFS - Indian Foreign Service',
    'IRS - Indian Revenue Service',
  ],
};

export const UPSC_PLATFORMS = [
  { name: 'Vajiram & Ravi', url: 'https://vajiramandravi.com/', type: 'Paid', icon: '🏛️', desc: 'Top tier coaching and test series.' },
  { name: 'Vision IAS', url: 'http://visionias.in/', type: 'Paid', icon: '👁️', desc: 'Renowned for current affairs and mains answer writing.' },
  { name: 'Insights on India', url: 'https://www.insightsonindia.com/', type: 'Free', icon: '💡', desc: 'Daily current affairs, secure answer writing.' },
  { name: 'Mrunal', url: 'https://mrunal.org/', type: 'Free', icon: '📈', desc: 'Exceptional economics and geography resources.' }
];

export const UPSC_BRANCHES = {
  PRELIMS: {
    code: 'PRELIMS', name: 'UPSC Prelims',
    subjects: [
      {
        id: 'polity', name: 'Indian Polity & Governance', weightage: 18, icon: '⚖️', color: '#3b82f6', phase: 1, studyWeeks: 4, order: 1,
        topics: ['Constitution', 'Political System', 'Panchayati Raj', 'Public Policy', 'Rights Issues'],
        books: [{ name: 'Indian Polity', author: 'M. Laxmikanth' }],
        questions: [{ q: 'Who is the guardian of the fundamental rights?', opts: ['Supreme Court', 'Parliament', 'President', 'Prime Minister'], ans: 0, exp: 'The Supreme Court is the guardian of the Fundamental Rights under Article 32.' }]
      },
      {
        id: 'history', name: 'History of India & Indian National Movement', weightage: 15, icon: '📜', color: '#f59e0b', phase: 1, studyWeeks: 4, order: 2,
        topics: ['Ancient India', 'Medieval India', 'Modern Indian History', 'Art & Culture'],
        books: [{ name: 'A Brief History of Modern India', author: 'Spectrum' }, { name: 'India\'s Struggle for Independence', author: 'Bipan Chandra' }],
        questions: [{ q: 'Who founded the Ramakrishna Mission?', opts: ['Swami Vivekananda', 'Raja Ram Mohan Roy', 'Dayanand Saraswati', 'Ishwar Chandra Vidyasagar'], ans: 0, exp: 'Founded by Swami Vivekananda in 1897.' }]
      },
      {
        id: 'geography', name: 'Indian & World Geography', weightage: 12, icon: '🌍', color: '#10b981', phase: 2, studyWeeks: 3, order: 3,
        topics: ['Physical Geography', 'Social Geography', 'Economic Geography'],
        books: [{ name: 'Certificate Physical and Human Geography', author: 'G.C. Leong' }, { name: 'NCERT Class 11 & 12', author: 'NCERT' }],
        questions: [{ q: 'Which is the longest river in India?', opts: ['Ganga', 'Brahmaputra', 'Godavari', 'Narmada'], ans: 0, exp: 'The Ganga is the longest river flowing entirely within India.' }]
      },
      {
        id: 'economy', name: 'Economic & Social Development', weightage: 15, icon: '📈', color: '#f97316', phase: 2, studyWeeks: 3, order: 4,
        topics: ['Sustainable Development', 'Poverty', 'Inclusion', 'Demographics', 'Social Sector Initiatives'],
        books: [{ name: 'Indian Economy', author: 'Ramesh Singh' }, { name: 'Economic Survey', author: 'Govt of India' }],
        questions: [{ q: 'What is the base year for calculating India\'s GDP?', opts: ['2011-12', '2004-05', '2015-16', '2001-02'], ans: 0, exp: 'The base year was revised to 2011-12.' }]
      },
      {
        id: 'environment', name: 'Environment & Ecology', weightage: 15, icon: '🌿', color: '#8b5cf6', phase: 3, studyWeeks: 2, order: 5,
        topics: ['Biodiversity', 'Climate Change', 'Environmental Ecology', 'Conservation'],
        books: [{ name: 'Environment', author: 'Shankar IAS Academy' }],
        questions: [{ q: 'Kyoto Protocol is related to:', opts: ['Ozone Depletion', 'Greenhouse Gas Emissions', 'Hazardous Waste', 'Nuclear Energy'], ans: 1, exp: 'Kyoto Protocol aims to reduce greenhouse gas emissions.' }]
      },
      {
        id: 'science_tech', name: 'General Science & Tech', weightage: 10, icon: '🔬', color: '#14b8a6', phase: 3, studyWeeks: 2, order: 6,
        topics: ['Space', 'Biotechnology', 'IT & Computers', 'Defence', 'Nanotechnology'],
        books: [{ name: 'Science and Technology', author: 'Ravi P. Agrahari' }],
        questions: [{ q: 'Gaganyaan is ISRO\'s mission for:', opts: ['Mars Exploration', 'Human Spaceflight', 'Lunar Sample Return', 'Solar Observation'], ans: 1, exp: 'Gaganyaan is India\'s first manned space mission.' }]
      },
      {
        id: 'current_affairs', name: 'Current Events of National & International Importance', weightage: 15, icon: '📰', color: '#ef4444', phase: 4, studyWeeks: 8, order: 7,
        topics: ['National News', 'International Relations', 'Government Schemes', 'Indices & Reports'],
        books: [{ name: 'The Hindu', author: 'Newspaper' }, { name: 'Vision IAS Monthly Magazine', author: 'Vision IAS' }],
        questions: []
      }
    ],
    youtubeChannels: [
      { name: 'StudyIQ IAS', url: 'https://youtube.com/@StudyIQ', desc: 'Daily current affairs and issue analysis.' },
      { name: 'Mrunal Patel', url: 'https://youtube.com/@mrunalpatel', desc: 'Excellent Economy basics.' }
    ]
  }
};

export const UPSC_STUDY_PHASES = [
  { id: 1, name: 'Foundation (NCERTs & Core)', color: '#3b82f6', description: 'Read NCERTs and standard books for Polity & History.' },
  { id: 2, name: 'Core Subjects Part II', color: '#f59e0b', description: 'Focus on Geography and Economy with standard textbooks.' },
  { id: 3, name: 'Dynamic Subjects', color: '#10b981', description: 'Environment, Science & Tech, and intensive Current Affairs.' },
  { id: 4, name: 'Revision & Mock Tests', color: '#ef4444', description: 'Solve 50+ full-length mock tests and previous year questions.' },
];
