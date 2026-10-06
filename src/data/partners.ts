import snapshot from './cms-snapshot.json';

// Partners page content. Partner logos are placeholders (the Data Sorcerers
// mark) until real organisation art is supplied — see docs/assets.md §Partners.
export interface PartnerCategory {
  label: string;
  count: number;
}

export interface WhyPartner {
  icon: string;
  title: string;
  description: string;
}

const partnerSlots = [10, 5, 5];
const whyIcons = [
  '/images/partners/why-talent.webp',
  '/images/partners/why-research.webp',
  '/images/partners/why-innovation.webp',
  '/images/partners/why-community.webp',
];

export const partnerCategories: PartnerCategory[] =
  snapshot.partners.partnerCategories.map((category, index) => ({
    ...category,
    count: partnerSlots[index],
  }));

export const partnerLogo = snapshot.partners.partnerLogo;

export const whyPartners: WhyPartner[] = snapshot.partners.whyPartners.map(
  (partner, index) => ({ ...partner, icon: whyIcons[index] }),
);
