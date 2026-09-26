// Three.js particle field shared by the home hero and the recruitment hero.
// Dynamically imported so it stays out of the initial bundle; the caller passes
// the canvas plus the host whose box the renderer fills (the hero section). The
// scroll sequence in `motion.ts` drives `window.__heroParticles.burst` so the
// field rushes toward the viewer as the hero zooms in.
//
// It only runs at the same `min-width: 768px` breakpoint as those pinned
// sequences — on phones the continuous WebGL render competed with scrolling and
// caused jank, so mobile keeps the static art instead. Under reduced motion
// nothing mounts, keeping `verify.mjs` pixel-exact.
export async function mountHeroParticles(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  preload?: Promise<unknown>[],
): Promise<void> {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const allowed = window.matchMedia('(min-width: 768px)').matches;
  if (reduce || !allowed) return;

  const threeImport = import('three');
  preload?.push(threeImport);
  const THREE = await threeImport;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 9;

  const count = 700;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  const palette = [
    new THREE.Color(0x9b7bff),
    new THREE.Color(0xd9c7ff),
    new THREE.Color(0xffffff),
    new THREE.Color(0x6c3bff),
  ];
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 11;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    speeds[i] = 0.002 + Math.random() * 0.008;
    const color = palette[i % palette.length];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // A soft radial sprite so points read as glowing motes, not squares.
  const sprite = (() => {
    const size = 64;
    const el = document.createElement('canvas');
    el.width = el.height = size;
    const ctx = el.getContext('2d');
    if (!ctx) return null;
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(206,186,255,0.65)');
    grad.addColorStop(1, 'rgba(120,80,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(el);
  })();

  const material = new THREE.PointsMaterial({
    size: 0.14,
    map: sprite,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  const state = { burst: 0 };
  (
    window as unknown as { __heroParticles?: { burst: number } }
  ).__heroParticles = state;

  const resize = () => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  let resizeRaf = 0;
  window.addEventListener(
    'resize',
    () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        resize();
      });
    },
    { passive: true },
  );

  let pointerX = 0;
  let pointerY = 0;
  window.addEventListener(
    'mousemove',
    (event) => {
      pointerX = event.clientX / window.innerWidth - 0.5;
      pointerY = event.clientY / window.innerHeight - 0.5;
    },
    { passive: true },
  );

  // Only step the particle loop while the hero is on-screen: the compositor
  // then has nothing to animate for the rest of the page.
  let running = false;
  const tick = () => {
    if (!running) return;
    const t = performance.now() / 1000;
    const boost = 1 + state.burst * 7;
    const attr = geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const y = attr.getY(i) + speeds[i] * boost;
      attr.setY(i, y > 5.5 ? -5.5 : y);
    }
    attr.needsUpdate = true;
    points.rotation.y =
      Math.sin(t * 0.1) * 0.12 + pointerX * 0.25 + state.burst * 1.1;
    points.rotation.x = pointerY * 0.18;
    material.size = 0.14 + state.burst * 0.16;
    material.opacity = 0.85 - state.burst * 0.15;
    camera.position.z = 9 - state.burst * 4.5;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  const start = () => {
    if (running) return;
    running = true;
    requestAnimationFrame(tick);
  };
  new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) start();
      else running = false;
    },
    { rootMargin: '120px' },
  ).observe(host);
  start();
}
