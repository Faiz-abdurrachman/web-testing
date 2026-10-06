import snapshot from './cms-snapshot.json';

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
  whatsapp?: string;
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

const roleDesign: Record<string, Pick<RoleDetail, 'centered' | 'tight'>> = {
  data: { tight: true },
  core: { tight: true },
};

export const roles: RoleDetail[] = snapshot.roles.map((role) => ({
  ...role,
  cardImage: cardImage(role.id),
  ...roleDesign[role.id],
}));
