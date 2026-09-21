export interface Domain {
  id: string;
  title: string;
  description: string;
  tint: string;
  rows: { x: number; y: number; gap: number; labels: string[] }[];
}
export const domains: Domain[] = [
  {
    id: 'data',
    title: 'Data Intelligence',
    description:
      'Transform raw data into actionable insights through robust pipelines.',
    tint: '140 0 7',
    rows: [
      {
        x: 56.32,
        y: 27.37,
        gap: 11,
        labels: ['', 'Data Infrastructure', '', ''],
      },
      {
        x: 172.97,
        y: 92.05,
        gap: 11,
        labels: [' Data Science', 'Data Analytics'],
      },
      { x: 53.8, y: 154.96, gap: 19, labels: ['', 'Data Engineering', ''] },
    ],
  },
  {
    id: 'core',
    title: 'Core AI & Engineering',
    description:
      'Develop foundational models and scalable engineering for robust AI.',
    tint: '98 80 255',
    rows: [
      { x: 45.69, y: 23.9, gap: 11, labels: ['', 'Machine Learning', '', ''] },
      {
        x: 162.34,
        y: 88.59,
        gap: 11,
        labels: ['Deep Learning', 'AI Engineering'],
      },
      { x: 77.67, y: 150.13, gap: 14, labels: ['', 'MLOps', ''] },
    ],
  },
  {
    id: 'language',
    title: 'Language & Reasoning',
    description:
      'Enable systems to understand, generate, and reason with language.',
    tint: '10 148 236',
    rows: [
      { x: 77.44, y: 13.08, gap: 11, labels: ['', 'NLP', '', ''] },
      {
        x: 164.23,
        y: 74.71,
        gap: 11,
        labels: ['Generative AI', 'AI Agents', ''],
      },
      { x: 34.87, y: 138.26, gap: 13, labels: ['', 'LLM & RAG', 'Reasoning'] },
    ],
  },
  {
    id: 'vision',
    title: 'Vision & Multimodal',
    description:
      'Empower machines to perceive and interpret multimodal visual data.',
    tint: '6 82 70',
    rows: [
      { x: 46.9, y: 14.98, gap: 11, labels: ['', 'Computer Vision', '', ''] },
      {
        x: 163.56,
        y: 79.67,
        gap: 11,
        labels: ['ORC', 'Video Understanding', ''],
      },
      { x: 44.38, y: 142.58, gap: 14, labels: ['', 'Multimodal AI', ''] },
    ],
  },
  {
    id: 'product',
    title: 'Product & Software',
    description:
      'Turn ideas into impactful digital products through research, design, and development.',
    tint: '208 172 136',
    rows: [
      { x: 0, y: 0, gap: 11.942, labels: ['', 'UX Research', '', ''] },
      {
        x: 57.32,
        y: 64.49,
        gap: 11.942,
        labels: ['', 'UI Design', 'Front-end', ''],
      },
      {
        x: 113.45,
        y: 130.17,
        gap: 11.942,
        labels: ['', 'Backend', 'DevOps', ''],
      },
    ],
  },
  {
    id: 'growth',
    title: 'Growth & Community',
    description:
      'Grow together through creativity, meaningful connections, and community collaboration.',
    tint: '81 236 249',
    rows: [
      { x: 0, y: 0, gap: 11.942, labels: ['', 'Public relations', '', ''] },
      { x: 70, y: 64.49, gap: 11.942, labels: ['', 'Creative', ''] },
      {
        x: 17.1,
        y: 123.85,
        gap: 11.942,
        labels: ['', 'Community & Partnership', ''],
      },
    ],
  },
];
