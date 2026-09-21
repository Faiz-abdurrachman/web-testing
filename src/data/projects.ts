export interface Project {
  id: string;
  title: string;
  tags: string[];
  description: string;
  image: string;
}

export const projects: Project[] = [
  {
    id: 'arutala',
    title: 'Arutala Aksara',
    tags: ['HoDS Apa', 'Lomba/research'],
    description:
      'Lorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum',
    image: '/images/projects/arutala-aksara.webp',
  },
  {
    id: 'nusantara-ocr',
    title: 'Nusantara OCR',
    tags: ['HoDS Vision', 'Open Source'],
    description:
      'Lorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum',
    image: '/images/projects/arutala-aksara.webp',
  },
  {
    id: 'pralaya',
    title: 'Pralaya Predictor',
    tags: ['HoDS Data', 'Research'],
    description:
      'Lorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum',
    image: '/images/projects/arutala-aksara.webp',
  },
  {
    id: 'kriya',
    title: 'Kriya Design System',
    tags: ['HoDS Product', 'Community'],
    description:
      'Lorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum',
    image: '/images/projects/arutala-aksara.webp',
  },
];
