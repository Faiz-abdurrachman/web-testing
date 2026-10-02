// Placeholder team data — mirrors the Figma `team 2` component (node 1439:4310).
// The design only ships placeholder names/photos; swap for real member data
// (photo + socials) when supplied. Do not invent URLs.
export interface TeamMember {
  name: string;
  role: string;
  photo: 'marchel' | 'zidan-rose';
}

export interface TeamGroup {
  label: string;
  members: TeamMember[];
}

export const teamGroups: TeamGroup[] = [
  {
    label: 'Leader',
    members: [
      { name: 'Marchel Shevchenko', role: 'Founder', photo: 'marchel' },
      { name: 'Zidan Amikul', role: 'Community Lead', photo: 'zidan-rose' },
    ],
  },
  {
    label: 'Data Intelligence',
    members: [
      { name: 'Marchel Shevchenko', role: 'Founder', photo: 'marchel' },
      { name: 'Zidan Amikul', role: 'Community Lead', photo: 'zidan-rose' },
      { name: 'Rose', role: 'UI/UX Designer', photo: 'zidan-rose' },
      { name: 'Rose', role: 'UI/UX Designer', photo: 'zidan-rose' },
      { name: 'Rose', role: 'UI/UX Designer', photo: 'zidan-rose' },
    ],
  },
];
