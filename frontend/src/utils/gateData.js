// ─── GATE Exam Common Info ───
export const GATE_EXAM_INFO = {
  name: 'GATE 2027',
  fullName: 'Graduate Aptitude Test in Engineering',
  conductedBy: 'IISc Bangalore & IITs (Rotating)',
  duration: '3 hours (180 minutes)',
  totalMarks: 100,
  totalQuestions: 65,
  sections: [
    { name: 'General Aptitude (GA)', questions: 10, marks: 15, detail: '5 × 1 mark + 5 × 2 marks' },
    { name: 'Subject-Specific', questions: 55, marks: 85, detail: '25 × 1 mark + 30 × 2 marks' },
  ],
  markingScheme: [
    { type: 'MCQ (1 mark)', correct: '+1', wrong: '-1/3' },
    { type: 'MCQ (2 marks)', correct: '+2', wrong: '-2/3' },
    { type: 'NAT (1 mark)', correct: '+1', wrong: '0' },
    { type: 'NAT (2 marks)', correct: '+2', wrong: '0' },
    { type: 'MSQ (1 or 2 marks)', correct: 'Full marks', wrong: '0' },
  ],
  eligibility: [
    'Bachelor\'s degree in Engineering/Technology (4 years after 10+2 or 3 years after Diploma)',
    'Currently in the final year of qualifying degree',
    'Master\'s degree in any branch of Science / Mathematics / Statistics / Computer Applications',
    'No age limit to appear for GATE',
  ],
  importantDates: [
    { event: 'Notification Release', date: 'July 2026' },
    { event: 'Application Start', date: 'August 2026' },
    { event: 'Last Date to Apply', date: 'October 2026' },
    { event: 'Admit Card Release', date: 'January 2027' },
    { event: 'Exam Dates', date: 'February 2027 (weekends)' },
    { event: 'Result Declaration', date: 'March 2027' },
    { event: 'Score Card Available', date: 'March-April 2027' },
  ],
  cutoffs: {
    note: 'Approximate qualifying cutoffs (vary each year)',
    categories: [
      { name: 'General (UR)', range: '25-30 marks' },
      { name: 'OBC-NCL', range: '22-27 marks' },
      { name: 'SC / ST / PwD', range: '16-20 marks' },
    ],
  },
  benefits: [
    'M.Tech/ME admissions in IITs, NITs, IIITs & top colleges',
    'PSU recruitment (BHEL, NTPC, IOCL, GAIL, etc.)',
    'Research fellowships & PhD admissions',
    'Valid for 3 years from date of result',
  ],
};

// ─── Common Platforms ───
export const GATE_PLATFORMS = [
  { name: 'NPTEL (IIT Lectures)', url: 'https://nptel.ac.in/', type: 'Free', icon: '🎓', desc: 'Official IIT/IISc video lectures — gold standard for GATE' },
  { name: 'Gate Academy', url: 'https://gateacademy.co.in/', type: 'Paid', icon: '📘', desc: 'Subject-wise courses, test series & previous year solutions' },
  { name: 'Unacademy', url: 'https://unacademy.com/goal/gate-cs-it/XERGY', type: 'Freemium', icon: '📱', desc: 'Live classes, recorded lectures, daily quizzes' },
  { name: 'Made Easy', url: 'https://www.madeeasy.in/', type: 'Paid', icon: '📕', desc: 'Classroom & online courses, renowned for GATE coaching' },
  { name: 'GeeksforGeeks GATE', url: 'https://www.geeksforgeeks.org/gate-cs-notes-gq/', type: 'Free', icon: '💻', desc: 'Topic-wise notes, previous year questions, quizzes' },
  { name: 'PYQs on GATE Overflow', url: 'https://gateoverflow.in/', type: 'Free', icon: '📝', desc: 'Community-solved previous year GATE questions with discussions' },
  { name: 'Testbook GATE', url: 'https://testbook.com/gate', type: 'Freemium', icon: '📊', desc: 'Mock tests, sectional tests, and performance analysis' },
];

// ─── Domain → Branch Mapping ───
export const DOMAIN_TO_BRANCH = {
  'Software Engineering / CS / IT': 'CS',
  'ECE (Electronics & Communication)': 'ECE',
  'Electrical & Electronics (EEE)': 'EE',
  'Mechanical Engineering': 'ME',
  'Civil Engineering': 'CE',
};

export const getBranchFromDomain = (domain) => DOMAIN_TO_BRANCH[domain] || 'CS';

