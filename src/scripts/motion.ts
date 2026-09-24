import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const finePointer = () => window.matchMedia('(pointer: fine)').matches;

type Cleanup = () => void;
type Particles = { burst: number };

const particles = () =>
  (window as unknown as { __heroParticles?: Particles }).__heroParticles;

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
) {
  // Rotation pivots at the feet so the sway reads as weight shift.
  gsap.set(figure, { transformOrigin: '60% 88%', transformPerspective: 800 });

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
      onComplete: () => {
        // Idle loop: slow bob + breathing + weight-shift sway, so the cutout is
        // never a still image. `y` (px, scroll) and `yPercent` compose in GSAP,
        // and the sway uses `rotation` while the pointer uses `rotationX/Y`.
        gsap.to(figure, {
          yPercent: 1.3,
          duration: 2.6,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
        gsap.to(figure, {
          rotation: 0.9,
          duration: 3.4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
        gsap.to(figure, {
          scale: 1.015,
          duration: 1.9,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      },
    },
  );

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
  const mm = gsap.matchMedia();

  // `gsap.matchMedia` reverts every tween/ScrollTrigger it created when a query
  // stops matching, so enabling reduced motion at runtime tears the whole system
  // down; custom listeners are cleaned up via the returned function.
  mm.add(
    {
      reduce: '(prefers-reduced-motion: reduce)',
      desktop: '(min-width: 768px)',
    },
    (context) => {
      const { reduce, desktop } = (
        context as unknown as {
          conditions: { reduce: boolean; desktop: boolean };
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
        const flare = hero.querySelector<HTMLElement>('.hero-flare');

        if (figure) animateFigure(figure, hero, cleanups, finePointer());

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

          tl.to(stack, { scale: 1.35, y: -110, ease: 'none' }, 0);
          if (figure) tl.to(figure, { y: 90, ease: 'none' }, 0);
          tl.to(
            content,
            { y: -200, autoAlpha: 0, scale: 0.94, ease: 'none' },
            0,
          );
          if (flare) {
            tl.fromTo(
              flare,
              { xPercent: -160, autoAlpha: 0 },
              {
                xPercent: 520,
                autoAlpha: 1,
                skewX: -14,
                ease: 'none',
                duration: 0.55,
              },
              0.05,
            ).to(flare, { autoAlpha: 0, ease: 'none', duration: 0.2 }, 0.6);
          }
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
        } else if (stack && content) {
          const scrub = {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          } as const;
          gsap.to(stack, {
            y: -70,
            scale: 1.1,
            ease: 'none',
            scrollTrigger: scrub,
          });
          if (figure)
            gsap.to(figure, { y: 30, ease: 'none', scrollTrigger: scrub });
          gsap.to(content, {
            y: 90,
            autoAlpha: 0.15,
            ease: 'none',
            scrollTrigger: scrub,
          });
        }

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

      // Scroll reveals per section.
      const philosophy = document.querySelector('.philosophy');
      reveal(philosophy, '.heading > *');
      reveal(philosophy, '.illustration');
      reveal(philosophy, '.principles > li', { y: 28, stagger: 0.1 });

      const whatWeDo = document.querySelector('.what-we-do');
      reveal(whatWeDo, '.section-heading > *');
      reveal(whatWeDo, '.pillar', { y: 60, stagger: 0.12 });

      const domains = document.querySelector('.domains');
      reveal(domains, 'header > *');
      reveal(domains, '.domain-card', { y: 44, stagger: 0.07 });

      const projects = document.querySelector('.projects');
      reveal(projects, '.projects-inner > header > *');
      reveal(projects, '.project-stage', { y: 30 });
      reveal(projects, '.project-dots', { y: 16 });

      const recruitment = document.querySelector('.recruitment');
      reveal(recruitment, '.recruitment-panel > *', { y: 34 });

      const footer = document.querySelector('.footer');
      reveal(footer, '.top > *', { y: 34 });
      reveal(footer, '.bottom');

      if (finePointer()) {
        // 3D tilt on the HoDS and What We Do cards.
        document
          .querySelectorAll<HTMLElement>('.domain-card')
          .forEach((card) => tilt(card, 6, cleanups));
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

        // Cursor glow.
        const glow = document.createElement('div');
        glow.className = 'cursor-glow';
        glow.setAttribute('aria-hidden', 'true');
        document.body.appendChild(glow);
        const gx = gsap.quickTo(glow, 'x', { duration: 0.55, ease: 'power3' });
        const gy = gsap.quickTo(glow, 'y', { duration: 0.55, ease: 'power3' });
        const onMove = (event: MouseEvent) => {
          gx(event.clientX);
          gy(event.clientY);
        };
        window.addEventListener('mousemove', onMove);
        cleanups.push(() => {
          window.removeEventListener('mousemove', onMove);
          glow.remove();
        });
      }

      ScrollTrigger.refresh();

      return () => cleanups.forEach((fn) => fn());
    },
  );
}
