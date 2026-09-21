import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(pointer: fine)').matches;

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
    y: 46,
    duration: 0.75,
    ease: 'power2.out',
    stagger: 0.08,
    scrollTrigger: { trigger: scope, start: 'top 85%', once: true },
    ...vars,
  });
}

function tilt(element: HTMLElement, max: number) {
  gsap.set(element, { transformPerspective: 900 });
  const rx = gsap.quickTo(element, 'rotationX', {
    duration: 0.5,
    ease: 'power3',
  });
  const ry = gsap.quickTo(element, 'rotationY', {
    duration: 0.5,
    ease: 'power3',
  });
  element.addEventListener('mousemove', (event) => {
    const rect = element.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    ry(px * max * 2);
    rx(-py * max * 2);
    element.style.setProperty('--mx', `${(px + 0.5) * 100}%`);
    element.style.setProperty('--my', `${(py + 0.5) * 100}%`);
  });
  element.addEventListener('mouseleave', () => {
    rx(0);
    ry(0);
  });
}

export function initMotion() {
  if (reduceMotion()) {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    return;
  }

  // Hero entrance
  gsap.from('.hero-content > *', {
    autoAlpha: 0,
    y: 42,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.14,
    delay: 0.1,
  });
  gsap.from('.navbar', {
    autoAlpha: 0,
    y: -24,
    duration: 0.7,
    ease: 'power2.out',
  });

  // Scroll reveals per section
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

  // Hero parallax (scroll + pointer)
  const hero = document.querySelector<HTMLElement>('.hero');
  if (hero) {
    gsap.to('.hero .artwork', {
      y: -70,
      scale: 1.1,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
    gsap.to('.hero-content', {
      y: 90,
      autoAlpha: 0.15,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
    const art = hero.querySelector<HTMLElement>('.artwork img');
    if (art && finePointer()) {
      const xTo = gsap.quickTo(art, 'xPercent', {
        duration: 0.6,
        ease: 'power3',
      });
      const yTo = gsap.quickTo(art, 'yPercent', {
        duration: 0.6,
        ease: 'power3',
      });
      hero.addEventListener('mousemove', (event) => {
        const rect = hero.getBoundingClientRect();
        xTo(((event.clientX - rect.left) / rect.width - 0.5) * -3);
        yTo(((event.clientY - rect.top) / rect.height - 0.5) * -3);
      });
    }
  }

  if (finePointer()) {
    // 3D tilt on the HoDS and What We Do cards
    document
      .querySelectorAll<HTMLElement>('.domain-card')
      .forEach((card) => tilt(card, 6));
    document
      .querySelectorAll<HTMLElement>('.pillar')
      .forEach((card) => tilt(card, 5));

    // Magnetic buttons
    document.querySelectorAll<HTMLElement>('.button').forEach((button) => {
      const xTo = gsap.quickTo(button, 'x', { duration: 0.4, ease: 'power3' });
      const yTo = gsap.quickTo(button, 'y', { duration: 0.4, ease: 'power3' });
      button.addEventListener('mousemove', (event) => {
        const rect = button.getBoundingClientRect();
        xTo((event.clientX - (rect.left + rect.width / 2)) * 0.25);
        yTo((event.clientY - (rect.top + rect.height / 2)) * 0.35);
      });
      button.addEventListener('mouseleave', () => {
        xTo(0);
        yTo(0);
      });
    });

    // Cursor glow
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);
    const gx = gsap.quickTo(glow, 'x', { duration: 0.55, ease: 'power3' });
    const gy = gsap.quickTo(glow, 'y', { duration: 0.55, ease: 'power3' });
    window.addEventListener('mousemove', (event) => {
      gx(event.clientX);
      gy(event.clientY);
    });
  }

  ScrollTrigger.refresh();
}
