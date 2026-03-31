// Canonical engineering domain labels used across signup + app features.
export const DOMAIN_OPTIONS = [
  "Software Engineering / CS / IT",
  "ECE (Electronics & Communication)",
  "Electrical & Electronics (EEE)",
  "Mechanical Engineering",
  "Civil Engineering",
];

// Accept legacy labels from older records and normalize to canonical labels.
const DOMAIN_ALIASES = {
  "Software": "Software Engineering / CS / IT",
  "Software Engineering / CS / IT": "Software Engineering / CS / IT",
  "ECE": "ECE (Electronics & Communication)",
  "Electronics & Communication (ECE)": "ECE (Electronics & Communication)",
  "ECE (Electronics & Communication)": "ECE (Electronics & Communication)",
  "EEE": "Electrical & Electronics (EEE)",
  "Electrical / Electronics Engineering (EEE)": "Electrical & Electronics (EEE)",
  "Electrical & Electronics (EEE)": "Electrical & Electronics (EEE)",
  "Mechanical": "Mechanical Engineering",
  "Mechanical Engineering": "Mechanical Engineering",
  "Civil": "Civil Engineering",
  "Civil Engineering": "Civil Engineering",
};

export const normalizeDomain = (domain) => {
  if (!domain || typeof domain !== 'string') return "Software Engineering / CS / IT";
  return DOMAIN_ALIASES[domain.trim()] || "Software Engineering / CS / IT";
};

// Mapping of engineering domains to their specific market trends and target roles

