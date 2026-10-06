import snapshot from './cms-snapshot.json';

export interface Domain {
  id: string;
  title: string;
  description: string;
  tint: string;
  rows: { x: number; y: number; gap: number; labels: string[] }[];
}

// Measured card coordinates and tint remain local design configuration.
const domainDesign = [
  {
    id: 'data',
    tint: '140 0 7',
    rows: [
      {
        x: 56.32,
        y: 27.37,
        gap: 11,
      },
      {
        x: 172.97,
        y: 92.05,
        gap: 11,
      },
      {
        x: 53.8,
        y: 154.96,
        gap: 19,
      },
    ],
  },
  {
    id: 'core',
    tint: '98 80 255',
    rows: [
      {
        x: 45.69,
        y: 23.9,
        gap: 11,
      },
      {
        x: 162.34,
        y: 88.59,
        gap: 11,
      },
      {
        x: 77.67,
        y: 150.13,
        gap: 14,
      },
    ],
  },
  {
    id: 'language',
    tint: '10 148 236',
    rows: [
      {
        x: 77.44,
        y: 13.08,
        gap: 11,
      },
      {
        x: 164.23,
        y: 74.71,
        gap: 11,
      },
      {
        x: 34.87,
        y: 138.26,
        gap: 13,
      },
    ],
  },
  {
    id: 'vision',
    tint: '6 82 70',
    rows: [
      {
        x: 46.9,
        y: 14.98,
        gap: 11,
      },
      {
        x: 163.56,
        y: 79.67,
        gap: 11,
      },
      {
        x: 44.38,
        y: 142.58,
        gap: 14,
      },
    ],
  },
  {
    id: 'product',
    tint: '208 172 136',
    rows: [
      {
        x: 0,
        y: 0,
        gap: 11.942,
      },
      {
        x: 57.32,
        y: 64.49,
        gap: 11.942,
      },
      {
        x: 113.45,
        y: 130.17,
        gap: 11.942,
      },
    ],
  },
  {
    id: 'growth',
    tint: '81 236 249',
    rows: [
      {
        x: 0,
        y: 0,
        gap: 11.942,
      },
      {
        x: 70,
        y: 64.49,
        gap: 11.942,
      },
      {
        x: 17.1,
        y: 123.85,
        gap: 11.942,
      },
    ],
  },
];

export const domains: Domain[] = snapshot.domains.map((domain, index) => {
  const { labels, ...content } = domain;
  const design = domainDesign[index];
  return {
    ...content,
    ...design,
    rows: design.rows.map((row, rowIndex) => ({
      ...row,
      labels: labels[rowIndex],
    })),
  };
});
