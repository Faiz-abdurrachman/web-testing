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
  // Warm the next document (HTML + linked islands) as nav links enter the
  // viewport, so Home <-> Recruitment switches paint almost instantly instead of
  // waiting on a cold document fetch.
  prefetch: { defaultStrategy: 'viewport' },
  integrations: [sitemap()],
  // Keep both `backdrop-filter` and `-webkit-backdrop-filter` in the built CSS
  // (the default Lightning CSS pass dropped the unprefixed one, so the navbar
  // blur disappeared in Firefox on the deployed site).
  vite: {
    build: {
      cssMinify: 'esbuild',
    },
  },
});
