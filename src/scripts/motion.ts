import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// On phones the address bar hides/shows as you scroll, firing a resize that would
// otherwise make ScrollTrigger re-measure every trigger mid-scroll and shift the
// page. Ignoring that delta keeps reveals (and anything scrubbed) stable.
ScrollTrigger.config({ ignoreMobileResize: true });

const finePointer = () => window.matchMedia('(pointer: fine)').matches;

type Cleanup = () => void;

let inited = false;
// Kept so client-side navigation can tear the whole system down before the old
// page's nodes are swapped out (otherwise ScrollTriggers keep pointing at
// removed elements and the hero pin spacer geometry leaks into the next page).
let mm: ReturnType<typeof gsap.matchMedia> | null = null;

export function destroyMotion() {
  if (!inited) return;
  inited = false;
  mm?.revert();
  mm = null;
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  document.documentElement.classList.remove('hero-ready');
}

function reveal(
  scope: Element | null,
  selector: string,
  vars: gsap.TweenVars = {},
) {
  if (!scope) return;
  const items = gsap.utils.toArray<HTMLElement>(selector, scope);
  if (!items.length) return;
  gsap.from(items, {
    autoAlpha: 0,
    y: 54,
    duration: 0.75,
    ease: 'power2.out',
    stagger: 0.08,
    scrollTrigger: { trigger: scope, start: 'top 85%', once: true },
    ...vars,
  });
}

function pillarIntro(whatWeDo: HTMLElement) {
  const eyebrow = whatWeDo.querySelector<HTMLElement>(
    '.section-heading .eyebrow',
  );
  const lines = gsap.utils.toArray<HTMLElement>(
    '.section-heading h2 > .line > span',
    whatWeDo,
  );
  const pillars = gsap.utils.toArray<HTMLElement>('.pillar', whatWeDo);
  if (!pillars.length) return;

  // Each card starts pulled toward the heading (its grid corner's opposite) and
  // flies out to its slot; the layout tilts like a camera settling on the scene.
  const inward = [
    { x: 70, y: 56, r: -4 },
    { x: -70, y: 56, r: 4 },
    { x: 70, y: -56, r: -4 },
    { x: -70, y: -56, r: 4 },
  ];

  if (eyebrow) gsap.set(eyebrow, { autoAlpha: 0, y: 14 });
  if (lines.length) gsap.set(lines, { yPercent: 115 });
  // Keep it cheap: 2D translate/scale/opacity only — no 3D camera tilt on the
  // whole layout (that forced the section onto its own layer and re-rasterised
  // the starfield every frame).
  pillars.forEach((card, i) => {
    const v = inward[i % inward.length];
    gsap.set(card, {
      x: v.x,
      y: v.y,
      rotation: v.r,
      scale: 0.82,
      autoAlpha: 0,
    });
  });

  // Auto-plays once when the section reaches the viewport — no pin, no scrub, so
  // the reveal is time-based and completes on its own instead of tracking scroll.
  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: { trigger: whatWeDo, start: 'top 72%', once: true },
  });

  if (eyebrow) tl.to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.5 }, 0);
  if (lines.length)
    tl.to(lines, { yPercent: 0, duration: 0.8, stagger: 0.1 }, 0.05);
  tl.to(
    pillars,
    {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      autoAlpha: 1,
      duration: 0.9,
      stagger: 0.12,
    },
    0.18,
  );
}

