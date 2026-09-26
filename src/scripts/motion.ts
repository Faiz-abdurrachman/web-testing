import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// On phones the address bar hides/shows as you scroll, firing a resize that would
// otherwise make ScrollTrigger re-measure every trigger mid-scroll and shift the
// page. Ignoring that delta keeps reveals (and anything scrubbed) stable.
ScrollTrigger.config({ ignoreMobileResize: true });

const finePointer = () => window.matchMedia('(pointer: fine)').matches;

type Cleanup = () => void;
type Particles = { burst: number };

const particles = () =>
  (window as unknown as { __heroParticles?: Particles }).__heroParticles;

let inited = false;

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

function animateFigure(
  figure: HTMLElement,
  hero: HTMLElement,
  cleanups: Cleanup[],
  fine: boolean,
  richIdle: boolean,
  settled: boolean,
) {
  // Rotation pivots at the feet so the sway reads as weight shift.
  gsap.set(figure, { transformOrigin: '60% 88%', transformPerspective: 800 });

  // The idle loop keeps the cutout alive, but three infinite transforms per
  // frame are wasteful on phones. Mobile gets a single subtle bob; desktop gets
  // the full bob + sway + breathing. Either way it is paused while the hero is
  // off-screen so the compositor has nothing to animate further down the page.
  const idles: gsap.core.Tween[] = [];
  let heroVisible = true;
  const resume = () =>
    idles.forEach((tween) => (heroVisible ? tween.play() : tween.pause()));
  const io = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    resume();
  });
  io.observe(hero);
  cleanups.push(() => io.disconnect());

  // Idle loop: slow bob + breathing + weight-shift sway, so the cutout is never
  // a still image. `y` (px, scroll) and `yPercent` compose in GSAP, and the sway
  // uses `rotation` while the pointer uses `rotationX/Y`.
  const startIdle = () => {
    idles.push(
      gsap.to(figure, {
        yPercent: 1.3,
        duration: 2.6,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      }),
    );
    if (richIdle) {
      idles.push(
        gsap.to(figure, {
          rotation: 0.9,
          duration: 3.4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        }),
        gsap.to(figure, {
          scale: 1.015,
          duration: 1.9,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        }),
      );
    }
    resume();
  };

  if (settled) {
    // Warm, in-session navigation: skip the rise-in and just keep the idle, so
    // the character does not replay its entrance on every tab switch.
    gsap.set(figure, { yPercent: 0, autoAlpha: 1 });
    startIdle();
  } else {
    // Entrance: the sorcerer rises into place just after the plate.
    gsap.fromTo(
      figure,
      { yPercent: 7, autoAlpha: 0 },
      {
        yPercent: 0,
        autoAlpha: 1,
        duration: 1.2,
        delay: 0.5,
        ease: 'power3.out',
        onComplete: startIdle,
      },
    );
  }
  cleanups.push(() => {
    idles.forEach((tween) => tween.kill());
    gsap.killTweensOf(figure);
  });

  if (!fine) return;
  const rx = gsap.quickTo(figure, 'rotationX', {
    duration: 0.7,
    ease: 'power3',
  });
  const ry = gsap.quickTo(figure, 'rotationY', {
    duration: 0.7,
    ease: 'power3',
  });
  const onMove = (event: MouseEvent) => {
    const rect = hero.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    ry(px * 5);
    rx(-py * 4);
  };
  const onLeave = () => {
    rx(0);
    ry(0);
  };
  hero.addEventListener('mousemove', onMove);
  hero.addEventListener('mouseleave', onLeave);
  cleanups.push(() => {
    hero.removeEventListener('mousemove', onMove);
    hero.removeEventListener('mouseleave', onLeave);
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
  });
  if (glows.length)
    tl.to(
      glows,
      { autoAlpha: 1, scale: 1, duration: 0.9, stagger: 0.09 },
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
  const mm = gsap.matchMedia();

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

      // Hero first so ScrollTrigger refreshes top-to-bottom: the pinned
      // sequence adds scroll distance, shifting every trigger below it.
      const hero = document.querySelector<HTMLElement>('.hero');
      if (hero) {
        const stack = hero.querySelector<HTMLElement>('.artwork-stack');
        const figure = hero.querySelector<HTMLElement>('.art-figure');
        const content = hero.querySelector<HTMLElement>('.hero-content');

        // The pointer parallax below slides this full-bleed layer, so give it a
        // little overscan: at scale 1 it is exactly the hero size, so any
        // translation exposed a hard gap at the screen edge. A 4% scale leaves
        // ~2% slack per edge, more than the ±1.5% travel. Set before the pinned
        // timeline so ScrollTrigger records 1.04 as the tween's start. Under
        // reduced motion nothing is scaled, so the hero still matches the
        // reference frame pixel-for-pixel.
        if (stack && finePointer()) gsap.set(stack, { scale: 1.04 });

        // At ≥601px the animated `.art-video` layer fades in over the static
        // stack, so the cutout's own idle/pointer work would only ever animate a
        // hidden layer. Skip it there; ≤600px (and the no-video fallback) keeps
        // the figure alive.
        const coveredByVideo =
          Boolean(hero.querySelector('.art-video')) &&
          window.matchMedia('(min-width: 601px)').matches;
        if (figure && !coveredByVideo)
          animateFigure(figure, hero, cleanups, finePointer(), desktop, warm);

        if (desktop && stack && content) {
          // Pinned scroll sequence: the plate zooms in, the sorcerer rises, the
          // copy lifts away, a light flares across, and the particle field
          // rushes toward the viewer.
          const burst = { value: 0 };
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: hero,
              start: 'top top',
              end: '+=110%',
              scrub: 1,
              pin: true,
              anticipatePin: 1,
            },
          });

          // Every tween spans the full `duration: 1` timeline so the motion
          // ends exactly when the pin releases. Without it GSAP's 0.5s default
          // finished the zoom halfway through and the still-pinned hero read as
          // "stuck" while the remaining scroll did nothing.
          tl.to(stack, { scale: 1.35, y: -110, ease: 'none', duration: 1 }, 0);
          if (figure) tl.to(figure, { y: 90, ease: 'none', duration: 1 }, 0);
          tl.to(
            content,
            { y: -200, autoAlpha: 0, scale: 0.94, ease: 'none', duration: 1 },
            0,
          );
          tl.to(
            burst,
            {
              value: 1,
              ease: 'none',
              duration: 1,
              onUpdate: () => {
                const particlesApi = particles();
                if (particlesApi) particlesApi.burst = burst.value;
              },
            },
            0,
          );

          // Reset the field when the visitor scrolls back above the hero.
          ScrollTrigger.create({
            trigger: hero,
            start: 'top top',
            end: '+=110%',
            onLeaveBack: () => {
              const particlesApi = particles();
              if (particlesApi) particlesApi.burst = 0;
            },
          });
        }
        // Phones (<768px) get no scroll-driven hero zoom: scaling the full-bleed
        // art as the hero left read as a grow/shrink glitch — the hero is
        // 100dvh, so the collapsing address bar kept re-measuring the trigger —
        // and it cost a transform on the largest layer every frame. Phones now
        // scroll the hero away untouched; the figure keeps only its idle bob.

        if (stack && finePointer()) {
          const xTo = gsap.quickTo(stack, 'xPercent', {
            duration: 0.6,
            ease: 'power3',
          });
          const yTo = gsap.quickTo(stack, 'yPercent', {
            duration: 0.6,
            ease: 'power3',
          });
          const onMove = (event: MouseEvent) => {
            const rect = hero.getBoundingClientRect();
            xTo(((event.clientX - rect.left) / rect.width - 0.5) * -3);
            yTo(((event.clientY - rect.top) / rect.height - 0.5) * -3);
          };
          hero.addEventListener('mousemove', onMove);
          cleanups.push(() => hero.removeEventListener('mousemove', onMove));
        }
      }

      // Recruitment hero: a quieter echo of the home hero. The copy settles in
      // once the splash hands over, the plate drifts with the pointer, then a
      // pinned scroll scrubs a zoom while the next section rises over it.
      // Phones/tablets (<768px) keep only the video plate — no pin, no zoom.
      const recruitHero =
        document.querySelector<HTMLElement>('.recruitment-hero');
      if (recruitHero) {
        const artwork = recruitHero.querySelector<HTMLElement>('.artwork');
        const content = recruitHero.querySelector<HTMLElement>('.hero-content');
        const button = recruitHero.querySelector<HTMLElement>('.button');

        // Entrance, skipped on warm navigation so a Home <-> Recruitment switch
        // does not replay it. Held hidden until the splash lifts so the reveal
        // is actually seen instead of finishing behind the overlay.
        if (!warm && content) {
          const bits = [
            ...content.querySelectorAll<HTMLElement>('h1 span, p'),
            ...(button ? [button] : []),
          ];
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
          // Overscan so the pointer travel never exposes a hard edge; the pinned
          // scrub tween below starts from this scale.
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

        if (desktop && artwork) {
          const lift = [content, button].filter((el): el is HTMLElement =>
            Boolean(el),
          );
          const burst = { value: 0 };
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: recruitHero,
              start: 'top top',
              end: '+=110%',
              scrub: 1,
              pin: true,
              anticipatePin: 1,
            },
          });
          tl.to(artwork, { scale: 1.35, ease: 'none', duration: 1 }, 0);
          if (lift.length)
            tl.to(
              lift,
              { y: -200, autoAlpha: 0, scale: 0.94, ease: 'none', duration: 1 },
              0,
            );
          // Nudge the ember field so the sparks rise a touch faster as the
          // plate zooms (the preset maps burst to speed only — no camera rush).
          tl.to(
            burst,
            {
              value: 1,
              ease: 'none',
              duration: 1,
              onUpdate: () => {
                const particlesApi = particles();
                if (particlesApi) particlesApi.burst = burst.value;
              },
            },
            0,
          );
          ScrollTrigger.create({
            trigger: recruitHero,
            start: 'top top',
            end: '+=110%',
            onLeaveBack: () => {
              const particlesApi = particles();
              if (particlesApi) particlesApi.burst = 0;
            },
          });
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

      // Park the CTA glow sweep and the recruitment star skies while their
      // section is off-screen.
      for (const selector of [
        '.recruitment',
        '.cta',
        '.who-should-join',
        '.what-you-will-do',
        '.faq',
        '.available-roles',
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
