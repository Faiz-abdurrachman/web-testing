export interface HodSection {
  title: string;
  kind: 'text' | 'bullets';
  text?: string;
  bullets?: string[];
  color?: 'lavender' | 'white';
}

export interface HodTab {
  label: string;
  sections: HodSection[];
}

export interface HodDetail {
  id: string;
  title: string;
  description: string;
  cardImage: string;
  tabs: HodTab[];
}

export const hods: HodDetail[] = [
  {
    id: 'data',
    title: 'DATA INTELLIGENCE',
    description:
      'Transforming data into information, insights, and data systems that can be utilized for decision-making and AI development.',
    cardImage: '/images/hods/card-data.webp',
    tabs: [
      {
        label: 'Data Science',
        sections: [
          {
            title: 'LEARNING',
            kind: 'text',
            text: 'Python for Data Science, NumPy, Pandas, Data Cleaning, Exploratory Data Analysis (EDA), Statistical Analysis, Feature Engineering, Machine Learning Fundamentals, Model Evaluation, Data Visualization, Predictive Modeling.',
          },
          {
            title: 'Expected Skills',
            kind: 'bullets',
            bullets: [
              'Ability to understand and explore datasets.',
              'Ability to discover patterns and insights.',
              'Ability to build predictive models.',
              'Ability to explain analytical results scientifically.',
            ],
          },
          {
            title: 'OUTPUT',
            kind: 'text',
            text: 'Data analysis, Prediction model, Experiment, Research, Dataset analysis, Dashboard/visualization.',
          },
        ],
      },
      {
        label: 'Data Analytics',
        sections: [
          {
            title: 'LEARNING',
            kind: 'text',
            text: 'Data Analysis, SQL, Data Visualization, Business Intelligence, Descriptive & Diagnostic Analytics, Dashboard, KPI & Metrics, Data Storytelling, Reporting, Analytical Thinking.',
          },
          {
            title: 'TOOLS',
            kind: 'text',
            color: 'white',
            text: 'SQL, Python, Excel/Spreadsheet, Power BI / Tableau, Pandas.',
          },
          {
            title: 'OUTPUT',
            kind: 'text',
            text: 'Analytical report, Dashboard, Data storytelling, Business insight, Research supporting analysis.',
          },
        ],
      },
      {
        label: 'Data Engineering',
        sections: [
          {
            title: 'LEARNING',
            kind: 'text',
            text: 'SQL, Database, Data Modeling, ETL / ELT, Data Pipeline, Data Warehouse, Data Lake, API & Data Ingestion, Batch & Streaming Data, Data Processing, Workflow Orchestration.',
          },
          {
            title: 'TOOLS/TECHNOLOGIES',
            kind: 'text',
            color: 'white',
            text: 'PostgreSQL / MySQL, Python, Apache Airflow, Spark, Kafka, Cloud data services.',
          },
          {
            title: 'OUTPUT',
            kind: 'text',
            text: 'Data pipeline, Data warehouse, ETL system, Data ingestion system, Dataset infrastructure.',
          },
        ],
      },
      {
        label: 'Data Infrastructure',
        sections: [
          {
            title: 'LEARNING',
            kind: 'text',
            text: 'Cloud Computing, Storage, Compute, Database Infrastructure, Distributed Systems, Data Security, Infrastructure Monitoring, Scalability, Data Architecture.',
          },
          {
            title: 'FOCUS',
            kind: 'text',
            color: 'white',
            text: 'Not just "processing data," but building the infrastructure so data can be used reliably and scalably.',
          },
        ],
      },
    ],
  },
  {
    id: 'core',
    title: 'CORE AI & ENGINEERING',
    description:
      'Building AI models and transforming them into real-world AI systems.',
    cardImage: '/images/hods/card-core.webp',
    tabs: [
      {
        label: 'Machine Learning',
        sections: [
          {
            title: 'LEARNING',
            kind: 'text',
            text: 'Supervised Learning, Unsupervised Learning, Regression, Classification, Clustering, Feature Engineering, Model Selection, Model Evaluation, Hyperparameter Tuning, Ensemble Methods.',
          },
          {
            title: 'ALGORITHMS',
            kind: 'text',
            text: 'Linear Regression, Logistic Regression, Decision Tree, Random Forest, SVM, KNN, XGBoost, Clustering.',
          },
          {
            title: 'OUTPUT',
            kind: 'text',
            text: 'Prediction system, Classification system, ML experiment, Research, Prototype AI.',
          },
        ],
      },
      {
        label: 'Deep Learning',
        sections: [
          {
            title: 'LEARNING',
            kind: 'text',
            text: 'Neural Network, Forward & Backpropagation, Optimization, CNN, RNN, LSTM, Transformer, Transfer Learning, Fine-tuning, Model Training.',
          },
          {
            title: 'FRAMEWORKS',
            kind: 'text',
            text: 'PyTorch, TensorFlow.',
          },
          {
            title: 'OUTPUT',
            kind: 'text',
            text: 'Deep learning experiment, Trained model, Research, AI prototype.',
          },
        ],
      },
      {
        label: 'AI Engineering',
        sections: [
          {
            title: 'LEARNING',
            kind: 'text',
            text: 'AI Application Architecture, Model Integration, AI API, Inference, Model Serving, AI Pipeline, AI Backend, Prompt Engineering, AI Evaluation, AI System Design, Production AI, AI Security.',
          },
          {
            title: 'OUTPUT',
            kind: 'text',
            text: 'AI application, AI API, AI-powered product, AI system, Production prototype.',
          },
        ],
      },
      {
        label: 'MLOps',
        sections: [
          {
            title: 'LEARNING',
            kind: 'text',
            text: 'Model Deployment, Model Serving, CI/CD, Model Versioning, Experiment Tracking, Monitoring, Model Registry, Infrastructure, Containerization, Docker, Cloud Deployment.',
          },
          {
            title: 'TOOLS',
            kind: 'text',
            text: 'Docker, Git/GitHub, MLflow, Kubernetes, Cloud Platform.',
          },
          {
            title: 'OUTPUT',
            kind: 'text',
            text: 'Deployable AI model, ML pipeline, AI infrastructure, Monitoring system.',
          },
        ],
      },
    ],
  },
  {
    id: 'language',
    title: 'LANGUAGE & REASONING',
    description:
      'Building AI capable of understanding language, generating information, utilizing knowledge, and performing reasoning.',
    cardImage: '/images/hods/card-language.webp',
    tabs: [
      {
        label: 'Natural Language Processing',
        sections: [
          {
            title: 'LEARNING',
            kind: 'text',
            text: 'Text Processing, Tokenization, Text Classification, Sentiment Analysis, Named Entity Recognition, Text Similarity, Information Extraction, Embedding, Semantic Search, Language Models.',
          },
          {
            title: 'OUTPUT',
            kind: 'text',
            text: 'Text classifier, Search system, NLP experiment, Information extraction system, Research.',
          },
        ],
      },
      {
        label: 'Generative AI',
        sections: [
          {
            title: 'LEARNING',
            kind: 'text',
            text: 'Generative Models, LLM, Prompt Engineering, Embedding, RAG, AI Agents, Fine-tuning, Evaluation, Multistep AI Workflow.',
          },
          {
            title: 'Inside Generative AI',
            kind: 'bullets',
            bullets: [
              'LLM: Transformer architecture, LLM fundamentals, Prompting, Context management, Embeddings, Model evaluation.',
              'RAG: Document processing, Chunking, Embedding, Vector database, Retrieval, Reranking, Grounded generation.',
              'AI Agents: Tool calling, Function calling, Agent workflow, Memory, Planning, Multi-agent system.',
              'Reasoning: Structured reasoning, Planning, Problem decomposition, Verification, Reasoning evaluation.',
            ],
          },
          {
            title: 'OUTPUT',
            kind: 'text',
            text: 'RAG application, AI Agent, LLM application, Knowledge assistant, AI research, AI-powered product.',
          },
        ],
      },
    ],
  },
  {
    id: 'vision',
    title: 'VISION & MULTIMODAL',
    description:
      'Building AI capable of understanding visuals, video, and combinations of various information types.',
    cardImage: '/images/hods/card-vision.webp',
    tabs: [
      {
        label: 'Computer Vision',
        sections: [
          {
            title: 'LEARNING',
            kind: 'text',
            text: 'Image Processing, Image Classification, Object Detection, Image Segmentation, Image Recognition, Feature Extraction, Image Embedding, Face/Object Analysis, Visual Tracking.',
          },
          {
            title: 'Framework/Tools',
            kind: 'text',
            text: 'OpenCV, PyTorch, TensorFlow, YOLO.',
          },
          {
            title: 'OUTPUT',
            kind: 'text',
            text: 'Object detection, Image classification, Visual recognition, Computer vision research, AI prototype.',
          },
        ],
      },
      {
        label: 'Optical Character Recognition',
        sections: [
          {
            title: 'LEARNING',
            kind: 'text',
            text: 'Image Preprocessing, Text Detection, Text Recognition, Document Understanding, Handwritten Text Recognition, OCR Pipeline.\n(Example: Highly relevant for projects like the digitization of Nusantara scripts).',
          },
        ],
      },
      {
        label: 'Video Understanding',
        sections: [
          {
            title: 'LEARNING',
            kind: 'text',
            text: 'Video Processing, Object Tracking, Action Recognition, Temporal Analysis, Video Classification, Video Object Detection, Video Understanding.',
          },
        ],
      },
      {
        label: 'Multimodal AI',
        sections: [
          {
            title: 'LEARNING',
            kind: 'text',
            text: 'Vision + Language, Image + Text, Video + Text, Multimodal Embedding, Vision-Language Models, Multimodal LLM, Multimodal RAG.',
          },
          {
            title: 'OUTPUT',
            kind: 'text',
            text: 'Image understanding system, OCR system, Video AI, Vision-language application, Multimodal AI research.',
          },
        ],
      },
    ],
  },
  {
    id: 'product',
    title: 'PRODUCT & SOFTWARE',
    description:
      'Turn ideas into impactful digital products through research, design, and development.',
    cardImage: '/images/hods/card-product.webp',
    tabs: [
      {
        label: 'UI/UX',
        sections: [
          {
            title: 'LEARNING',
            kind: 'text',
            text: '  - UX Research Learning: User Research, Interview, Observation, Survey, User Persona, User Journey, Problem Discovery, Usability Testing, Information Architecture, UX Evaluation.\n  - UI Design Learning: Design Principles, Visual Design, Typography, Color, Layout, Design System, Component Design, Responsive Design, Prototyping, Design Handoff.',
          },
          {
            title: 'Tools',
            kind: 'text',
            text: 'Figma, FigJam.',
          },
          {
            title: 'OUTPUT',
            kind: 'text',
            text: 'User research, User flow, Wireframe, UI Design, Design system, Prototype, Usability testing report.',
          },
        ],
      },
      {
        label: 'Front-end Development',
        sections: [
          {
            title: 'LEARNING',
            kind: 'text',
            text: 'HTML, CSS, JavaScript, TypeScript, Responsive Web, Component-based Development, API Integration, State Management, Authentication, Web Performance, Accessibility, Front-end Architecture.',
          },
          {
            title: 'FRAMEWORK',
            kind: 'text',
            text: 'React, Next.js.',
          },
          {
            title: 'OUTPUT',
            kind: 'text',
            text: 'Website, Web application, Interactive prototype, Production-ready frontend.',
          },
        ],
      },
      {
        label: 'Back-end Development',
        sections: [
          {
            title: 'LEARNING',
            kind: 'text',
            text: 'Programming Fundamentals, REST API, API Architecture, Database, Authentication, Authorization, Backend Architecture, Server, Security, API Integration, Microservices fundamentals.',
          },
          {
            title: 'TECHNOLOGIES',
            kind: 'text',
            text: 'Node.js, Python, FastAPI, PostgreSQL, MySQL.',
          },
          {
            title: 'OUTPUT',
            kind: 'text',
            text: 'REST API, Backend service, Database system, Authentication system, Backend for AI products.',
          },
        ],
      },
      {
        label: 'DevOps',
        sections: [
          {
            title: 'LEARNING',
            kind: 'text',
            text: 'Linux, Git/GitHub, Server, Docker, CI/CD, Cloud, Deployment, Infrastructure, Monitoring, Security, Domain & DNS, Application scaling.',
          },
          {
            title: 'OUTPUT',
            kind: 'text',
            text: 'Deployment pipeline, Cloud infrastructure, Production environment, Monitoring system.',
          },
        ],
      },
    ],
  },
  {
    id: 'growth',
    title: 'GROWTH & COMMUNITY',
    description:
      'Grow people, grow community, and make ideas, projects, and impact visible.',
    cardImage: '/images/hods/card-growth.webp',
    tabs: [
      {
        label: 'Public Relations',
        sections: [
          {
            title: 'FOCUS',
            kind: 'text',
            text: "Building Data Sorcerers' communication and public reputation.",
          },
          {
            title: 'LEARNING',
            kind: 'text',
            text: 'Public Relations, Communication Strategy, Media Relations, Press Release, Brand Communication, Copywriting, Storytelling, Community Communication, Crisis Communication, External Communication.',
          },
          {
            title: 'OUTPUT',
            kind: 'text',
            text: 'Press release, Media publication, Community announcement, Organization profile, Campaign communication, Public communication.',
          },
        ],
      },
      {
        label: 'Creative',
        sections: [
          {
            title: 'FOCUS',
            kind: 'text',
            text: "Translating knowledge, projects, research, and Data Sorcerers' activities into engaging and easily understandable visual communication.",
          },
          {
            title: 'LEARNING',
            kind: 'text',
            text: 'Graphic Design, Visual Communication, Content Design, Social Media Design, Illustration, Motion Design, Video Production, Video Editing, Creative Direction, Content Strategy.',
          },
          {
            title: 'TOOLS',
            kind: 'text',
            text: 'Figma, Adobe Illustrator, Photoshop, Premiere Pro, After Effects, Blender (optional).',
          },
          {
            title: 'OUTPUT',
            kind: 'text',
            text: 'Social media content, Campaign visual, Video, Project showcase, Research visualization, Event visual, Brand assets.',
          },
        ],
      },
      {
        label: 'Community & Partnership',
        sections: [
          {
            title: 'FOCUS',
            kind: 'text',
            text: 'Building relationships between Data Sorcerers and its members, communities, universities, industries, researchers, and partners.',
          },
          {
            title: 'LEARNING',
            kind: 'text',
            text: '  - Community Learning: Community Building, Community Engagement, Member Experience, Community Activation, Event Community, Community Retention, Networking, Collaboration.\n  - Partnership Learning: Partnership Strategy, Stakeholder Management, Proposal, Negotiation, Collaboration, Sponsorship, Industry Relations, Academic Relations, Government/Institution Relations.',
          },
          {
            title: 'OUTPUT',
            kind: 'text',
            text: 'Community collaboration, Partnership, Industry collaboration, University collaboration, Speaker/network, Sponsorship, External project.',
          },
        ],
      },
    ],
  },
];

export const hodById = (id: string) => hods.find((hod) => hod.id === id);
