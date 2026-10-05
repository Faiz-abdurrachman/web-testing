// Placeholder team data — mirrors the revised `Our Team` section (node 1688:2933)
// + the `Component per HoDS` component set (1594:5145). The design ships only
// placeholder names/photos; swap for real member data (photo + socials) when
// supplied. Do not invent URLs.
//
// `chip` is the selected-chip gradient (Figma -12°) and `fade` the card bottom
// fade (Figma 180°), both keyed to the HoDS domain tint. The fade adds a real
// tint stop at 35% @ 35% (a plain `tint 0% -> dark` collapses to a flat dark
// veil because CSS interpolates gradients premultiplied), fitted from node PNG.
export interface TeamMember {
  name: string;
  role: string;
  photo: 'marchel' | 'zidan-rose';
}

export interface HodsTeam {
  id: string;
  title: string;
  chip: string;
  fade: string;
  members: TeamMember[];
  joinNow?: boolean;
}

export const leaderTeam: TeamMember[] = [
  { name: 'Marchel Shevchenko', role: 'Founder', photo: 'marchel' },
  { name: 'Zidan Amikul', role: 'Community Lead', photo: 'zidan-rose' },
];

const member = (
  name = 'Zidan Amikul',
  role = 'Community Lead',
): TeamMember => ({ name, role, photo: 'zidan-rose' });

const fade = (r: number, g: number, b: number, dark: string, mid = 35) =>
  `linear-gradient(180deg, rgb(${r} ${g} ${b} / 0%) 0%, rgb(${r} ${g} ${b} / ${mid}%) 35%, ${dark} 100%)`;

export const hodsTeams: HodsTeam[] = [
  {
    id: 'data',
    title: 'Data Intelligence',
    chip: 'linear-gradient(90deg, #7c060d 0%, #c0696e 100%)',
    fade: fade(140, 0, 7, '#170002'),
    members: [member(), member(), member(), member()],
  },
  {
    id: 'core',
    title: 'Core AI & Engineering',
    chip: 'linear-gradient(90deg, #6c3bff 0%, #ede8ff 100%)',
    fade: fade(108, 59, 255, '#0e0626'),
    members: [member(), member(), member(), member()],
  },
  {
    id: 'language',
    title: 'Language & Reasoning',
    chip: 'linear-gradient(90deg, #008899 0%, #daf0ff 100%)',
    fade: fade(10, 148, 236, '#000e17'),
    members: [member(), member(), member(), member()],
  },
  {
    id: 'vision',
    title: 'Vision & Multimodal',
    chip: 'linear-gradient(90deg, #065246 0%, #fcfcfc 100%)',
    fade: fade(6, 82, 70, '#022620'),
    members: [member(), member(), member(), member()],
  },
  {
    id: 'product',
    title: 'Product & Software',
    chip: 'linear-gradient(90deg, #d0ac88 0%, #ffffff 100%)',
    fade: fade(208, 172, 136, '#150f09'),
    members: [member(), member(), member(), member()],
  },
  {
    id: 'growth',
    title: 'Growth & Community',
    chip: 'linear-gradient(90deg, #51ecf9 0%, #ffffff 100%)',
    fade: fade(81, 236, 249, '#071719'),
    members: [member(), member(), member()],
    joinNow: true,
  },
];
