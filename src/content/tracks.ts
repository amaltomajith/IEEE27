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
  /** Published topics, grouped under the sub-track each belongs to (the source lists them unsorted). */
  topics: { subTrack: number; items: string[] }[];
};

export const tracks: Track[] = [
  {
    slug: "cse-ai-ml",
    short: "CSE, AI & ML",
    department: "Computer Science & Engineering (CSE) and Artificial Intelligence & Machine Learning (AI & ML)",
    title: "Intelligent Computing, Human-Centred Systems, and Emerging Technologies",
    emphasis: "Human-Centred",
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
        subTrack: 1,
        items: [
          "Artificial Intelligence and Machine Learning Applications",
          "Cognitive Computing and Intelligent Systems",
          "Natural Language Processing",
          "Computer Vision and Image Processing",
          "Robotics and Autonomous Systems",
          "Human-Computer Interaction (HCI)",
        ],
      },
      {
        subTrack: 2,
        items: [
          "Cybersecurity, Privacy, and Digital Forensics",
          "Blockchain and Distributed Computing",
          "Explainable and Trustworthy AI",
          "Ethical, Responsible, and Sustainable AI",
        ],
      },
      {
        subTrack: 3,
        items: [
          "Cloud, Edge, and Fog Computing",
          "High-Performance and Parallel Computing",
          "Software Engineering and DevOps",
          "Computer Networks and Future Internet Technologies",
          "Internet of Things (IoT) and Smart Systems",
          "Digital Twin Technologies",
          "AR/VR, Metaverse, and Extended Reality",
          "Quantum Computing",
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
      "This track focuses on human-AI collaboration in smart energy, intelligent systems, and industrial automation. It covers AI-driven energy management, renewable integration, intelligent manufacturing, predictive maintenance, robotics, digital twins, and resilient engineering, emphasising enhanced decision-making, operational efficiency, sustainability, safety, and responsible innovation across energy and industrial sectors.",
    subTracks: [
      { number: 4, title: "AI-Driven Smart Energy and Intelligent Power Systems" },
      { number: 5, title: "Human-AI Collaboration in Intelligent Manufacturing and Automation" },
      { number: 6, title: "AI for Sustainable Engineering, Advanced Materials and Resilient Systems" },
    ],
    topics: [
      {
        subTrack: 4,
        items: [
          "AI for Smart Grids",
          "Renewable Energy Forecasting",
          "Intelligent Energy Storage",
          "AI for EV Integration",
          "Power System Stability",
          "Optimal Power Flow",
          "Intelligent Microgrids",
          "Power System Digital Twins",
        ],
      },
      {
        subTrack: 5,
        items: [
          "AI for Smart Manufacturing",
          "Human-Robot Collaboration",
          "Industrial Robotics",
          "Predictive Maintenance",
          "Digital Twins",
          "Machine Fault Diagnosis",
        ],
      },
      {
        subTrack: 6,
        items: [
          "AI-Based Design Optimisation",
          "Intelligent Thermal Systems",
          "Sustainable Manufacturing",
          "AI for Resilient Engineering",
          "AI for Energy Resilience",
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
      "As artificial intelligence reshapes industries and organisations, the future of business lies in meaningful collaboration between human intelligence and AI. This conference explores innovative research, emerging business practices, and interdisciplinary perspectives that foster responsible, sustainable, and technology-enabled transformation across management disciplines.",
    subTracks: [
      { number: 7, title: "Human Resource Management: People, AI, and the Future of Work" },
      { number: 8, title: "Marketing: Consumer Intelligence and Digital Transformation" },
      { number: 9, title: "Finance: Decision-Making and Risk Intelligence" },
    ],
    topics: [
      {
        subTrack: 7,
        items: [
          "AI in Talent Acquisition: Reducing Bias, Preserving Human Judgement",
          "The Future of Work: Human-AI Collaboration and Cognitive Load",
          "AI-Driven Employee Well-Being and Mental Health Analytics",
          "Reskilling the Human Mind: Learning and Development in the AI Era",
          "Trust, Transparency, and Emotional Intelligence in AI-Mediated Workplaces",
          "Gig Economy: The Future Workforce Opportunities and Challenges Ahead",
        ],
      },
      {
        subTrack: 8,
        items: [
          "Sustainable and Ethical Marketing in the Age of AI",
          "Consumer Behaviour, Psychology, and Customer Experience",
          "Brand Communication, Storytelling, and Content Ecosystems",
          "Commerce, Omnichannel Strategies, and Emerging Business Models",
          "AI-Powered, Data-Driven, and Intelligent Marketing Decision-Making",
        ],
      },
      {
        subTrack: 9,
        items: [
          "Emergence of Intelligent Markets and Financial Decision Systems",
          "Redefining Digital Banking Structure: Fintech Managing Risk Resilience",
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
      "AI is transforming human behaviour, mental health, and everyday experiences, creating new opportunities and challenges for psychological science and practice. This theme invites researchers, practitioners, and educators to explore the intersection of AI and psychology, focusing on mental healthcare, human-AI interaction, workplace and societal transformation, and human flourishing. It encourages interdisciplinary dialogue on ethical, inclusive, and evidence-based AI applications that enhance psychological well-being, foster resilience, and promote sustainable development while addressing the evolving needs of individuals and communities in the digital age.",
    subTracks: [
      { number: 10, title: "AI in Mental Health and Psychological Practice" },
      { number: 11, title: "Human-AI Interaction and Social Well-Being" },
      { number: 12, title: "AI Across Work, Development, and Society" },
    ],
    topics: [
      {
        subTrack: 10,
        items: [
          "AI-Enabled Clinical Decision Support and Precision Mental Healthcare",
          "Digital Therapeutics and Technology-Enhanced Psychological Interventions",
          "AI in Mental Health Services: Access, Innovation, and Workforce Readiness",
          "Human-Centred AI for Inclusive and Sustainable Mental Healthcare",
        ],
      },
      {
        subTrack: 11,
        items: [
          "Trust, Empathy, and Emotional Intelligence in Human-AI Relationships",
          "Psychological Adaptation, Cognition, and Decision-Making in the AI Era",
          "AI, Social Connectedness, and Changing Human Relationships",
          "Digital Identity, Social Media Behaviour, Digital Well-Being, and Online Communities",
          "Digital Exposure, Screen Time, Digital Addiction, and Psychological Resilience",
          "Social Media Algorithms and Behaviour Change: Nudging, Manipulation, and Autonomy",
        ],
      },
      {
        subTrack: 12,
        items: [
          "AI, Leadership, and the Future of Work",
          "Employee Well-Being, Workforce Resilience, and Human Performance",
          "Consumer Psychology and AI-Driven Decision-Making",
          "AI Across the Lifespan: Child Development, Parenting, Ageing, and Learning",
          "Algorithmic Anxiety and Technostress: Psychological Responses to AI in the Workplace",
          "Equity and Psychological Safety in AI-Augmented Educational and Professional Contexts",
        ],
      },
    ],
  },
];

export const getTrack = (slug: string) => tracks.find((t) => t.slug === slug);
