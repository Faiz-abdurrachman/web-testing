const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// Let the entrance keyframes finish before the scroll parallax takes over, so
// the artwork never animates its transform while it is also blurring in.
const PARALLAX_DELAY = 1200;

export function initHeroMotion() {
  const hero = document.querySelector<HTMLElement>('[data-hero-motion]');
  if (!hero) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return;

  const root: HTMLElement = hero;
  const artworkBg = root.querySelector<HTMLElement>('.art-bg');
  const artworkFigure = root.querySelector<HTMLElement>('.art-figure');
  const content = root.querySelector<HTMLElement>('.hero-content');
  if (!artworkBg && !artworkFigure && !content) return;

  root.classList.add('is-motion');

  let scrollY = window.scrollY;
  const onScroll = () => {
    scrollY = window.scrollY;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  let heroHeight = root.clientHeight;
  window.addEventListener(
    'resize',
    () => {
      heroHeight = root.clientHeight;
    },
    { passive: true },
  );

  let visible = true;
  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    },
    { threshold: 0 },
  ).observe(root);

  let frame = 0;
  let running = false;
  let last = 0;
  let time = 0;
  let smoothScroll = scrollY;
  let appliedProgress = -1;

  function tick(now: number) {
    frame = 0;
    if (!running || document.hidden || !visible || reduce.matches) {
      running = false;
      return;
    }
    const delta = Math.min((now - (last || now)) / 1000, 0.05);
    last = now;
    time += delta;

    smoothScroll += (scrollY - smoothScroll) * Math.min(1, delta * 6);
    const progress = clamp(smoothScroll / Math.max(1, heroHeight), 0, 1);
    if (Math.abs(progress - appliedProgress) > 0.0006) {
      appliedProgress = progress;
      // Far plate drifts the most; the sorcerer cutout drifts less so it reads
      // as a nearer layer against the horizon.
      if (time * 1000 > PARALLAX_DELAY) {
        if (artworkBg)
          artworkBg.style.transform = `translate3d(0, ${progress * 46}px, 0)`;
        if (artworkFigure)
          artworkFigure.style.transform = `translate3d(0, ${progress * 28}px, 0)`;
      }
      if (content)
        content.style.transform = `translate3d(0, ${-progress * 24}px, 0)`;
    }

    frame = requestAnimationFrame(tick);
  }

  function start() {
    if (running || reduce.matches) return;
    running = true;
    last = 0;
    frame = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(frame);
    frame = 0;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  reduce.addEventListener('change', (event) => {
    if (!event.matches) return;
    stop();
    root.classList.remove('is-motion');
    if (artworkBg) artworkBg.style.transform = '';
    if (artworkFigure) artworkFigure.style.transform = '';
    if (content) {
      content.style.transform = '';
      content.style.opacity = '';
    }
  });

  start();
}