// ─── Branch Data ───
export const GATE_BRANCHES = {
  CS: {
    code: 'CS', name: 'Computer Science & Information Technology',
    subjects: [
      {
        id: 'engg_math', name: 'Engineering Mathematics', weightage: 13, icon: '📐', color: '#7c3aed',
        phase: 1, studyWeeks: 3, order: 1,
        topics: ['Linear Algebra (Matrices, Eigenvalues)', 'Calculus (Limits, Continuity, Differentiability)', 'Probability & Statistics', 'Combinatorics', 'Graph Theory basics', 'Set Theory & Algebra', 'Numerical Methods'],
        books: [{ name: 'Higher Engineering Mathematics', author: 'B.S. Grewal' }, { name: 'Engineering Mathematics', author: 'Erwin Kreyszig' }],
        questions: [
          { q: 'The rank of the matrix [[1,2,3],[2,4,6],[1,1,1]] is:', opts: ['1', '2', '3', '0'], ans: 1, exp: 'Row 2 = 2×Row 1 so rows 1&2 are dependent. Rows 1&3 are independent. Rank = 2.' },
          { q: 'If P(A) = 0.3, P(B) = 0.4, and A & B are independent, what is P(A∩B)?', opts: ['0.7', '0.12', '0.1', '0.42'], ans: 1, exp: 'For independent events, P(A∩B) = P(A) × P(B) = 0.3 × 0.4 = 0.12.' },
          { q: 'The number of spanning trees of a complete graph K₄ is:', opts: ['4', '8', '16', '12'], ans: 2, exp: 'By Cayley\'s formula, Kₙ has n^(n-2) spanning trees. K₄ = 4² = 16.' },
        ],
      },
      {
        id: 'discrete_math', name: 'Discrete Mathematics', weightage: 7, icon: '🔢', color: '#06b6d4',
        phase: 1, studyWeeks: 2, order: 2,
        topics: ['Propositional & First-Order Logic', 'Sets, Relations, Functions', 'Partial Orders & Lattices', 'Groups, Rings, Fields', 'Counting & Combinatorics', 'Recurrence Relations', 'Graph Theory (Euler, Hamilton, Coloring)'],
        books: [{ name: 'Discrete Mathematics & Its Applications', author: 'Kenneth Rosen' }],
        questions: [
          { q: 'How many edges does a complete bipartite graph K₃,₄ have?', opts: ['7', '12', '24', '6'], ans: 1, exp: 'K_{m,n} has m×n edges. K₃,₄ = 3×4 = 12 edges.' },
          { q: 'If R is reflexive and transitive but not symmetric on set A, then R is:', opts: ['Equivalence relation', 'Partial order', 'Preorder', 'Total order'], ans: 2, exp: 'A preorder is reflexive + transitive. Partial order adds antisymmetry. Without symmetry it\'s at least a preorder.' },
          { q: 'The contrapositive of "If it rains, the ground is wet" is:', opts: ['"If the ground is wet, it rains"', '"If it doesn\'t rain, ground isn\'t wet"', '"If ground isn\'t wet, it doesn\'t rain"', '"It rains and ground isn\'t wet"'], ans: 2, exp: 'Contrapositive of p→q is ¬q→¬p. "If ground isn\'t wet, it doesn\'t rain."' },
        ],
      },
      {
        id: 'digital_logic', name: 'Digital Logic', weightage: 5, icon: '🔌', color: '#f59e0b',
        phase: 1, studyWeeks: 2, order: 3,
        topics: ['Boolean Algebra & Minimization', 'K-Maps', 'Combinational Circuits (Mux, Decoder, Adder)', 'Sequential Circuits (Flip-flops, Counters, Registers)', 'Number Systems & Codes'],
        books: [{ name: 'Digital Design', author: 'M. Morris Mano' }],
        questions: [
          { q: 'Minimum number of 2-input NAND gates to implement A XOR B:', opts: ['3', '4', '5', '6'], ans: 1, exp: 'XOR can be implemented with 4 NAND gates using the standard construction.' },
          { q: 'How many flip-flops are needed for a mod-12 counter?', opts: ['3', '4', '12', '6'], ans: 1, exp: 'Need ⌈log₂(12)⌉ = 4 flip-flops (4 bits can count 0-15, reset at 12).' },
          { q: 'The output of an SR latch when S=1, R=1 is:', opts: ['Set', 'Reset', 'No change', 'Invalid / Undefined'], ans: 3, exp: 'S=R=1 is an invalid/forbidden state for an SR latch.' },
        ],
      },
      {
        id: 'comp_org', name: 'Computer Organization & Architecture', weightage: 8, icon: '🖥️', color: '#10b981',
        phase: 3, studyWeeks: 2, order: 9,
        topics: ['Machine Instructions & Addressing Modes', 'CPU Design (ALU, Control Unit)', 'Pipelining & Hazards', 'Cache Memory Organization', 'Virtual Memory', 'I/O Interface (DMA, Interrupt)'],
        books: [{ name: 'Computer Organization & Design', author: 'Patterson & Hennessy' }, { name: 'Computer Architecture', author: 'Carl Hamacher' }],
        questions: [
          { q: 'In a 5-stage pipeline, if the first instruction completes at cycle 5, when does the 100th instruction complete?', opts: ['104', '500', '105', '100'], ans: 0, exp: '5 + (100-1) = 104 cycles. First takes 5, each subsequent adds 1 cycle.' },
          { q: 'A direct-mapped cache has 8 blocks. Memory block 25 maps to which cache block?', opts: ['1', '3', '0', '25'], ans: 0, exp: '25 mod 8 = 1. In direct mapping, block maps to (block_number mod cache_size).' },
          { q: 'Which hazard occurs when an instruction depends on the result of a previous instruction?', opts: ['Structural', 'Data (RAW)', 'Control', 'WAR'], ans: 1, exp: 'Read After Write (RAW) is a data hazard — instruction needs result not yet produced.' },
        ],
      },
      {
        id: 'dsa', name: 'Data Structures & Algorithms', weightage: 14, icon: '🌳', color: '#ec4899',
        phase: 2, studyWeeks: 4, order: 5,
        topics: ['Arrays, Stacks, Queues', 'Linked Lists', 'Trees (BST, AVL, B-Trees)', 'Graphs (BFS, DFS, Shortest Paths)', 'Hashing', 'Sorting & Searching', 'Greedy Algorithms', 'Dynamic Programming', 'Asymptotic Analysis (Big-O, Θ, Ω)'],
        books: [{ name: 'Introduction to Algorithms (CLRS)', author: 'Cormen, Leiserson, Rivest, Stein' }, { name: 'Data Structures Using C', author: 'Reema Thareja' }],
        questions: [
          { q: 'What is the worst-case time complexity of QuickSort?', opts: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], ans: 2, exp: 'QuickSort degrades to O(n²) when the pivot is always the smallest/largest element.' },
          { q: 'The minimum number of nodes in an AVL tree of height 3 is:', opts: ['4', '5', '7', '8'], ans: 2, exp: 'N(h) = N(h-1) + N(h-2) + 1. N(0)=1, N(1)=2, N(2)=4, N(3)=7.' },
          { q: 'Which data structure is used for BFS traversal of a graph?', opts: ['Stack', 'Queue', 'Priority Queue', 'Deque'], ans: 1, exp: 'BFS uses a Queue (FIFO) to explore neighbors level by level.' },
          { q: 'Time complexity of building a heap from n elements is:', opts: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], ans: 1, exp: 'Bottom-up heap construction (heapify) runs in O(n), not O(n log n).' },
        ],
      },
      {
        id: 'os', name: 'Operating Systems', weightage: 10, icon: '⚙️', color: '#3b82f6',
        phase: 2, studyWeeks: 3, order: 6,
        topics: ['Process Management & Scheduling', 'Threads & Concurrency', 'Deadlocks (Detection, Prevention, Avoidance)', 'Memory Management (Paging, Segmentation)', 'Virtual Memory & Page Replacement', 'File Systems', 'Synchronization (Semaphores, Monitors)'],
        books: [{ name: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne' }, { name: 'Operating Systems', author: 'William Stallings' }],
        questions: [
          { q: 'Which page replacement algorithm suffers from Belady\'s anomaly?', opts: ['LRU', 'Optimal', 'FIFO', 'LFU'], ans: 2, exp: 'FIFO suffers from Belady\'s anomaly — more frames can increase page faults.' },
          { q: 'Banker\'s algorithm is used for:', opts: ['Deadlock detection', 'Deadlock prevention', 'Deadlock avoidance', 'Deadlock recovery'], ans: 2, exp: 'Banker\'s algorithm avoids deadlock by checking safe states before resource allocation.' },
          { q: 'In Round Robin scheduling with time quantum q, if q → ∞, it becomes:', opts: ['SJF', 'FCFS', 'Priority', 'SRTF'], ans: 1, exp: 'With infinite quantum, no preemption occurs — behaves like First Come First Served.' },
        ],
      },
      {
        id: 'dbms', name: 'Database Management Systems', weightage: 8, icon: '🗄️', color: '#f43f5e',
        phase: 2, studyWeeks: 3, order: 7,
        topics: ['ER Model & Relational Model', 'SQL (Queries, Joins, Subqueries)', 'Relational Algebra & Calculus', 'Normalization (1NF to BCNF)', 'Transactions & ACID Properties', 'Concurrency Control (Locking, Timestamps)', 'Indexing (B-Trees, Hashing)'],
        books: [{ name: 'Database System Concepts', author: 'Korth, Sudarshan' }, { name: 'Fundamentals of Database Systems', author: 'Elmasri, Navathe' }],
        questions: [
          { q: 'A relation R(A,B,C) with FDs {A→B, B→C}. The highest normal form is:', opts: ['1NF', '2NF', '3NF', 'BCNF'], ans: 1, exp: 'Transitive dependency A→B→C violates 3NF. With candidate key {A}, it is in 2NF (no partial dependency) but not 3NF.' },
          { q: 'Which SQL keyword is used to remove duplicate rows from results?', opts: ['UNIQUE', 'DISTINCT', 'REMOVE', 'FILTER'], ans: 1, exp: 'SELECT DISTINCT removes duplicate rows from the result set.' },
          { q: 'The ACID property that ensures a transaction is treated as a single unit is:', opts: ['Atomicity', 'Consistency', 'Isolation', 'Durability'], ans: 0, exp: 'Atomicity ensures all-or-nothing execution of a transaction.' },
        ],
      },
      {
        id: 'cn', name: 'Computer Networks', weightage: 8, icon: '🌐', color: '#8b5cf6',
        phase: 2, studyWeeks: 2, order: 8,
        topics: ['OSI & TCP/IP Models', 'Data Link Layer (Framing, Error Control, Flow Control)', 'Network Layer (IP, Routing — RIP, OSPF, BGP)', 'Transport Layer (TCP, UDP, Congestion Control)', 'Application Layer (DNS, HTTP, FTP, SMTP)', 'Subnetting & CIDR', 'Network Security basics'],
        books: [{ name: 'Computer Networking: A Top-Down Approach', author: 'Kurose & Ross' }, { name: 'Data Communications & Networking', author: 'Forouzan' }],
        questions: [
          { q: 'Which layer of the OSI model handles routing?', opts: ['Data Link', 'Transport', 'Network', 'Session'], ans: 2, exp: 'The Network Layer (Layer 3) is responsible for logical addressing and routing.' },
          { q: 'A subnet mask of 255.255.255.224 allows how many usable host addresses?', opts: ['30', '32', '64', '62'], ans: 0, exp: '/27 mask gives 2⁵ - 2 = 30 usable hosts (subtract network and broadcast).' },
          { q: 'TCP uses which mechanism for reliable delivery?', opts: ['Checksum only', 'Sliding Window + ACKs', 'Token Ring', 'Flooding'], ans: 1, exp: 'TCP uses sliding window protocol with acknowledgments and retransmission for reliability.' },
        ],
      },
      {
        id: 'toc', name: 'Theory of Computation', weightage: 8, icon: '🔄', color: '#14b8a6',
        phase: 3, studyWeeks: 3, order: 10,
        topics: ['Finite Automata (DFA, NFA)', 'Regular Expressions & Languages', 'Context-Free Grammars & PDA', 'Turing Machines', 'Decidability & Undecidability', 'Pumping Lemma (Regular & CFL)', 'Closure Properties'],
        books: [{ name: 'Introduction to Automata Theory', author: 'Hopcroft, Motwani, Ullman' }, { name: 'Theory of Computation', author: 'Michael Sipser' }],
        questions: [
          { q: 'Which class of languages is recognized by a Pushdown Automaton?', opts: ['Regular', 'Context-Free', 'Context-Sensitive', 'Recursively Enumerable'], ans: 1, exp: 'PDAs recognize exactly the Context-Free Languages (CFLs).' },
          { q: 'The language L = {aⁿbⁿcⁿ | n ≥ 1} is:', opts: ['Regular', 'Context-Free', 'Context-Sensitive', 'Not recursively enumerable'], ans: 2, exp: 'aⁿbⁿcⁿ is the classic example of a Context-Sensitive Language — not CFL (fails pumping lemma for CFL).' },
          { q: 'The halting problem is:', opts: ['Decidable', 'Semi-decidable (RE)', 'Not RE', 'Regular'], ans: 1, exp: 'The halting problem is recursively enumerable (semi-decidable) but not decidable.' },
        ],
      },
      {
        id: 'compiler', name: 'Compiler Design', weightage: 6, icon: '🏗️', color: '#f97316',
        phase: 3, studyWeeks: 2, order: 11,
        topics: ['Lexical Analysis (Tokens, Regular Expressions)', 'Parsing (Top-Down: LL(1), Bottom-Up: SLR, LALR, CLR)', 'Syntax-Directed Translation', 'Intermediate Code Generation', 'Code Optimization', 'Runtime Environments'],
        books: [{ name: 'Compilers: Principles, Techniques, and Tools (Dragon Book)', author: 'Aho, Sethi, Ullman' }],
        questions: [
          { q: 'Which parsing technique is used by YACC?', opts: ['LL(1)', 'SLR', 'LALR(1)', 'Recursive Descent'], ans: 2, exp: 'YACC (Yet Another Compiler Compiler) uses LALR(1) parsing.' },
          { q: 'First(ε) in compiler design is:', opts: ['{ε}', '∅', '{$}', 'Undefined'], ans: 0, exp: 'First(ε) = {ε}. The empty string directly produces ε.' },
        ],
      },
      {
        id: 'prog', name: 'Programming & C Concepts', weightage: 5, icon: '💻', color: '#06b6d4',
        phase: 1, studyWeeks: 2, order: 4,
        topics: ['C Programming (Pointers, Arrays, Strings)', 'Recursion', 'Scope, Lifetime, Storage Classes', 'Structures & Unions', 'File Handling', 'Dynamic Memory Allocation'],
        books: [{ name: 'The C Programming Language', author: 'Kernighan & Ritchie' }, { name: 'Let Us C', author: 'Yashavant Kanetkar' }],
        questions: [
          { q: 'What is the output? int x=5; printf("%d %d %d", x, x<<1, x>>1);', opts: ['5 10 2', '5 25 1', '5 2 10', '5 10 3'], ans: 0, exp: 'x<<1 = 5×2 = 10 (left shift), x>>1 = 5/2 = 2 (right shift, integer division).' },
          { q: 'In C, what does sizeof return for char arr[10]?', opts: ['4', '8', '10', '1'], ans: 2, exp: 'sizeof(arr) returns total bytes = 10 × sizeof(char) = 10 × 1 = 10.' },
        ],
      },
      {
        id: 'aptitude', name: 'General Aptitude', weightage: 15, icon: '🧠', color: '#a855f7',
        phase: 4, studyWeeks: 2, order: 12,
        topics: ['Verbal Ability (Grammar, Vocabulary, Comprehension)', 'Numerical Ability (Arithmetic, Algebra, Percentages)', 'Logical Reasoning', 'Data Interpretation', 'Spatial Reasoning'],
        books: [{ name: 'Quantitative Aptitude', author: 'R.S. Aggarwal' }, { name: 'Verbal & Non-Verbal Reasoning', author: 'R.S. Aggarwal' }],
        questions: [
          { q: 'A train 150m long passes a pole in 15 seconds. Its speed in km/h is:', opts: ['36', '10', '54', '45'], ans: 0, exp: 'Speed = 150/15 = 10 m/s = 10 × 3.6 = 36 km/h.' },
          { q: '"Benevolent" is the opposite of:', opts: ['Kind', 'Malevolent', 'Generous', 'Caring'], ans: 1, exp: 'Benevolent means kind/generous. Malevolent means wishing harm — the opposite.' },
        ],
      },
    ],
    youtubeChannels: [
      { name: 'Gate Smashers', url: 'https://www.youtube.com/@GateSmashers', desc: 'Concise GATE CS topic explanations' },
      { name: 'Knowledge Gate', url: 'https://www.youtube.com/@KnowledgeGatee', desc: 'OS, DBMS, CN lectures for GATE' },
      { name: 'Neso Academy', url: 'https://www.youtube.com/@nesaborad', desc: 'Digital Logic, TOC, and more' },
      { name: 'Abdul Bari', url: 'https://www.youtube.com/@abdul_bari', desc: 'DSA & Algorithms visual explanations' },
    ],
  },

  ECE: {
    code: 'ECE', name: 'Electronics & Communication Engineering',
    subjects: [
      { id: 'engg_math', name: 'Engineering Mathematics', weightage: 13, icon: '📐', color: '#7c3aed', phase: 1, studyWeeks: 3, order: 1, topics: ['Linear Algebra', 'Calculus', 'Differential Equations', 'Complex Analysis', 'Probability & Statistics', 'Numerical Methods', 'Transform Theory'], books: [{ name: 'Higher Engineering Mathematics', author: 'B.S. Grewal' }], questions: [{ q: 'The Laplace transform of e^(-at) is:', opts: ['1/(s+a)', '1/(s-a)', 's/(s+a)', 'a/(s+a)'], ans: 0, exp: 'L{e^(-at)} = 1/(s+a) for s > -a.' }] },
      { id: 'network', name: 'Network Theory', weightage: 10, icon: '🔌', color: '#06b6d4', phase: 1, studyWeeks: 2, order: 2, topics: ['KCL, KVL, Network Theorems', 'Transient & Steady-state Analysis', 'Two-port Networks', 'Sinusoidal Steady-state', 'Resonance'], books: [{ name: 'Network Analysis', author: 'Van Valkenburg' }], questions: [{ q: 'In a series RLC circuit at resonance, impedance equals:', opts: ['R', 'R+jωL', '1/ωC', 'Zero'], ans: 0, exp: 'At resonance, XL = XC, so they cancel. Impedance = R (purely resistive).' }] },
      { id: 'signals', name: 'Signals & Systems', weightage: 10, icon: '📊', color: '#10b981', phase: 2, studyWeeks: 3, order: 3, topics: ['CT and DT Signals', 'LTI Systems', 'Fourier Transform', 'Laplace Transform', 'Z-Transform', 'Sampling Theorem'], books: [{ name: 'Signals & Systems', author: 'Oppenheim & Willsky' }], questions: [{ q: 'According to Nyquist theorem, minimum sampling rate for a 4kHz signal is:', opts: ['4 kHz', '8 kHz', '2 kHz', '16 kHz'], ans: 1, exp: 'Nyquist rate = 2 × fmax = 2 × 4kHz = 8 kHz.' }] },
      { id: 'ece_digital', name: 'Digital Circuits', weightage: 8, icon: '💡', color: '#f59e0b', phase: 1, studyWeeks: 2, order: 4, topics: ['Boolean Algebra & Logic Gates', 'Combinational Circuits', 'Sequential Circuits', 'ADC/DAC', 'Semiconductor Memories'], books: [{ name: 'Digital Design', author: 'M. Morris Mano' }], questions: [{ q: 'An 8-to-1 multiplexer has how many select lines?', opts: ['2', '3', '8', '4'], ans: 1, exp: '2^n = 8, so n = 3 select lines.' }] },
      { id: 'analog', name: 'Analog Circuits', weightage: 10, icon: '📻', color: '#ec4899', phase: 2, studyWeeks: 3, order: 5, topics: ['Diode, BJT, MOSFET Characteristics', 'Amplifier Circuits', 'Op-Amp Applications', 'Feedback & Oscillators', 'Active Filters'], books: [{ name: 'Electronic Devices & Circuit Theory', author: 'Boylestad & Nashelsky' }], questions: [{ q: 'The voltage gain of an ideal inverting op-amp with Rf=10kΩ and Rin=2kΩ is:', opts: ['-5', '5', '-2', '0.2'], ans: 0, exp: 'Gain = -Rf/Rin = -10k/2k = -5.' }] },
      { id: 'comms', name: 'Communications', weightage: 10, icon: '📡', color: '#3b82f6', phase: 3, studyWeeks: 3, order: 6, topics: ['AM, FM, PM Modulation', 'Noise in Communication', 'Digital Communication', 'Information Theory', 'Error Correction Codes'], books: [{ name: 'Communication Systems', author: 'Simon Haykin' }], questions: [{ q: 'In AM, the bandwidth required is:', opts: ['fm', '2fm', 'fc + fm', 'fc'], ans: 1, exp: 'AM bandwidth = 2fm where fm is the maximum message frequency.' }] },
      { id: 'control', name: 'Control Systems', weightage: 8, icon: '🎛️', color: '#14b8a6', phase: 3, studyWeeks: 2, order: 7, topics: ['Transfer Functions', 'Stability (Routh-Hurwitz)', 'Root Locus', 'Bode Plot', 'Nyquist Plot', 'State Space Analysis'], books: [{ name: 'Control Systems Engineering', author: 'Nagrath & Gopal' }], questions: [{ q: 'A system with all poles in the left half of s-plane is:', opts: ['Unstable', 'Marginally stable', 'Stable', 'Oscillatory'], ans: 2, exp: 'All poles in left-half plane → negative real parts → stable system.' }] },
      { id: 'emft', name: 'Electromagnetics', weightage: 8, icon: '🧲', color: '#f43f5e', phase: 3, studyWeeks: 2, order: 8, topics: ['Electrostatics', 'Magnetostatics', 'Maxwell\'s Equations', 'Wave Propagation', 'Transmission Lines', 'Waveguides & Antennas'], books: [{ name: 'Engineering Electromagnetics', author: 'W.H. Hayt' }], questions: [{ q: 'The intrinsic impedance of free space is approximately:', opts: ['120π Ω', '50 Ω', '75 Ω', '100 Ω'], ans: 0, exp: 'η₀ = √(μ₀/ε₀) ≈ 120π ≈ 377 Ω.' }] },
      { id: 'ece_apt', name: 'General Aptitude', weightage: 15, icon: '🧠', color: '#a855f7', phase: 4, studyWeeks: 2, order: 9, topics: ['Verbal Ability', 'Numerical Ability', 'Logical Reasoning', 'Data Interpretation'], books: [{ name: 'Quantitative Aptitude', author: 'R.S. Aggarwal' }], questions: [] },
    ],
    youtubeChannels: [
      { name: 'Neso Academy', url: 'https://www.youtube.com/@nesoacademy', desc: 'Digital, Analog, Signals & Systems' },
      { name: 'Gate Smashers', url: 'https://www.youtube.com/@GateSmashers', desc: 'GATE ECE focused lectures' },
    ],
  },

  EE: {
    code: 'EE', name: 'Electrical Engineering',
    subjects: [
      { id: 'engg_math', name: 'Engineering Mathematics', weightage: 13, icon: '📐', color: '#7c3aed', phase: 1, studyWeeks: 3, order: 1, topics: ['Linear Algebra', 'Calculus', 'Differential Equations', 'Complex Variables', 'Probability & Statistics', 'Numerical Methods'], books: [{ name: 'Higher Engineering Mathematics', author: 'B.S. Grewal' }], questions: [{ q: 'The eigenvalues of a 2×2 identity matrix are:', opts: ['0 and 1', '1 and 1', '0 and 0', '1 and -1'], ans: 1, exp: 'Both eigenvalues of an identity matrix are 1.' }] },
      { id: 'circuits', name: 'Electric Circuits', weightage: 10, icon: '🔌', color: '#06b6d4', phase: 1, studyWeeks: 3, order: 2, topics: ['Network Theorems', 'AC & DC Circuits', 'Transient Analysis', 'Three-Phase Circuits', 'Two-Port Networks'], books: [{ name: 'Circuit Theory', author: 'A. Chakrabarti' }], questions: [{ q: 'Power factor of a purely resistive circuit is:', opts: ['0', '0.5', '1', 'Infinity'], ans: 2, exp: 'In a purely resistive circuit, voltage and current are in phase, so PF = cos(0°) = 1.' }] },
      { id: 'emf', name: 'Electromagnetic Fields', weightage: 8, icon: '🧲', color: '#f59e0b', phase: 2, studyWeeks: 2, order: 3, topics: ['Electrostatics', 'Magnetostatics', 'Maxwell\'s Equations', 'Plane Waves'], books: [{ name: 'Engineering Electromagnetics', author: 'W.H. Hayt' }], questions: [{ q: 'Gauss\'s law relates electric flux to:', opts: ['Current', 'Voltage', 'Enclosed charge', 'Magnetic field'], ans: 2, exp: 'Gauss\'s law: ∮E·dA = Q_enclosed/ε₀.' }] },
      { id: 'signals_ee', name: 'Signals & Systems', weightage: 8, icon: '📊', color: '#10b981', phase: 2, studyWeeks: 2, order: 4, topics: ['LTI Systems', 'Fourier & Laplace Transform', 'Z-Transform', 'Sampling', 'DFT & FFT'], books: [{ name: 'Signals & Systems', author: 'Oppenheim' }], questions: [{ q: 'A causal LTI system is BIBO stable if all poles are:', opts: ['On imaginary axis', 'Inside unit circle (Z) / left half (S)', 'Outside unit circle', 'At origin'], ans: 1, exp: 'BIBO stability requires all poles inside unit circle (discrete) or left half s-plane (continuous).' }] },
      { id: 'machines', name: 'Electrical Machines', weightage: 10, icon: '⚡', color: '#ec4899', phase: 2, studyWeeks: 3, order: 5, topics: ['Transformers', 'DC Machines', 'Induction Motors', 'Synchronous Machines', 'Special Machines'], books: [{ name: 'Electric Machinery', author: 'Fitzgerald & Kingsley' }], questions: [{ q: 'The speed of a 4-pole, 50Hz induction motor at 4% slip is:', opts: ['1440 rpm', '1500 rpm', '1600 rpm', '1200 rpm'], ans: 0, exp: 'Ns = 120f/P = 120×50/4 = 1500 rpm. N = Ns(1-s) = 1500×0.96 = 1440 rpm.' }] },
      { id: 'power_sys', name: 'Power Systems', weightage: 10, icon: '🏭', color: '#3b82f6', phase: 3, studyWeeks: 3, order: 6, topics: ['Power Generation', 'Transmission Lines', 'Load Flow Analysis', 'Fault Analysis', 'Protection Systems', 'Economic Dispatch'], books: [{ name: 'Power System Engineering', author: 'Nagrath & Kothari' }], questions: [{ q: 'In a per-unit system, the base impedance is:', opts: ['V_base²/S_base', 'S_base/V_base', 'V_base/I_base', 'I_base²×Z'], ans: 0, exp: 'Z_base = V_base² / S_base = V_base / I_base.' }] },
      { id: 'control_ee', name: 'Control Systems', weightage: 8, icon: '🎛️', color: '#14b8a6', phase: 3, studyWeeks: 2, order: 7, topics: ['Transfer Function', 'Stability Analysis', 'Root Locus', 'Frequency Response', 'State Space', 'Compensators'], books: [{ name: 'Control Systems', author: 'Nagrath & Gopal' }], questions: [{ q: 'The number of roots in RHP for Routh table with one sign change is:', opts: ['0', '1', '2', 'Cannot determine'], ans: 1, exp: 'Number of sign changes in first column = number of roots in right-half plane.' }] },
      { id: 'pe', name: 'Power Electronics', weightage: 8, icon: '🔋', color: '#f97316', phase: 3, studyWeeks: 2, order: 8, topics: ['Power Semiconductor Devices', 'Rectifiers', 'Choppers', 'Inverters', 'AC Voltage Controllers', 'SMPS'], books: [{ name: 'Power Electronics', author: 'P.S. Bimbhra' }], questions: [{ q: 'In a single-phase full bridge rectifier, output frequency is:', opts: ['f', '2f', '3f', '4f'], ans: 1, exp: 'Full bridge rectifier has output frequency = 2× input frequency.' }] },
      { id: 'ee_apt', name: 'General Aptitude', weightage: 15, icon: '🧠', color: '#a855f7', phase: 4, studyWeeks: 2, order: 9, topics: ['Verbal Ability', 'Numerical Ability', 'Logical Reasoning'], books: [{ name: 'Quantitative Aptitude', author: 'R.S. Aggarwal' }], questions: [] },
    ],
    youtubeChannels: [
      { name: 'Gate Smashers', url: 'https://www.youtube.com/@GateSmashers', desc: 'GATE EE lectures' },
      { name: 'Bharat Acharya Education', url: 'https://www.youtube.com/@BharatAcharyaEducation', desc: 'Control Systems, Power Systems' },
    ],
  },

  ME: {
    code: 'ME', name: 'Mechanical Engineering',
    subjects: [
      { id: 'engg_math', name: 'Engineering Mathematics', weightage: 13, icon: '📐', color: '#7c3aed', phase: 1, studyWeeks: 3, order: 1, topics: ['Linear Algebra', 'Calculus', 'Differential Equations', 'Complex Analysis', 'Probability & Statistics', 'Numerical Methods'], books: [{ name: 'Higher Engineering Mathematics', author: 'B.S. Grewal' }], questions: [{ q: 'The value of ∫₀¹ x·e^x dx is:', opts: ['1', 'e-1', 'e', '2e-1'], ans: 0, exp: 'Using integration by parts: [xe^x - e^x]₀¹ = (e-e) - (0-1) = 1.' }] },
      { id: 'mechanics', name: 'Engineering Mechanics', weightage: 5, icon: '⚖️', color: '#06b6d4', phase: 1, studyWeeks: 2, order: 2, topics: ['Free Body Diagrams', 'Trusses', 'Friction', 'Kinematics & Dynamics', 'Vibrations'], books: [{ name: 'Engineering Mechanics', author: 'R.K. Rajput' }], questions: [{ q: 'The number of equilibrium equations for a 2D system is:', opts: ['2', '3', '4', '6'], ans: 1, exp: 'In 2D: ΣFx=0, ΣFy=0, ΣM=0 → 3 equations.' }] },
      { id: 'som', name: 'Strength of Materials', weightage: 10, icon: '🔨', color: '#f59e0b', phase: 1, studyWeeks: 3, order: 3, topics: ['Stress & Strain', 'Bending & Shear', 'Torsion', 'Columns & Struts', 'Deflection of Beams', 'Mohr\'s Circle'], books: [{ name: 'Strength of Materials', author: 'R.K. Rajput' }], questions: [{ q: 'Poisson\'s ratio for most metals ranges between:', opts: ['0.1-0.2', '0.25-0.35', '0.5-0.6', '0.7-0.9'], ans: 1, exp: 'Poisson\'s ratio μ for metals is typically 0.25 to 0.35 (e.g., steel ≈ 0.3).' }] },
      { id: 'thermo', name: 'Thermodynamics', weightage: 12, icon: '🌡️', color: '#f43f5e', phase: 2, studyWeeks: 3, order: 4, topics: ['Laws of Thermodynamics', 'Carnot Cycle', 'Entropy', 'Rankine & Brayton Cycles', 'Properties of Pure Substances', 'Gas Mixtures'], books: [{ name: 'Engineering Thermodynamics', author: 'P.K. Nag' }], questions: [{ q: 'The efficiency of a Carnot engine between 600K and 300K is:', opts: ['100%', '50%', '33%', '25%'], ans: 1, exp: 'η = 1 - Tc/Th = 1 - 300/600 = 0.5 = 50%.' }] },
      { id: 'fm', name: 'Fluid Mechanics', weightage: 10, icon: '🌊', color: '#3b82f6', phase: 2, studyWeeks: 3, order: 5, topics: ['Fluid Statics', 'Bernoulli\'s Equation', 'Viscous Flows', 'Boundary Layer Theory', 'Turbomachinery', 'Dimensional Analysis'], books: [{ name: 'Fluid Mechanics', author: 'R.K. Bansal' }], questions: [{ q: 'Reynolds number is the ratio of:', opts: ['Viscous to inertia forces', 'Inertia to viscous forces', 'Gravity to viscous forces', 'Pressure to inertia forces'], ans: 1, exp: 'Re = ρvL/μ = inertia forces / viscous forces.' }] },
      { id: 'ht', name: 'Heat Transfer', weightage: 8, icon: '🔥', color: '#ec4899', phase: 2, studyWeeks: 2, order: 6, topics: ['Conduction', 'Convection', 'Radiation', 'Heat Exchangers', 'Fins', 'Transient Heat Conduction'], books: [{ name: 'Heat Transfer', author: 'J.P. Holman' }], questions: [{ q: 'The unit of thermal conductivity is:', opts: ['W/m²·K', 'W/m·K', 'J/kg·K', 'W/m²'], ans: 1, exp: 'Thermal conductivity k has units W/(m·K) from Fourier\'s law: q = -k·dT/dx.' }] },
      { id: 'tom', name: 'Theory of Machines', weightage: 8, icon: '⚙️', color: '#14b8a6', phase: 3, studyWeeks: 2, order: 7, topics: ['Mechanisms & Inversions', 'Gears & Gear Trains', 'Flywheels & Governors', 'Balancing', 'Vibrations (Free & Forced)'], books: [{ name: 'Theory of Machines', author: 'S.S. Rattan' }], questions: [{ q: 'Gruebler\'s equation for DOF of a planar mechanism (n links, j joints): F =', opts: ['3(n-1) - 2j', '2(n-1) - 3j', 'n - j + 1', '3n - 2j - 3'], ans: 0, exp: 'F = 3(n-1) - 2j for planar mechanisms with lower pairs.' }] },
      { id: 'mfg', name: 'Manufacturing', weightage: 12, icon: '🏭', color: '#f97316', phase: 3, studyWeeks: 3, order: 8, topics: ['Casting', 'Welding', 'Machining (Turning, Milling, Drilling)', 'Metal Forming', 'Metrology', 'CNC & CAM'], books: [{ name: 'Manufacturing Technology', author: 'P.N. Rao' }], questions: [{ q: 'In orthogonal cutting, the chip thickness ratio is always:', opts: ['Greater than 1', 'Less than 1', 'Equal to 1', 'Zero'], ans: 1, exp: 'Chip thickness ratio r = t₁/t₂ < 1, since chip is always thicker than depth of cut.' }] },
      { id: 'me_apt', name: 'General Aptitude', weightage: 15, icon: '🧠', color: '#a855f7', phase: 4, studyWeeks: 2, order: 9, topics: ['Verbal Ability', 'Numerical Ability', 'Logical Reasoning'], books: [{ name: 'Quantitative Aptitude', author: 'R.S. Aggarwal' }], questions: [] },
    ],
    youtubeChannels: [
      { name: 'Gate Smashers', url: 'https://www.youtube.com/@GateSmashers', desc: 'GATE ME lectures' },
      { name: 'Kiran Academy', url: 'https://www.youtube.com/@KiranAcademy', desc: 'Thermodynamics, SOM' },
    ],
  },

  CE: {
    code: 'CE', name: 'Civil Engineering',
    subjects: [
      { id: 'engg_math', name: 'Engineering Mathematics', weightage: 13, icon: '📐', color: '#7c3aed', phase: 1, studyWeeks: 3, order: 1, topics: ['Linear Algebra', 'Calculus', 'Differential Equations', 'Probability & Statistics', 'Numerical Methods'], books: [{ name: 'Higher Engineering Mathematics', author: 'B.S. Grewal' }], questions: [{ q: 'The determinant of a singular matrix is:', opts: ['1', '0', '-1', 'Undefined'], ans: 1, exp: 'A singular matrix has determinant = 0 (non-invertible).' }] },
      { id: 'struct', name: 'Structural Analysis', weightage: 12, icon: '🏗️', color: '#06b6d4', phase: 1, studyWeeks: 3, order: 2, topics: ['Determinacy & Indeterminacy', 'Influence Lines', 'Slope Deflection', 'Moment Distribution', 'Matrix Methods', 'Arches & Cables'], books: [{ name: 'Structural Analysis', author: 'Bhavikatti' }], questions: [{ q: 'Degree of static indeterminacy of a fixed beam is:', opts: ['0', '1', '2', '3'], ans: 3, exp: 'A fixed beam has 3 redundant reactions (6 reactions - 3 equilibrium equations = 3).' }] },
      { id: 'geotech', name: 'Geotechnical Engineering', weightage: 10, icon: '🌍', color: '#f59e0b', phase: 2, studyWeeks: 3, order: 3, topics: ['Soil Classification', 'Permeability & Seepage', 'Compaction & Consolidation', 'Shear Strength', 'Earth Pressure', 'Foundation Engineering'], books: [{ name: 'Soil Mechanics', author: 'Gopal Ranjan' }], questions: [{ q: 'The void ratio of a soil is 0.8. Its porosity is:', opts: ['0.44', '0.8', '0.2', '0.56'], ans: 0, exp: 'n = e/(1+e) = 0.8/1.8 ≈ 0.44.' }] },
      { id: 'fluid_ce', name: 'Fluid Mechanics & Hydraulics', weightage: 8, icon: '🌊', color: '#3b82f6', phase: 2, studyWeeks: 2, order: 4, topics: ['Fluid Properties', 'Flow Measurement', 'Open Channel Flow', 'Pipe Flow', 'Hydraulic Machines'], books: [{ name: 'Fluid Mechanics', author: 'R.K. Bansal' }], questions: [{ q: 'Most economical section of a rectangular open channel has depth equal to:', opts: ['Width', 'Half width', 'Twice width', 'Quarter width'], ans: 1, exp: 'For a rectangular channel, most efficient section: depth = width/2.' }] },
      { id: 'env', name: 'Environmental Engineering', weightage: 8, icon: '🌿', color: '#10b981', phase: 3, studyWeeks: 2, order: 5, topics: ['Water Supply', 'Waste Water Treatment', 'Air Pollution', 'Solid Waste Management', 'Noise Pollution'], books: [{ name: 'Environmental Engineering', author: 'S.K. Garg' }], questions: [{ q: 'BOD of municipal sewage typically ranges between:', opts: ['10-20 mg/L', '100-300 mg/L', '500-1000 mg/L', '1-5 mg/L'], ans: 1, exp: 'Municipal sewage BOD is typically 100-300 mg/L.' }] },
      { id: 'transport', name: 'Transportation Engineering', weightage: 8, icon: '🛣️', color: '#f43f5e', phase: 3, studyWeeks: 2, order: 6, topics: ['Highway Geometric Design', 'Traffic Engineering', 'Pavement Design', 'Railway Engineering'], books: [{ name: 'Highway Engineering', author: 'Khanna & Justo' }], questions: [{ q: 'CBR test is used for design of:', opts: ['Rigid pavement', 'Flexible pavement', 'Bridge', 'Dam'], ans: 1, exp: 'California Bearing Ratio (CBR) test is used for flexible pavement thickness design.' }] },
      { id: 'survey', name: 'Surveying', weightage: 5, icon: '📏', color: '#f97316', phase: 1, studyWeeks: 2, order: 7, topics: ['Chain & Compass Surveying', 'Leveling', 'Theodolite', 'Triangulation', 'Curves', 'Remote Sensing & GIS'], books: [{ name: 'Surveying Vol 1 & 2', author: 'B.C. Punmia' }], questions: [{ q: 'The principle of surveying is to work from:', opts: ['Part to whole', 'Whole to part', 'Center outward', 'Random'], ans: 1, exp: 'Fundamental principle: work from whole to part to control error propagation.' }] },
      { id: 'rcc', name: 'RCC & Steel Design', weightage: 10, icon: '🏢', color: '#14b8a6', phase: 2, studyWeeks: 3, order: 8, topics: ['Working Stress & Limit State Methods', 'Beam Design', 'Column Design', 'Slab Design', 'Steel Connections', 'Tension & Compression Members'], books: [{ name: 'Reinforced Concrete Design', author: 'Pillai & Menon' }], questions: [{ q: 'In limit state design, partial safety factor for dead load (unfavorable) is:', opts: ['1.0', '1.2', '1.5', '2.0'], ans: 2, exp: 'As per IS 456, partial safety factor for dead load (unfavorable) = 1.5.' }] },
      { id: 'ce_apt', name: 'General Aptitude', weightage: 15, icon: '🧠', color: '#a855f7', phase: 4, studyWeeks: 2, order: 9, topics: ['Verbal Ability', 'Numerical Ability', 'Logical Reasoning'], books: [{ name: 'Quantitative Aptitude', author: 'R.S. Aggarwal' }], questions: [] },
    ],
    youtubeChannels: [
      { name: 'Gate Smashers', url: 'https://www.youtube.com/@GateSmashers', desc: 'GATE CE lectures' },
      { name: 'Study IQ Civil', url: 'https://www.youtube.com/@StudyIQ', desc: 'Civil engineering GATE preparation' },
    ],
  },
};

// ─── Study Phases ───
export const STUDY_PHASES = [
  { id: 1, name: 'Foundation', color: '#7c3aed', description: 'Build strong fundamentals in math and core basics' },
  { id: 2, name: 'Core Subjects', color: '#06b6d4', description: 'Deep dive into high-weightage technical subjects' },
  { id: 3, name: 'Advanced Topics', color: '#10b981', description: 'Cover remaining subjects and inter-topic connections' },
  { id: 4, name: 'Revision & Mocks', color: '#f59e0b', description: 'Full syllabus revision, mock tests, and previous year papers' },
];
