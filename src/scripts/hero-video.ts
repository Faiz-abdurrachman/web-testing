export function mountHeroVideo(video: HTMLVideoElement): () => void {
  const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
  const wide = window.matchMedia('(min-width: 601px)');
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  const constrained =
    connection?.saveData === true ||
    connection?.effectiveType === 'slow-2g' ||
    connection?.effectiveType === '2g';
  const section = video.closest('section');
  const controller = new AbortController();
  let observer: IntersectionObserver | undefined;
  let visible = true;
  let loaded = false;
  let idleId: number | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const allowed = () => motion.matches && wide.matches && !constrained;
  const syncPlayback = () => {
    if (allowed() && visible && !document.hidden && video.readyState >= 2) {
      video.classList.add('is-ready');
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  };
  const load = () => {
    if (loaded || !allowed() || controller.signal.aborted) return;
    loaded = true;
    video.poster = video.dataset.poster || '';
    video.preload = 'auto';
    video.load();
  };
  const scheduleLoad = () => {
    if (!allowed()) {
      syncPlayback();
      return;
    }
    if (loaded) {
      syncPlayback();
      return;
    }
    if (
      document.documentElement.classList.contains('splash-armed') ||
      document.documentElement.classList.contains('nav-warm')
    ) {
      load();
    } else if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(load, { timeout: 2000 });
    } else {
      timeoutId = globalThis.setTimeout(load, 300);
    }
  };

  video.addEventListener('loadeddata', syncPlayback, {
    signal: controller.signal,
  });
  motion.addEventListener('change', scheduleLoad, {
    signal: controller.signal,
  });
  wide.addEventListener('change', scheduleLoad, { signal: controller.signal });
  document.addEventListener('visibilitychange', syncPlayback, {
    signal: controller.signal,
  });
  if (section) {
    observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncPlayback();
      },
      { rootMargin: '160px' },
    );
    observer.observe(section);
  }
  scheduleLoad();

  return () => {
    controller.abort();
    observer?.disconnect();
    if (idleId !== undefined && 'cancelIdleCallback' in window)
      window.cancelIdleCallback(idleId);
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    video.pause();
  };
}
