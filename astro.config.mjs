import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Canonical origin used for absolute URLs (canonical, Open Graph, sitemap).
// Override with SITE_URL in the deploy environment if the domain changes.
const site =
  process.env.SITE_URL ?? 'https://data-sorcerers-community-sigma.vercel.app';

export default defineConfig({
  site,
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [
    sitemap({ filter: (page) => !new URL(page).pathname.startsWith('/lab/') }),
  ],
  // Keep both `backdrop-filter` and `-webkit-backdrop-filter` in the built CSS
  // (the default Lightning CSS pass dropped the unprefixed one, so the navbar
  // blur disappeared in Firefox on the deployed site).
  vite: {
    build: {
      cssMinify: 'esbuild',
    },
  },
});