function domainIntro(domains: HTMLElement) {
  const cards = gsap.utils.toArray<HTMLElement>('.domain-card', domains);
  if (!cards.length) return;
  const glows = cards
    .map((card) => card.querySelector<HTMLElement>('.glow'))
    .filter((el): el is HTMLElement => Boolean(el));

  // Cards lift into place with a touch of scale, then each card's glow ignites
  // a beat later — so the section assembles rather than just fading in. Under
  // reduced motion this whole block is skipped, keeping the PNG frame exact.
  // `clearProps: 'transform'` hands the inline transform back to CSS when the
  // entrance ends, otherwise it would out-rank the `.domain-card:hover` lift
  // (home only — recruitment never runs domainIntro, so its hover worked).
  gsap.set(cards, { y: 74, scale: 0.94, autoAlpha: 0 });
  if (glows.length) gsap.set(glows, { autoAlpha: 0, scale: 0.9 });

  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: { trigger: domains, start: 'top 78%', once: true },
  });
  tl.to(cards, {
    y: 0,
    scale: 1,
    autoAlpha: 1,
    duration: 0.95,
    stagger: 0.09,
    clearProps: 'transform',
  });
  if (glows.length)
    tl.to(
      glows,
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.9,
        stagger: 0.09,
        clearProps: 'transform',
      },
      0.12,
    );
}

function tilt(element: HTMLElement, max: number, cleanups: Cleanup[]) {
  gsap.set(element, { transformPerspective: 900 });
  const rx = gsap.quickTo(element, 'rotationX', {
    duration: 0.5,
    ease: 'power3',
  });
  const ry = gsap.quickTo(element, 'rotationY', {
    duration: 0.5,
    ease: 'power3',
  });
  const onMove = (event: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    ry(px * max * 2);
    rx(-py * max * 2);
    element.style.setProperty('--mx', `${(px + 0.5) * 100}%`);
    element.style.setProperty('--my', `${(py + 0.5) * 100}%`);
  };
  const onLeave = () => {
    rx(0);
    ry(0);
  };
  element.addEventListener('mousemove', onMove);
  element.addEventListener('mouseleave', onLeave);
  cleanups.push(() => {
    element.removeEventListener('mousemove', onMove);
    element.removeEventListener('mouseleave', onLeave);
  });
}