export const domainMappings = {
  "Software Engineering / CS / IT": {
    topSkills: [
      { name: 'Python', demand: 92, change: +8, tip: 'Used in AI/ML, Data Science, Backend. Top frameworks: Django, FastAPI, Flask.' },
      { name: 'React', demand: 88, change: +5, tip: 'Dominant frontend library. Used by Meta, Netflix, Airbnb. Pairs with Next.js.' },
      { name: 'AWS', demand: 85, change: +12, tip: 'Leading cloud platform. Key certs: Solutions Architect, Developer Associate.' },
      { name: 'TypeScript', demand: 82, change: +15, tip: 'Rapidly replacing JS in enterprise. Strongly typed, better DX and tooling.' },
      { name: 'SQL', demand: 78, change: +2, tip: 'Foundational for all data roles. Focus on window functions, CTEs, query optimization.' },
      { name: 'Docker', demand: 75, change: +10, tip: 'Essential for DevOps & microservices. Often paired with Kubernetes.' }
    ],
    roleTrends: [
      { role: 'AI/ML Engineer', status: 'hot', growth: '+34%', avgSalary: '₹25-55L', openings: '12.5K', tip: 'Highest growth role. Requires Python, ML frameworks, and LLM experience.' },
      { role: 'Full Stack Developer', status: 'growing', growth: '+18%', avgSalary: '₹12-30L', openings: '28K', tip: 'Most openings overall. React + Node.js is the most demanded stack.' },
      { role: 'Cloud Architect', status: 'hot', growth: '+28%', avgSalary: '₹30-55L', openings: '8.2K', tip: 'AWS/Azure/GCP certifications significantly boost salary.' },
      { role: 'Data Engineer', status: 'growing', growth: '+22%', avgSalary: '₹18-40L', openings: '15K', tip: 'Key skills: Spark, Airflow, Kafka, dbt. SQL mastery required.' },
      { role: 'Frontend Developer', status: 'stable', growth: '+6%', avgSalary: '₹8-22L', openings: '22K', tip: 'React dominates. TypeScript + Next.js knowledge gives a competitive edge.' },
      { role: 'Cybersecurity Analyst', status: 'hot', growth: '+30%', avgSalary: '₹12-35L', openings: '9.5K', tip: 'Surging demand post-AI. CISSP, CEH certs highly valued.' }
    ],
    targetRoles: [
      { id: 'frontend_developer', name: 'Frontend Developer', icon: '💻', suggestedSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Next.js', 'Redux', 'Tailwind'] },
      { id: 'backend_developer', name: 'Backend Developer', icon: '⚙️', suggestedSkills: ['Python', 'Node.js', 'SQL', 'PostgreSQL', 'Docker', 'AWS', 'Redis', 'GraphQL'] },
      { id: 'full_stack_developer', name: 'Full Stack Developer', icon: '🔧', suggestedSkills: ['React', 'Node.js', 'SQL', 'MongoDB', 'Docker', 'TypeScript', 'AWS', 'Express'] },
      { id: 'data_scientist', name: 'Data Scientist', icon: '📊', suggestedSkills: ['Python', 'SQL', 'Pandas', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Tableau', 'Statistics'] },
      { id: 'devops_engineer', name: 'DevOps Engineer', icon: '☁️', suggestedSkills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform', 'Ansible', 'GitOps'] }
    ]
  },
  "Mechanical Engineering": {
    topSkills: [
      { name: 'SolidWorks', demand: 88, change: +4, tip: 'Industry standard for 3D modeling. Get CSWP certified.' },
      { name: 'AutoCAD', demand: 85, change: +2, tip: 'Essential for 2D drafting and mechanical layouts.' },
      { name: 'ANSYS', demand: 80, change: +6, tip: 'Crucial for FEA (Finite Element Analysis) and simulations.' },
      { name: 'GD&T', demand: 78, change: +3, tip: 'Geometric Dimensioning & Tolerancing is mandatory for manufacturing roles.' },
      { name: 'Python', demand: 70, change: +12, tip: 'Increasingly needed for automating CAD tasks and simulations.' },
      { name: 'PLC Programming', demand: 85, change: +15, tip: 'Very hot bridging mechanical and automation.' }
    ],
    roleTrends: [
      { role: 'Design Engineer', status: 'stable', growth: '+5%', avgSalary: '₹6-15L', openings: '14K', tip: 'SolidWorks & GD&T are must-haves. Prototyping experience helps.' },
      { role: 'Manufacturing Engineer', status: 'growing', growth: '+8%', avgSalary: '₹8-18L', openings: '18K', tip: 'Lean Six Sigma and automation skills boost prospects.' },
      { role: 'Robotics Engineer', status: 'hot', growth: '+25%', avgSalary: '₹15-35L', openings: '6.5K', tip: 'Combines mechanical design, electronics, and coding.' },
      { role: 'HVAC Engineer', status: 'stable', growth: '+4%', avgSalary: '₹5-12L', openings: '12K', tip: 'Consistent demand. Knowledge of green energy systems is a plus.' },
      { role: 'Automotive Engineer', status: 'growing', growth: '+15%', avgSalary: '₹10-25L', openings: '9K', tip: 'EV (Electric Vehicle) battery design and packaging is booming.' }
    ],
    targetRoles: [
      { id: 'design_engineer', name: 'Design Engineer', icon: '📐', suggestedSkills: ['SolidWorks', 'AutoCAD', 'GD&T', 'Material Science', 'ANSYS', 'Prototyping', 'DFM'] },
      { id: 'manufacturing_engineer', name: 'Manufacturing Engineer', icon: '🏭', suggestedSkills: ['Lean Six Sigma', 'CAM', 'PLC', 'Root Cause Analysis', 'Quality Control', 'Six Sigma'] },
      { id: 'robotics_engineer', name: 'Robotics Engineer', icon: '🤖', suggestedSkills: ['ROS', 'Python', 'C++', 'Kinematics', 'Control Systems', 'Computer Vision', 'Mechatronics'] },
      { id: 'thermal_engineer', name: 'Thermal Engineer', icon: '🔥', suggestedSkills: ['Thermodynamics', 'Heat Transfer', 'ANSYS Fluent', 'CFD', 'HVAC Design', 'Fluid Mechanics'] },
      { id: 'automotive_engineer', name: 'Automotive Engineer', icon: '🏎️', suggestedSkills: ['Vehicle Dynamics', 'CAD', 'Catia', 'EV Systems', 'Battery Design', 'FEA'] }
    ]
  },
  "Electrical & Electronics (EEE)": {
    topSkills: [
      { name: 'MATLAB/Simulink', demand: 90, change: +5, tip: 'Core for power systems simulation & control theory.' },
      { name: 'AutoCAD Electrical', demand: 85, change: +3, tip: 'Essential for panel design and control circuit drafting.' },
      { name: 'PLC & SCADA', demand: 88, change: +10, tip: 'Backbone of industrial automation.' },
      { name: 'PowerWorld Simulator', demand: 75, change: +4, tip: 'Industry standard for power system analysis.' },
      { name: 'ETAP', demand: 82, change: +6, tip: 'Critical for electrical power systems modeling.' },
      { name: 'C/C++', demand: 80, change: +8, tip: 'Used for embedded systems and microcontroller programming.' }
    ],
    roleTrends: [
      { role: 'Power Systems Engineer', status: 'stable', growth: '+6%', avgSalary: '₹8-20L', openings: '15K', tip: 'Renewable energy integration is the biggest growth area.' },
      { role: 'Control Systems Engineer', status: 'growing', growth: '+12%', avgSalary: '₹10-25L', openings: '11K', tip: 'PLC programming (Siemens/Allen-Bradley) is highly valued.' },
      { role: 'Electrical Design Engineer', status: 'stable', growth: '+5%', avgSalary: '₹6-18L', openings: '13K', tip: 'AutoCAD Electrical and ETAP are mandatory.' },
      { role: 'Renewable Energy Engineer', status: 'hot', growth: '+28%', avgSalary: '₹12-30L', openings: '9K', tip: 'Solar PV and wind farm planning are booming globally.' },
      { role: 'Embedded Systems Engineer', status: 'hot', growth: '+22%', avgSalary: '₹15-40L', openings: '14K', tip: 'C/C++, RTOS, and ARM architecture are key.' }
    ],
    targetRoles: [
      { id: 'power_engineer', name: 'Power Systems Engineer', icon: '⚡', suggestedSkills: ['PowerWorld', 'ETAP', 'Load Flow Analysis', 'MATLAB', 'Substation Design', 'Smart Grids'] },
      { id: 'control_engineer', name: 'Control Systems Engineer', icon: '🎛️', suggestedSkills: ['PLC', 'SCADA', 'DCS', 'PID Control', 'MATLAB/Simulink', 'Automation', 'Sensors'] },
      { id: 'renewable_engineer', name: 'Renewable Energy Engineer', icon: '☀️', suggestedSkills: ['Solar PV', 'Wind Turbines', 'Grid Integration', 'Energy Storage', 'Power Electronics', 'Homer'] },
      { id: 'embedded_engineer', name: 'Embedded Systems Engineer', icon: '🔌', suggestedSkills: ['C/C++', 'Microcontrollers', 'RTOS', 'ARM', 'I2C/SPI', 'PCB Design', 'Firmware'] },
      { id: 'electrical_designer', name: 'Electrical Design Engineer', icon: '📐', suggestedSkills: ['AutoCAD Electrical', 'ETAP', 'Revit MEP', 'Dialux', 'Lighting Design', 'Panel Design'] }
    ]
  },
  "ECE (Electronics & Communication)": {
    topSkills: [
      { name: 'Verilog / VHDL', demand: 88, change: +6, tip: 'Fundamental for FPGA design and hardware description.' },
      { name: 'C / C++', demand: 92, change: +8, tip: 'The standard for firmware and embedded programming.' },
      { name: 'Python', demand: 85, change: +12, tip: 'Used for hardware testing automation and signal processing.' },
      { name: 'MATLAB', demand: 80, change: +4, tip: 'Used heavily in DSP (Digital Signal Processing) and comm systems.' },
      { name: 'Cadence / Mentor Graphics', demand: 75, change: +5, tip: 'Enterprise tools for PCB and VLSI design.' },
      { name: 'Linux / RTOS', demand: 86, change: +10, tip: 'Crucial for modern embedded software development.' }
    ],
    roleTrends: [
      { role: 'Embedded Software Engineer', status: 'hot', growth: '+24%', avgSalary: '₹15-45L', openings: '16K', tip: 'IoT and automotive (EVs) are driving massive demand.' },
      { role: 'VLSI Design Engineer', status: 'growing', growth: '+18%', avgSalary: '₹20-60L', openings: '8K', tip: 'ASIC/FPGA design. Very lucrative but requires high specialization.' },
      { role: 'Hardware Design Engineer', status: 'stable', growth: '+8%', avgSalary: '₹10-25L', openings: '12K', tip: 'PCB design, Altium Designer, schematic capture.' },
      { role: 'Telecom Engineer', status: 'stable', growth: '+5%', avgSalary: '₹8-20L', openings: '10K', tip: '5G network optimization and RF engineering are focus areas.' },
      { role: 'DSP Engineer', status: 'growing', growth: '+12%', avgSalary: '₹15-35L', openings: '5K', tip: 'Audio/Video processing, radar, and medical imaging applications.' }
    ],
    targetRoles: [
      { id: 'embedded_engineer', name: 'Embedded Software Engineer', icon: '💻', suggestedSkills: ['C/C++', 'Microcontrollers', 'RTOS', 'ARM architecture', 'I2C/SPI/UART', 'Oscilloscopes', 'Firmware'] },
      { id: 'vlsi_engineer', name: 'VLSI Design Engineer', icon: '🔬', suggestedSkills: ['Verilog', 'VHDL', 'ASIC Flow', 'FPGA Prototyping', 'SystemVerilog', 'Static Timing Analysis(STA)', 'Cadence'] },
      { id: 'hardware_engineer', name: 'Hardware Design Engineer', icon: '🔌', suggestedSkills: ['PCB Design', 'Altium Designer', 'KiCad', 'Schematic Capture', 'Signal Integrity', 'Mixed Signal'] },
      { id: 'telecom_engineer', name: 'Telecom / RF Engineer', icon: '📡', suggestedSkills: ['5G / LTE', 'RF Design', 'Antenna Design', 'Wireless Comms', 'MATLAB', 'Network Optimization', 'Microwave Engineering'] },
      { id: 'dsp_engineer', name: 'DSP Engineer', icon: '📻', suggestedSkills: ['MATLAB', 'C/C++', 'Digital Filters', 'Signal Processing Algorithms', 'Audio/Video Processing', 'Simulink', 'FPGA'] }
    ]
  },
  "Civil Engineering": {
    topSkills: [
      { name: 'AutoCAD Civil 3D', demand: 90, change: +4, tip: 'Essential for site design, grading, and infrastructure planning.' },
      { name: 'Revit (BIM)', demand: 88, change: +15, tip: 'BIM is taking over civil. Massive advantage if you know Revit.' },
      { name: 'STAAD.Pro', demand: 82, change: +3, tip: 'Standard for structural analysis and design.' },
      { name: 'Primavera P6', demand: 75, change: +6, tip: 'The gold standard for construction project management.' },
      { name: 'ETABS', demand: 78, change: +4, tip: 'Preferred for multi-story building structural analysis.' },
      { name: 'GIS / ArcGIS', demand: 70, change: +10, tip: 'Growing rapidly for urban planning and environmental engineering.' }
    ],
    roleTrends: [
      { role: 'Structural Engineer', status: 'stable', growth: '+6%', avgSalary: '₹8-20L', openings: '14K', tip: 'Requires strong understanding of local building codes and ETABS/STAAD.' },
      { role: 'BIM Coordinator', status: 'hot', growth: '+25%', avgSalary: '₹12-28L', openings: '8.5K', tip: 'Transitioning 2D AutoCAD designs into 3D collaborative Revit models.' },
      { role: 'Construction Manager', status: 'growing', growth: '+12%', avgSalary: '₹15-35L', openings: '18K', tip: 'Requires experience. PMP and Primavera P6 skills are highly paid.' },
      { role: 'Geotechnical Engineer', status: 'stable', growth: '+8%', avgSalary: '₹9-22L', openings: '6K', tip: 'Soil mechanics and foundation design. Often involves field work.' },
      { role: 'Transportation Engineer', status: 'growing', growth: '+10%', avgSalary: '₹10-25L', openings: '9K', tip: 'Highway and transit system design. High government contract demand.' }
    ],
    targetRoles: [
      { id: 'structural_engineer', name: 'Structural Engineer', icon: '🏗️', suggestedSkills: ['STAAD.Pro', 'ETABS', 'AutoCAD', 'SAP2000', 'Concrete Design', 'Steel Design', 'Building Codes'] },
      { id: 'bim_engineer', name: 'BIM Engineer', icon: '🏢', suggestedSkills: ['Revit', 'Navisworks', 'BIM 360', 'Clash Detection', 'AutoCAD 3D', 'Dynamo', 'Project Management'] },
      { id: 'construction_manager', name: 'Construction Manager', icon: '👷', suggestedSkills: ['Primavera P6', 'MS Project', 'Cost Estimation', 'Contract Management', 'Site Supervision', 'Quality Control'] },
      { id: 'geotechnical_engineer', name: 'Geotechnical Engineer', icon: '🌍', suggestedSkills: ['Soil Mechanics', 'Foundation Design', 'GeoStudio', 'PLAXIS', 'Site Investigation', 'Retaining Walls'] },
      { id: 'transportation_engineer', name: 'Transportation Engineer', icon: '🛣️', suggestedSkills: ['Civil 3D', 'Highway Design', 'Traffic Engineering', 'VISSIM', 'Pavement Design', 'Synchro'] }
    ]
  }
};

export const getDomainData = (domain) => {
  // Return the mapped data, defaulting to Software Engineering if domain is missing or unknown
  const normalizedDomain = normalizeDomain(domain);
  if (!domainMappings[normalizedDomain]) {
    return domainMappings["Software Engineering / CS / IT"];
  }
  return domainMappings[normalizedDomain];
};
