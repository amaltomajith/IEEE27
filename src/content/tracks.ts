export type Track = {
  slug: "cse-ai-ml" | "eee-me" | "bba" | "psychology";
  short: string;
  department: string;
  title: string;
  /** Word in the title rendered in italic. */
  emphasis: string;
  poster: string;
  description: string;
  subTracks: { number: number; title: string }[];
  /** Topic lists as published; the source does not map topics to sub-tracks. */
  topics: { heading?: string; items: string[] }[];
};

export const tracks: Track[] = [
  {
    slug: "cse-ai-ml",
    short: "CSE, AI & ML",
    department: "Computer Science & Engineering (CSE) and Artificial Intelligence & Machine Learning (AI & ML)",
    title: "Intelligent Computing, Human-Centered Systems, and Emerging Technologies",
    emphasis: "Human-Centered",
    poster: "/images/tracks/cse-ai-ml.webp",
    description:
      "As computing technologies rapidly evolve, the future of digital innovation depends on intelligent, secure, and scalable computing solutions. This conference provides a platform for researchers, academicians, and industry experts to present pioneering work in artificial intelligence, data science, cybersecurity, cloud computing, software engineering, IoT, and emerging computing paradigms, promoting interdisciplinary collaboration and technological excellence for addressing global challenges.",
    subTracks: [
      { number: 1, title: "Artificial Intelligence, Data Science, and Intelligent Systems" },
      { number: 2, title: "Cybersecurity, Privacy, and Secure Intelligent Systems" },
      { number: 3, title: "Next-Generation Computing Infrastructure and Software Systems" },
    ],
    topics: [
      {
        items: [
          "Artificial Intelligence and Machine Learning Applications",
          "Explainable and Trustworthy AI",
          "Human-Computer Interaction (HCI)",
          "Cognitive Computing and Intelligent Systems",
          "Cybersecurity, Privacy, and Digital Forensics",
          "Blockchain and Distributed Computing",
          "Internet of Things (IoT) and Smart Systems",
          "Cloud, Edge, and Fog Computing",
          "High-Performance and Parallel Computing",
          "Software Engineering and DevOps",
          "Computer Networks and Future Internet Technologies",
          "Robotics and Autonomous Systems",
          "Digital Twin Technologies",
          "AR/VR, Metaverse, and Extended Reality",
          "Quantum Computing",
          "Natural Language Processing",
          "Computer Vision and Image Processing",
          "Ethical, Responsible, and Sustainable AI",
          "Emerging Trends in Computing Technologies",
        ],
      },
    ],
  },
  {
    slug: "eee-me",
    short: "EEE & ME",
    department: "Electrical and Electronics Engineering (EEE) and Mechanical Engineering (ME)",
    title: "Human-Centric AI for Smart Energy, Intelligent Systems and Sustainable Industrial Automation",
    emphasis: "Smart Energy,",
    poster: "/images/tracks/eee-me.webp",
    description:
      "This track focuses on human-AI collaboration in smart energy, intelligent systems, and industrial automation. It covers AI-driven energy management, renewable integration, intelligent manufacturing, predictive maintenance, robotics, digital twins, and resilient engineering, emphasizing enhanced decision-making, operational efficiency, sustainability, safety, and responsible innovation across energy and industrial sectors.",
    subTracks: [
      { number: 4, title: "AI-Driven Smart Energy and Intelligent Power Systems" },
      { number: 5, title: "Human-AI Collaboration in Intelligent Manufacturing and Automation" },
      { number: 6, title: "AI for Sustainable Engineering, Advanced Materials and Resilient Systems" },
    ],
    topics: [
      {
        heading: "Energy and power",
        items: [
          "AI for Smart Grids",
          "Renewable Energy Forecasting",
          "Intelligent Energy Storage",
          "AI for EV Integration",
          "Power System Stability",
          "Optimal Power Flow",
          "Intelligent Microgrids",
          "Predictive Maintenance",
          "Power System Digital Twins",
          "AI for Energy Resilience",
        ],
      },
      {
        heading: "Manufacturing and mechanical",
        items: [
          "AI for Smart Manufacturing",
          "Human-Robot Collaboration",
          "Predictive Maintenance",
          "Digital Twins",
          "AI-Based Design Optimization",
          "Intelligent Thermal Systems",
          "Industrial Robotics",
          "Sustainable Manufacturing",
          "Machine Fault Diagnosis",
          "AI for Resilient Engineering",
        ],
      },
    ],
  },
  {
    slug: "bba",
    short: "BBA",
    department: "Bachelor of Business Administration (BBA)",
    title: "Business Reimagined: Human-AI Collaboration",
    emphasis: "Reimagined:",
    poster: "/images/tracks/bba.webp",
    description:
      "As artificial intelligence reshapes industries and organizations, the future of business lies in meaningful collaboration between human intelligence and AI. This conference explores innovative research, emerging business practices, and interdisciplinary perspectives that foster responsible, sustainable, and technology-enabled transformation across management disciplines.",
    subTracks: [
      { number: 7, title: "Human Resource Management: People, AI, and the Future of Work" },
      { number: 8, title: "Marketing: Consumer Intelligence and Digital Transformation" },
      { number: 9, title: "Finance: Decision-Making and Risk Intelligence" },
    ],
    topics: [
      {
        items: [
          "AI in Talent Acquisition: Reducing Bias, Preserving Human Judgment",
          "The Future of Work: Human-AI Collaboration and Cognitive Load",
          "AI-Driven Employee Wellbeing and Mental Health Analytics",
          "Reskilling the Human Mind: Learning and Development in the AI Era",
          "Trust, Transparency, and Emotional Intelligence in AI-Mediated Workplaces",
          "Gig Economy: The Future Workforce Opportunities and Challenges Ahead",
          "Sustainable and Ethical Marketing in the Age of AI",
          "Consumer Behavior, Psychology, and Customer Experience",
          "Brand Communication, Storytelling, and Content Ecosystems",
          "Commerce, Omnichannel Strategies, and Emerging Business Models",
          "AI-Powered, Data-Driven, and Intelligent Marketing Decision-Making",
          "Emergence of Intelligent markets and Financial Decision systems",
          "Redefining Digital Banking structure: Fintech managing Risk Resilience",
          "Responsible AI in Governance and Ethical Finance",
          "AI in Green Finance, ESG, and Sustainable Value Creation",
          "AI-Driven Transformation in Reporting, Regulation, and Business Models",
        ],
      },
    ],
  },
  {
    slug: "psychology",
    short: "Psychology",
    department: "Psychology",
    title: "AI and Human Well-Being",
    emphasis: "Well-Being",
    poster: "/images/tracks/psychology.webp",
    description:
      "AI is transforming human behavior, mental health, and everyday experiences, creating new opportunities and challenges for psychological science and practice. This theme invites researchers, practitioners, and educators to explore the intersection of AI and psychology, focusing on mental healthcare, human-AI interaction, workplace and societal transformation, and human flourishing. It encourages interdisciplinary dialogue on ethical, inclusive, and evidence-based AI applications that enhance psychological well-being, foster resilience, and promote sustainable development while addressing the evolving needs of individuals and communities in the digital age.",
    subTracks: [
      { number: 10, title: "AI in Mental Health and Psychological Practice" },
      { number: 11, title: "Human-AI Interaction and Social Well-being" },
      { number: 12, title: "AI Across Work, Development, and Society" },
    ],
    topics: [
      {
        items: [
          "AI-Enabled Clinical Decision Support and Precision Mental Healthcare",
          "Digital Therapeutics and Technology-Enhanced Psychological Interventions",
          "AI in Mental Health Services: Access, Innovation, and Workforce Readiness",
          "Human-Centered AI for Inclusive and Sustainable Mental Healthcare",
          "Trust, Empathy, and Emotional Intelligence in Human-AI Relationships",
          "Psychological Adaptation, Cognition, and Decision-Making in the AI Era",
          "AI, Social Connectedness, and Changing Human Relationships",
          "Digital Identity, Social Media Behavior, Digital Well-being, and Online Communities",
          "AI, Leadership, and the Future of Work",
          "Employee Well-being, Workforce Resilience, and Human Performance",
          "Consumer Psychology and AI-Driven Decision-Making",
          "AI Across the Lifespan: Child Development, Parenting, Aging, and Learning",
          "Digital Exposure, Screen Time, Digital Addiction, and Psychological Resilience",
          "Algorithmic anxiety and technostress: psychological responses to AI in the workplace",
          "Social media algorithms and behaviour change: nudging, manipulation, and autonomy",
          "Equity and psychological safety in AI-augmented educational and professional contexts",
        ],
      },
    ],
  },
];

export const getTrack = (slug: string) => tracks.find((t) => t.slug === slug);
