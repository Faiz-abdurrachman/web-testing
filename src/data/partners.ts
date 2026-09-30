// Partners page content. Partner logos are placeholders (the Data Sorcerers
// mark) until real organisation art is supplied — see docs/assets.md §Partners.
export interface PartnerCategory {
  label: string;
  count: number;
}

export const partnerCategories: PartnerCategory[] = [
  { label: 'Industry', count: 10 },
  { label: 'Academia', count: 5 },
  { label: 'Community', count: 5 },
];

// Replace `logo` with the real organisation mark when available.
export const partnerLogo = '/images/partners/partner-logo.webp';

export interface WhyPartner {
  icon: string;
  title: string;
  description: string;
}

export const whyPartners: WhyPartner[] = [
  {
    icon: '/images/partners/why-talent.webp',
    title: 'Talent',
    description: 'Access to emerging AI & Data talent.',
  },
  {
    icon: '/images/partners/why-research.webp',
    title: 'Research',
    description: 'Collaborate on meaningful research.',
  },
  {
    icon: '/images/partners/why-innovation.webp',
    title: 'Innovation',
    description: 'Explore new technologies and ideas.',
  },
  {
    icon: '/images/partners/why-community.webp',
    title: 'Community',
    description: 'Reach a growing technology community.',
  },
];
