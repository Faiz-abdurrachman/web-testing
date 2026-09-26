// Three.js particle field shared by the home hero and the recruitment hero.
// Dynamically imported so it stays out of the initial bundle; the caller passes
// the canvas plus the host whose box the renderer fills (the hero section). The
// scroll sequence in `motion.ts` drives `window.__heroParticles.burst` so the
// field reacts as the hero zooms in.
//
// Two presets keep the heroes from looking identical while sharing one import:
//
// - `motes` (home): the original field. Slow-drifting specks across the whole
//   plate that rush toward the camera on the pinned zoom — the "sorcery" read.
// - `embers` (recruitment): fewer, larger, warmer sparks that rise from the
//   horizon and sway, fading in/out at the edges. A quieter "rise / next
//   chapter" read that does not compete with the planet's own stars or the CTA.
//
// It only runs at the same `min-width: 768px` breakpoint as those pinned
// sequences — on phones the continuous WebGL render competed with scrolling and
// caused jank, so mobile keeps the static art instead. Under reduced motion
// nothing mounts, keeping `verify.mjs` pixel-exact.
export type ParticlePreset = 'motes' | 'embers';

const PRESETS = {
  motes: {
    count: 700,
    size: 0.14,
    opacity: 0.85,
    spread: [20, 11, 8],
    speed: [0.002, 0.01],
    palette: [0x9b7bff, 0xd9c7ff, 0xffffff, 0x6c3bff],
    sway: 0,
    fadeTop: false,
    rotationDrift: 0.12,
    pointerRotation: [0.25, 0.18],
    burstSpeed: 7,
    burstSize: 0.16,
    burstOpacity: -0.15,
    burstCamera: 4.5,
    burstRotation: 1.1,
  },
  embers: {
    count: 220,
    size: 0.24,
    opacity: 0.5,
    spread: [18, 11, 6],
    speed: [0.004, 0.013],
    palette: [0xffffff, 0xe8dcff, 0xcdb8ff, 0x9b7bff],
    sway: 0.16,
    fadeTop: true,
    rotationDrift: 0.05,
    pointerRotation: [0.08, 0.05],
    burstSpeed: 1.8,
    burstSize: 0,
    burstOpacity: 0,
    burstCamera: 0,
    burstRotation: 0.15,
  },
} as const;

export async function mountHeroParticles(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  preload?: Promise<unknown>[],
  options: { preset?: ParticlePreset } = {},
): Promise<void> {
  const config = PRESETS[options.preset ?? 'motes'];
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

  const count = config.count;
  const halfY = config.spread[1] / 2;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const baseX = new Float32Array(count);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);
  const palette = config.palette.map((hex) => new THREE.Color(hex));
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * config.spread[0];
    positions[i * 3] = x;
    positions[i * 3 + 1] = (Math.random() - 0.5) * config.spread[1];
    positions[i * 3 + 2] = (Math.random() - 0.5) * config.spread[2];
    baseX[i] = x;
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] =
      config.speed[0] + Math.random() * (config.speed[1] - config.speed[0]);
    const color = palette[i % palette.length];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const baseColors = config.fadeTop ? colors.slice() : null;

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
    size: config.size,
    map: sprite,
    vertexColors: true,
    transparent: true,
    opacity: config.opacity,
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
    const boost = 1 + state.burst * config.burstSpeed;
    const attr = geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const y = attr.getY(i) + speeds[i] * boost;
      attr.setY(i, y > halfY ? -halfY : y);
      if (config.sway > 0)
        attr.setX(i, baseX[i] + Math.sin(t * 0.6 + phases[i]) * config.sway);
    }
    attr.needsUpdate = true;

    // Fade embers in near the floor and out near the ceiling so they neither
    // pop into existence nor pile up behind the headline.
    if (baseColors) {
      const colorAttr = geometry.attributes.color;
      for (let i = 0; i < count; i++) {
        const y = attr.getY(i);
        const fade = Math.max(
          0,
          Math.min(1, Math.min((halfY - y) / 1.6, (y + halfY) / 1.6)),
        );
        colorAttr.setXYZ(
          i,
          baseColors[i * 3] * fade,
          baseColors[i * 3 + 1] * fade,
          baseColors[i * 3 + 2] * fade,
        );
      }
      colorAttr.needsUpdate = true;
    }

    points.rotation.y =
      Math.sin(t * 0.1) * config.rotationDrift +
      pointerX * config.pointerRotation[0] +
      state.burst * config.burstRotation;
    points.rotation.x = pointerY * config.pointerRotation[1];
    material.size = config.size + state.burst * config.burstSize;
    material.opacity = config.opacity + state.burst * config.burstOpacity;
    camera.position.z = 9 - state.burst * config.burstCamera;
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
