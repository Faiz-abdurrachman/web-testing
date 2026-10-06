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

export const cmsSnapshotSchema = z.strictObject({
  schemaVersion: z.literal(1),
  projects: z.array(project).length(4).superRefine(uniqueIds),
});