export function initMotion() {
  if (inited) return;
  inited = true;
  mm = gsap.matchMedia();

  // Warm, in-session navigation: the splash already played, so entrances that
  // would replay the "loading" sequence on every page switch are skipped.
  const warm = document.documentElement.classList.contains('nav-warm');

  // `gsap.matchMedia` reverts every tween/ScrollTrigger it created when a query
  // stops matching, so enabling reduced motion at runtime tears the whole system
  // down; custom listeners are cleaned up via the returned function.
  mm.add(
    {
      reduce: '(prefers-reduced-motion: reduce)',
      desktop: '(min-width: 768px)',
      // Everything that shows the mobile/tablet menu (≤1050) gets the straight
      // pillar reveal; only the full desktop grid uses the diagonal intro.
      compact: '(max-width: 1050px)',
    },
    (context) => {
      const { reduce, desktop, compact } = (
        context as unknown as {
          conditions: {
            reduce: boolean;
            desktop: boolean;
            compact: boolean;
          };
        }
      ).conditions;
      if (reduce) return;

      const cleanups: Cleanup[] = [];

      // Recruitment hero: subtle copy entrance + pointer plate drift (same
      // contract as the About hero — the pinned zoom and particle burst were
      // dropped in the full-screen migration #9).
      const recruitHero =
        document.querySelector<HTMLElement>('.recruitment-hero');
      if (recruitHero) {
        const artwork = recruitHero.querySelector<HTMLElement>('.artwork');
        const content = recruitHero.querySelector<HTMLElement>('.hero-content');

        // Entrance, skipped on warm navigation so a Home <-> Recruitment switch
        // does not replay it. Held hidden until the splash lifts so the reveal
        // is actually seen instead of finishing behind the overlay.
        if (!warm && content) {
          const bits = content.querySelectorAll<HTMLElement>(
            'h1 span, p, .button',
          );
          gsap.set(bits, { autoAlpha: 0, y: 34 });
          const play = () =>
            gsap.to(bits, {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out',
              stagger: 0.09,
              clearProps: 'transform,opacity,visibility',
            });
          if (document.documentElement.classList.contains('splash-done'))
            play();
          else window.addEventListener('ds:splash-done', play, { once: true });
        }

        if (artwork && finePointer()) {
          // Overscan so the pointer travel never exposes a hard edge.
          gsap.set(artwork, { scale: 1.04 });
          const xTo = gsap.quickTo(artwork, 'xPercent', {
            duration: 0.6,
            ease: 'power3',
          });
          const yTo = gsap.quickTo(artwork, 'yPercent', {
            duration: 0.6,
            ease: 'power3',
          });
          const onMove = (event: MouseEvent) => {
            const rect = recruitHero.getBoundingClientRect();
            xTo(((event.clientX - rect.left) / rect.width - 0.5) * -3);
            yTo(((event.clientY - rect.top) / rect.height - 0.5) * -3);
          };
          recruitHero.addEventListener('mousemove', onMove);
          cleanups.push(() =>
            recruitHero.removeEventListener('mousemove', onMove),
          );
        }
      }

      // About Us hero: subtle copy entrance + pointer plate drift.
      const aboutHero = document.querySelector<HTMLElement>('.about-hero');
      if (aboutHero) {
        const artwork = aboutHero.querySelector<HTMLElement>('.artwork');
        const content = aboutHero.querySelector<HTMLElement>('.hero-content');

        if (!warm && content) {
          const bits = content.querySelectorAll<HTMLElement>('h1 span, p');
          gsap.set(bits, { autoAlpha: 0, y: 34 });
          const play = () =>
            gsap.to(bits, {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out',
              stagger: 0.09,
              clearProps: 'transform,opacity,visibility',
            });
          if (document.documentElement.classList.contains('splash-done'))
            play();
          else window.addEventListener('ds:splash-done', play, { once: true });
        }

        if (artwork && finePointer()) {
          gsap.set(artwork, { scale: 1.04 });
          const xTo = gsap.quickTo(artwork, 'xPercent', {
            duration: 0.6,
            ease: 'power3',
          });
          const yTo = gsap.quickTo(artwork, 'yPercent', {
            duration: 0.6,
            ease: 'power3',
          });
          const onMove = (event: MouseEvent) => {
            const rect = aboutHero.getBoundingClientRect();
            xTo(((event.clientX - rect.left) / rect.width - 0.5) * -3);
            yTo(((event.clientY - rect.top) / rect.height - 0.5) * -3);
          };
          aboutHero.addEventListener('mousemove', onMove);
          cleanups.push(() =>
            aboutHero.removeEventListener('mousemove', onMove),
          );
        }
      }

      // Scroll reveals per section.
      const philosophy = document.querySelector('.philosophy');
      reveal(philosophy, '.heading > *');
      reveal(philosophy, '.illustration');
      reveal(philosophy, '.principles > li', { y: 28, stagger: 0.1 });

      // Park the aura/pulse/spark loops while the section is off-screen.
      if (philosophy) {
        const idle = new IntersectionObserver(
          ([entry]) =>
            philosophy.classList.toggle('is-idle', !entry.isIntersecting),
          { rootMargin: '240px 0px' },
        );
        idle.observe(philosophy);
        cleanups.push(() => idle.disconnect());
      }

      const whatWeDo = document.querySelector<HTMLElement>('.what-we-do');
      if (whatWeDo) {
        if (compact) {
          // Phone and tablet: straight, non-rotated reveal.
          reveal(whatWeDo, '.section-heading > *');
          reveal(whatWeDo, '.pillar', { y: 44, stagger: 0.1 });
        } else {
          // Desktop only: "summon from the core" build-up that plays once.
          pillarIntro(whatWeDo);
        }
      }

      // Park the star drift while the section is off-screen: the compositor then
      // has nothing to animate for the rest of the page.
      if (whatWeDo) {
        const idle = new IntersectionObserver(
          ([entry]) =>
            whatWeDo.classList.toggle('is-idle', !entry.isIntersecting),
          { rootMargin: '240px 0px' },
        );
        idle.observe(whatWeDo);
        cleanups.push(() => idle.disconnect());
      }

      const domains = document.querySelector<HTMLElement>('.domains');
      if (domains) {
        reveal(domains, 'header > *');
        domainIntro(domains);
      }

      const projects = document.querySelector('.projects');
      reveal(projects, '.projects-inner > header > *');
      reveal(projects, '.project-stage', { y: 30 });
      reveal(projects, '.project-dots', { y: 16 });

      const recruitment = document.querySelector('.recruitment');
      reveal(recruitment, '.recruitment-panel > *', { y: 34 });

      // About Us — Our Team: the header, both group titles, the leader cards and
      // the HoDS carousel (chips row + active panel cards) settle in as the
      // section scrolls into view. The active panel's cards are the Data set at
      // init; other panels are only shown on click and start at natural opacity.
      const ourTeam = document.querySelector<HTMLElement>('.our-team');
      if (ourTeam) {
        reveal(ourTeam, '.team-header > *');
        reveal(ourTeam, '.team-group-title', { y: 28, stagger: 0.1 });
        reveal(ourTeam, '.team-cards--leader .team-card', {
          y: 44,
          stagger: 0.1,
        });
        reveal(ourTeam, '.hods-top', { y: 24 });
        reveal(ourTeam, '.hods-panel.is-active .team-card', {
          y: 44,
          stagger: 0.08,
        });
      }

      // Park the CTA glow sweep and the recruitment star skies while their
      // section is off-screen.
      for (const selector of [
        '.recruitment',
        '.cta',
        '.who-should-join',
        '.what-you-will-do',
        '.faq',
        '.available-roles',
        '.visi-misi',
      ]) {
        const section = document.querySelector(selector);
        if (!section) continue;
        const idle = new IntersectionObserver(
          ([entry]) =>
            section.classList.toggle('is-idle', !entry.isIntersecting),
          { rootMargin: '240px 0px' },
        );
        idle.observe(section);
        cleanups.push(() => idle.disconnect());
      }

      const footer = document.querySelector('.footer');
      reveal(footer, '.top > *', { y: 34 });
      reveal(footer, '.bottom');

      if (finePointer()) {
        // 3D tilt on the What We Do cards only. The HoDS domain cards opt out:
        // their 1298px glow is expensive to re-rasterise on every hover frame
        // and the `--mx/--my` the tilt wrote was never consumed there.
        document
          .querySelectorAll<HTMLElement>('.pillar')
          .forEach((card) => tilt(card, 5, cleanups));

        // Magnetic buttons.
        document.querySelectorAll<HTMLElement>('.button').forEach((button) => {
          const xTo = gsap.quickTo(button, 'x', {
            duration: 0.4,
            ease: 'power3',
          });
          const yTo = gsap.quickTo(button, 'y', {
            duration: 0.4,
            ease: 'power3',
          });
          const onMove = (event: MouseEvent) => {
            const rect = button.getBoundingClientRect();
            xTo((event.clientX - (rect.left + rect.width / 2)) * 0.25);
            yTo((event.clientY - (rect.top + rect.height / 2)) * 0.35);
          };
          const onLeave = () => {
            xTo(0);
            yTo(0);
          };
          button.addEventListener('mousemove', onMove);
          button.addEventListener('mouseleave', onLeave);
          cleanups.push(() => {
            button.removeEventListener('mousemove', onMove);
            button.removeEventListener('mouseleave', onLeave);
          });
        });
      }

      ScrollTrigger.refresh();

      return () => cleanups.forEach((fn) => fn());
    },
  );

  const root = document.documentElement;
  const armHero = () => {
    if (root.classList.contains('hero-ready')) return;
    root.classList.add('hero-ready');
    window.setTimeout(() => root.classList.remove('hero-ready'), 3200);
  };
  // Warm navigation: the hero is already assembled, so do not replay the
  // entrance blur/sweep/text reveal (that replayed on every Home <-> Recruitment
  // switch and read as a fresh page load).
  if (warm) return;
  if (document.readyState === 'complete') {
    armHero();
  } else {
    window.addEventListener('load', () => window.setTimeout(armHero, 150), {
      once: true,
    });
    window.setTimeout(armHero, 2500);
  }
}
