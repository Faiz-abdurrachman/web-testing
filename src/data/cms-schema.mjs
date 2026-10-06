import { z } from 'astro/zod';

const text = z.string().min(1).max(20000);
const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const image = z
  .string()
  .refine(
    (value) =>
      /^\/images\/[a-zA-Z0-9_./-]+$/.test(value) && !value.includes('..'),
    'B0 images must reference existing local artwork',
  );
const uniqueIds = (records, ctx) => {
  const seen = new Set();
  records.forEach((record, index) => {
    if (seen.has(record.id))
      ctx.addIssue({
        code: 'custom',
        path: [index, 'id'],
        message: 'Duplicate record ID',
      });
    seen.add(record.id);
  });
};

const project = z.strictObject({
  id,
  title: text,
  tags: z.array(text).length(2),
  description: text,
  image,
});

const domainIds = ['data', 'core', 'language', 'vision', 'product', 'growth'];
const orderedDomains = (schema) =>
  z
    .array(schema)
    .length(6)
    .superRefine((records, ctx) => {
      records.forEach((record, index) => {
        if (record.id !== domainIds[index])
          ctx.addIssue({
            code: 'custom',
            path: [index, 'id'],
            message: 'Domain routes and order are fixed by design',
          });
      });
    });
const member = z.strictObject({
  name: text,
  role: text,
  photo: z.enum(['marchel', 'zidan-rose']),
});
const teamGroup = z
  .strictObject({ id, title: text, members: z.array(member) })
  .superRefine((group, ctx) => {
    if (group.members.length !== (group.id === 'growth' ? 3 : 4))
      ctx.addIssue({
        code: 'custom',
        path: ['members'],
        message: 'Member slots are fixed by design',
      });
  });

const role = z
  .strictObject({
    id,
    title: text,
    tagline: text,
    chips: z.array(text),
    deadline: text,
    about: text,
    requirements: z.array(text),
    contact: text,
    whatsapp: z
      .string()
      .regex(/^\d{8,15}$/)
      .optional(),
  })
  .superRefine((record, ctx) => {
    const index = domainIds.indexOf(record.id);
    for (const [field, counts] of [
      ['chips', [4, 4, 6, 4, 4, 3]],
      ['requirements', [4, 3, 4, 4, 4, 3]],
    ]) {
      if (record[field].length !== counts[index])
        ctx.addIssue({
          code: 'custom',
          path: [field],
          message: 'Role content slots are fixed by design',
        });
    }
  });

export const cmsSnapshotSchema = z.strictObject({
  schemaVersion: z.literal(1),
  projects: z.array(project).length(4).superRefine(uniqueIds),
  team: z.strictObject({
    leaderTeam: z.array(member).length(2),
    hodsTeams: orderedDomains(teamGroup),
  }),
  roles: orderedDomains(role),
  partners: z.strictObject({
    partnerCategories: z.array(z.strictObject({ label: text })).length(3),
    partnerLogo: image,
    whyPartners: z
      .array(z.strictObject({ title: text, description: text }))
      .length(4),
  }),
});
