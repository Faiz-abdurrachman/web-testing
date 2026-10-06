import snapshot from './cms-snapshot.json';

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

// Tab order, section kind, color and baked artwork are design configuration.
const hodDesign: {
  id: string;
  cardImage: string;
  tabs: { label: string; sections: Pick<HodSection, 'kind' | 'color'>[] }[];
}[] = [
  {
    id: 'data',
    cardImage: '/images/hods/card-data.webp',
    tabs: [
      {
        label: 'Data Science',
        sections: [
          {
            kind: 'text',
          },
          {
            kind: 'bullets',
          },
          {
            kind: 'text',
          },
        ],
      },
      {
        label: 'Data Analytics',
        sections: [
          {
            kind: 'text',
          },
          {
            kind: 'text',
            color: 'white',
          },
          {
            kind: 'text',
          },
        ],
      },
      {
        label: 'Data Engineering',
        sections: [
          {
            kind: 'text',
          },
          {
            kind: 'text',
            color: 'white',
          },
          {
            kind: 'text',
          },
        ],
      },
      {
        label: 'Data Infrastructure',
        sections: [
          {
            kind: 'text',
          },
          {
            kind: 'text',
            color: 'white',
          },
        ],
      },
    ],
  },
  {
    id: 'core',
    cardImage: '/images/hods/card-core.webp',
    tabs: [
      {
        label: 'Machine Learning',
        sections: [
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
        ],
      },
      {
        label: 'Deep Learning',
        sections: [
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
        ],
      },
      {
        label: 'AI Engineering',
        sections: [
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
        ],
      },
      {
        label: 'MLOps',
        sections: [
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
        ],
      },
    ],
  },
  {
    id: 'language',
    cardImage: '/images/hods/card-language.webp',
    tabs: [
      {
        label: 'Natural Language Processing',
        sections: [
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
        ],
      },
      {
        label: 'Generative AI',
        sections: [
          {
            kind: 'text',
          },
          {
            kind: 'bullets',
          },
          {
            kind: 'text',
          },
        ],
      },
    ],
  },
  {
    id: 'vision',
    cardImage: '/images/hods/card-vision.webp',
    tabs: [
      {
        label: 'Computer Vision',
        sections: [
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
        ],
      },
      {
        label: 'Optical Character Recognition',
        sections: [
          {
            kind: 'text',
          },
        ],
      },
      {
        label: 'Video Understanding',
        sections: [
          {
            kind: 'text',
          },
        ],
      },
      {
        label: 'Multimodal AI',
        sections: [
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
        ],
      },
    ],
  },
  {
    id: 'product',
    cardImage: '/images/hods/card-product.webp',
    tabs: [
      {
        label: 'UI/UX',
        sections: [
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
        ],
      },
      {
        label: 'Front-end Development',
        sections: [
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
        ],
      },
      {
        label: 'Back-end Development',
        sections: [
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
        ],
      },
      {
        label: 'DevOps',
        sections: [
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
        ],
      },
    ],
  },
  {
    id: 'growth',
    cardImage: '/images/hods/card-growth.webp',
    tabs: [
      {
        label: 'Public Relations',
        sections: [
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
        ],
      },
      {
        label: 'Creative',
        sections: [
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
        ],
      },
      {
        label: 'Community & Partnership',
        sections: [
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
          {
            kind: 'text',
          },
        ],
      },
    ],
  },
];

export const hods: HodDetail[] = snapshot.hods.map((hod, index) => {
  const design = hodDesign[index];
  return {
    ...hod,
    ...design,
    tabs: design.tabs.map((tab, tabIndex) => ({
      ...tab,
      sections: tab.sections.map((section, sectionIndex) => ({
        ...section,
        ...hod.tabs[tabIndex].sections[sectionIndex],
      })),
    })),
  };
});

export const hodById = (id: string) => hods.find((hod) => hod.id === id);
