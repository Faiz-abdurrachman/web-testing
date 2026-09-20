# Asset provenance

## Visual reference

- Figma file: https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=755-15215
- Main reference: `assets/hero section/Hero Section.png` (5760 × 3612).
- Frame: 1440 × 903; horizontal inset: 80; navbar height: 106.8.
- Heading: Nasalization Regular, 80 / 98; two explicit lines.
- Body: Manrope Regular, 16 / 24; width 619; letter spacing -0.176.
- Copy gap: 24; copy-to-actions gap: 96; button gap: 24.

The screenshot is the final visual authority when exported CSS differs.
The standalone hero reference does not include the homepage's bottom fade;
that transition belongs to the later full-page integration.

## Images

- Hero: user-provided `assets/hero section/Gambar Hero Section.png`.
  Responsive WebP versions preserve the frame composition at 1440 and 2880
  pixels. The original remains untouched. Matching features against the PNG
  reference identified a slightly zoomed fill: source crop approximately
  `(22.69, 0, 5725.3, 3576.0)` in the 5736 × 3600 source. This is important:
  simply stretching the full supplied background shifts the figure and horizon.
- Logo: original Figma image fill exported from node
  `I755:15219;530:13497`. `logo-source.png` retains the source; `logo.png`
  applies the crop specified by Figma. No logo was redrawn.
- Text, navigation, and buttons are HTML/CSS, never flattened reference images.

## Fonts

- Manrope 400, 500, 600: Google Fonts, local TTF files.
  License: `public/fonts/Manrope-OFL.txt`.
- Nasalization Regular: Typodermic, obtained from its linked dafont listing:
  https://www.dafont.com/nasalization.font
  The current free download is a desktop license and explicitly excludes
  serving or embedding the font in a website. The desktop font was installed
  on the development machine for local preview only and is not in this repo.
  Source: https://typodermicfonts.com/downloads/

To make the heading consistent on every device, obtain the corresponding
licensed webfont, place it in `public/fonts/`, and update the Nasalization
`@font-face` in `src/styles/global.css` to use its URL. Until then, devices
without the local font use sans-serif; they do not match the heading reference.
