export interface RoleDetail {
  id: string;
  title: string;
  // Short card tagline for the Available Roles grid (Figma node 1218:1385),
  // deliberately different from `about`, which the detail page renders.
  tagline: string;
  chips: string[];
  deadline: string;
  about: string;
  requirements: string[];
  contact: string;
  cardImage: string;
  // The Figma "Detile Roles - DATA INTELLIGENCE" frame centers its content,
  // while the other role frames are top-aligned. Data and core group the back
  // link with the card (28px), the rest space them by the outer 58px; the
  // exported references agree.
  centered?: boolean;
  tight?: boolean;
}

// The role-detail card art is artwork-only, re-encoded (q88, 1280/2560) from
// the clean card fills `assets/image-src/hods/card-{id}.webp` (fallback
// `public/images/hods/card-{id}.webp`) by `scripts/generate-backgrounds.mjs`.
// The old Figma role exports carried baked titles/buttons and are not used.
const cardImage = (id: string) => `/images/roles/role-${id}-1280.webp`;

export const roles: RoleDetail[] = [
  {
    id: 'data',
    title: 'DATA INTELLIGENCE',
    tagline:
      'Transforming raw data into meaningful insights and building a solid analytical infrastructure for AI development.',
    chips: [
      'Data Science',
      'Data Analytics',
      'Data Engineering',
      'Data Infrastructure',
    ],
    deadline: 'Deadline: 20 Oktober 2026',
    about:
      'Data Intelligence focuses on processing, cleaning, and extracting data to generate meaningful insights. This division builds the analytical foundation to support experiments and research based on real-world data.',
    requirements: [
      'Basic understanding of Python programming or SQL queries.',
      'Understanding of data cleaning and data visualization concepts.',
      'Basic knowledge of statistics.',
      'Experience using Pandas or familiarity with advanced visualization tools.',
    ],
    contact: 'Zidan Amikul',
    cardImage: cardImage('data'),
    centered: true,
    tight: true,
  },
  {
    id: 'core',
    title: 'CORE AI & ENGINEERING',
    tagline:
      'Designing, training, and optimizing Machine Learning algorithms into functional, deploy-ready AI systems.',
    chips: ['Machine Learning', 'Deep Learning', 'AI Engineering', 'MLOps'],
    deadline: 'Deadline: 20 Oktober 2026',
    about:
      'This division designs, trains, and optimizes artificial intelligence models. Core AI & Engineering ensures algorithms can run efficiently from the experimental stage through to deployment.',
    requirements: [
      'Master programming fundamentals (Python preferred).',
      'Understand the basic concepts of how Machine Learning algorithms work.',
      'Plus Point: Experience in model training or deployment, and familiarity with libraries such as Scikit-learn, PyTorch, or TensorFlow.',
    ],
    contact: 'Zidan Amikul',
    cardImage: cardImage('core'),
    tight: true,
  },
  {
    id: 'language',
    title: 'LANGUAGE & REASONING',
    tagline:
      'Exploring NLP and Generative AI to build systems capable of processing human language and performing complex reasoning.',
    chips: ['NLP', 'Generative AI', 'LLM', 'RAG', 'AI Agents', 'Reasoning'],
    deadline: 'Deadline: 20 Oktober 2026',
    about:
      'Explores the capabilities of AI in understanding and processing human language. This division focuses on developing text-based systems, integrating generative models, and designing AI agents with reasoning capabilities.',
    requirements: [
      'Have a basic understanding of NLP or text processing.',
      'Understand the concepts of LLMs, prompt engineering, embeddings, or RAG.',
      'Understand how to integrate AI into an application.',
      'Plus Point: Experience using vector databases or specific experience building AI Agents.',
    ],
    contact: 'Zidan Amikul',
    cardImage: cardImage('language'),
  },
  {
    id: 'vision',
    title: 'VISION & MULTIMODEL',
    tagline:
      'Empowering machines with visual capabilities to detect, understand, and process images, video, and multimodal data.',
    chips: ['Computer Vision', 'OCR', 'Video Understanding', 'Multimodal AI'],
    deadline: 'Deadline: 20 Oktober 2026',
    about:
      'Provides visual capabilities to machines. This division experiments with image and video processing, object recognition, and the development of multimodal models that combine image and text analysis.',
    requirements: [
      'Understand basic image processing and Computer Vision concepts.',
      'Familiar with Python and OpenCV.',
      'Understand the concepts of image classification or object detection.',
      'Plus Point: Experience with YOLO or CNN architectures, as well as knowledge regarding OCR, segmentation, or video processing.',
    ],
    contact: 'Zidan Amikul',
    cardImage: cardImage('vision'),
  },
  {
    id: 'product',
    title: 'PRODUCT & SOFTWARE',
    tagline:
      'Transforming AI research and experiments into functional, interactive, and user-centric software products.',
    chips: ['UI/UX', 'Front-end', 'Back-end', 'DevOps'],
    deadline: 'Deadline: 20 Oktober 2026',
    about:
      'Transforms AI models and research into functional, user-centric software products. This area covers the entire application development cycle, from interface design to server management.',
    requirements: [
      'UI/UX: Understand basic UI/UX concepts, familiar with Figma, understand user flows, and have experience creating wireframes/interfaces. \n(Plus Point: Experience in UX research, usability testing, design systems, or interactive prototypes).',
      'Front-end: Master HTML, CSS, and basic JavaScript fundamentals. (Plus Point: Familiar with React, Next.js, TypeScript, Git, and API integration).',
      'Back-end: Understand programming fundamentals, API development concepts, and basic database management. \n(Plus Point: Experience with Node.js, Python/FastAPI, REST APIs, Authentication, and PostgreSQL/MySQL).',
      'DevOps: Understand Git/GitHub, basic Linux commands, and foundational server deployment concepts. \n(Plus Point: Familiar with Docker, CI/CD, Cloud architecture, Kubernetes, or monitoring systems).',
    ],
    contact: 'Zidan Amikul',
    cardImage: cardImage('product'),
  },
  {
    id: 'growth',
    title: 'GROWTH & COMMUNITY',
    tagline:
      "The driving force behind visual communication, partnerships, and expansion strategies to amplify Data Sorcerers' impact.",
    chips: ['Public Relations', 'Creative', 'Community & Partnership'],
    deadline: 'Deadline: 20 Oktober 2026',
    about:
      "The driving force behind Data Sorcerers' reach. This division is responsible for public communication, partnership management, creative campaign design, and maintaining the community ecosystem to ensure continuous growth.",
    requirements: [
      'Public Relations: Able to communicate effectively, compose communication copy, and understand basic social media management. \n(Plus Point: Experience in media relations, copywriting, and campaign management).',
      'Creative: Have basic visual/content creation skills using Figma, Illustrator, Photoshop, or video editing tools. \n(Plus Point: Expertise in motion graphics or 3D design, as well as possessing a portfolio of work).',
      'Community & Partnership: Possess strong networking and teamwork skills, and have the confidence to conduct outreach to external parties. \n(Plus Point: Experience managing partnerships, event collaborations, sponsorships, or stakeholder management).',
    ],
    contact: 'Zidan Amikul',
    cardImage: cardImage('growth'),
  },
];
