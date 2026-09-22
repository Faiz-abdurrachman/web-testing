import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

type ModelName = 'hunyuan' | 'hi3dgen';

export async function initHeroLab(initialMode: 'hero' | 'compare' = 'hero') {
  const lab = document.querySelector<HTMLElement>('.lab')!;
  const host = document.querySelector<HTMLElement>('#scene')!;
  const status = document.querySelector<HTMLElement>('#status')!;
  const motionButton = document.querySelector<HTMLButtonElement>('#motion')!;
  const modelSelect = document.querySelector<HTMLSelectElement>('#model')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  const on = { signal: events.signal };
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.domElement.style.cssText =
    'width:100%;height:100%;display:block;touch-action:pan-y';
  renderer.domElement.setAttribute(
    'aria-label',
    '3D sorcerer preview; use the camera buttons in comparison mode',
  );
  host.append(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#080711');
  scene.fog = new THREE.FogExp2('#080711', 0.035);
  const world = new THREE.Group();
  scene.add(world);
  const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 100);
  const compareCamera = new THREE.OrthographicCamera(-4, 4, 4, -4, 0.1, 100);
  compareCamera.position.set(0, 2, 10);
  const controls = new OrbitControls(compareCamera, renderer.domElement);
  controls.target.set(0, 1.8, 0);
  controls.enablePan = false;
  controls.minZoom = 0.7;
  controls.maxZoom = 2.5;
  controls.enabled = false;
  controls.update();

  const neutral = new THREE.MeshStandardMaterial({
    color: '#a6a3ad',
    roughness: 0.75,
    metalness: 0.05,
  });
  const obsidian = new THREE.MeshStandardMaterial({
    color: '#554669',
    roughness: 0.42,
    metalness: 0.65,
  });
  const fill = new THREE.HemisphereLight('#c5ccff', '#201027', 2.0);
  const key = new THREE.DirectionalLight('#e3d9ff', 3.5);
  key.position.set(-3, 7, 5);
  const rim = new THREE.DirectionalLight('#9950ff', 5);
  rim.position.set(3, 4, -4);
  scene.add(fill, key, rim);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(130, 130),
    new THREE.MeshStandardMaterial({
      color: '#151020',
      metalness: 0.55,
      roughness: 0.48,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.04;
  world.add(floor);
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(1.65, 1.85, 0.2, 80),
    new THREE.MeshStandardMaterial({
      color: '#191024',
      roughness: 0.38,
      metalness: 0.65,
    }),
  );
  pedestal.position.set(1.8, 0, 0);
  world.add(pedestal);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: '#b78bff',
    toneMapped: false,
  });
  const portal = new THREE.Group();
  portal.position.set(1.8, 2.6, -1.5);
  portal.rotation.y = -0.2;
  world.add(portal);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.5, 0.024, 12, 180),
    glowMaterial,
  );
  portal.add(ring);
  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.65, 0.008, 8, 180),
    glowMaterial,
  );
  outerRing.rotation.z = 0.2;
  portal.add(outerRing);
  const energy = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 } },
    vertexShader:
      'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: `varying vec2 vUv; uniform float uTime;
      void main(){vec2 p=vUv*2.-1.;float r=length(p);float a=atan(p.y,p.x);
      float edge=exp(-abs(r-.80)*25.);float filament=pow(.5+.5*sin(a*13.+r*32.-uTime*.6),5.);
      float veil=(1.-smoothstep(.15,1.,r))*.065;
      float alpha=edge*(.28+.5*filament)+veil;
      gl_FragColor=vec4(vec3(.46,.16,1.)+edge*.24,alpha);}`,
  });
  portal.add(new THREE.Mesh(new THREE.PlaneGeometry(6.25, 6.25), energy));
  const portalLight = new THREE.PointLight('#9c59ff', 35, 15, 2);
  portalLight.position.set(1.8, 2, -0.8);
  world.add(portalLight);
  for (const radius of [1.35, 1.62]) {
    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.006, 6, 120),
      glowMaterial,
    );
    orbit.rotation.x = -Math.PI / 2;
    orbit.position.set(1.8, 0.11, 0);
    world.add(orbit);
  }
  // Seeded placement keeps screenshots and reduced-motion frames repeatable.
  let seed = 41;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const starsGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(650 * 3);
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = (random() - 0.5) * 38;
    positions[i + 1] = random() * 16;
    positions[i + 2] = -random() * 24 - 3;
  }
  starsGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3),
  );
  const stars = new THREE.Points(
    starsGeometry,
    new THREE.PointsMaterial({
      color: '#c4adff',
      size: 0.027,
      transparent: true,
      opacity: 0.7,
    }),
  );
  world.add(stars);
  const stones: THREE.Mesh[] = [];
  const stoneGeometry = new THREE.IcosahedronGeometry(1, 0);
  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: '#30273f',
    roughness: 0.65,
    metalness: 0.4,
  });
  for (let i = 0; i < 24; i++) {
    const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
    const angle = random() * Math.PI * 2;
    const radius = 3.2 + random() * 4;
    stone.position.set(
      1.8 + Math.cos(angle) * radius,
      0.3 + random() * 3.5,
      -2.5 + Math.sin(angle) * radius,
    );
    stone.scale.setScalar(0.06 + random() * 0.18);
    stone.rotation.set(random() * 3, random() * 3, random() * 3);
    stone.userData.y = stone.position.y;
    world.add(stone);
    stones.push(stone);
  }

  const models = new Map<ModelName, THREE.Group>();
  const pending = new Map<ModelName, Promise<THREE.Group>>();
  const loader = new GLTFLoader();
  let disposed = false;
  function load(name: ModelName) {
    if (pending.has(name)) return pending.get(name)!;
    const task = loader
      .loadAsync(`/models/hero/${name}.glb`)
      .then((gltf) => {
        const model = gltf.scene;
        model.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.computeVertexNormals();
            const old = Array.isArray(object.material)
              ? object.material
              : [object.material];
            old.forEach((material) => material.dispose());
            object.material = obsidian;
          }
        });
        const bounds = new THREE.Box3().setFromObject(model);
        const center = bounds.getCenter(new THREE.Vector3());
        const scale = 3.2 / bounds.getSize(new THREE.Vector3()).y;
        model.scale.setScalar(scale);
        model.position.set(
          -center.x * scale,
          -bounds.min.y * scale,
          -center.z * scale,
        );
        const group = new THREE.Group();
        group.visible = false;
        group.add(model);
        models.set(name, group);
        if (disposed) {
          model.traverse((o) => {
            if (o instanceof THREE.Mesh) o.geometry.dispose();
          });
          return group;
        }
        scene.add(group);
        return group;
      })
      .catch((error) => {
        pending.delete(name);
        throw error;
      });
    pending.set(name, task);
    return task;
  }
  let mode: 'hero' | 'compare' = 'hero';
  let selected: ModelName = 'hi3dgen';
  let paused = reduced.matches;
  let visible = true;
  let frame = 0;
  let time = 0;
  let last = 0;
  let revision = 0;
  const pointer = new THREE.Vector2();
  const cameraTarget = new THREE.Vector3();

  function render() {
    if (disposed) return;
    const w = host.clientWidth,
      h = host.clientHeight;
    if (mode === 'hero') {
      renderer.setScissorTest(false);
      renderer.setViewport(0, 0, w, h);
      renderer.render(scene, camera);
      return;
    }
    renderer.setScissorTest(true);
    const half = Math.floor(w / 2);
    (['hunyuan', 'hi3dgen'] as ModelName[]).forEach((name, i) => {
      models.forEach((group, key) => {
        group.visible = key === name;
      });
      const x = i === 0 ? 0 : half;
      const width = i === 0 ? half : w - half;
      renderer.setViewport(x, 0, width, h);
      renderer.setScissor(x, 0, width, h);
      renderer.render(scene, compareCamera);
    });
    renderer.setScissorTest(false);
  }
  function positionCamera() {
    const mobile = host.clientWidth < 700;
    const scroll = paused ? 0 : Math.min(window.scrollY / host.clientHeight, 1);
    camera.position.set(
      (mobile ? 1.8 : -0.8) + (paused ? 0 : pointer.x * 0.25),
      (mobile ? 3.3 : 2.4) + (paused ? 0 : pointer.y * 0.12) + scroll * 0.3,
      (mobile ? 15.6 : 10.8) - scroll * 1.1,
    );
    cameraTarget.set(mobile ? 1.8 : 0.1, mobile ? 3.0 : 1.9, 0);
    camera.lookAt(cameraTarget);
  }
  function tick(now: number) {
    frame = 0;
    if (disposed || paused || !visible || document.hidden || mode !== 'hero')
      return;
    time += Math.min((now - (last || now)) / 1000, 0.05);
    last = now;
    energy.uniforms.uTime.value = time;
    outerRing.rotation.z = time * 0.025;
    stars.rotation.y = time * 0.003;
    stones.forEach((stone, i) => {
      stone.position.y = stone.userData.y + Math.sin(time * 0.45 + i) * 0.08;
      stone.rotation.y += 0.001;
    });
    positionCamera();
    render();
    frame = requestAnimationFrame(tick);
  }
  function schedule() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    if (!paused && visible && !document.hidden && mode === 'hero' && !disposed)
      frame = requestAnimationFrame(tick);
  }
  function resize() {
    const w = host.clientWidth,
      h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const halfWidth = Math.max(1.55, (w / h) * 1.75);
    const halfHeight = (halfWidth * h) / (w / 2);
    compareCamera.left = -halfWidth;
    compareCamera.right = halfWidth;
    compareCamera.top = halfHeight;
    compareCamera.bottom = -halfHeight;
    compareCamera.updateProjectionMatrix();
    positionCamera();
    render();
  }
  function layoutModels() {
    models.forEach((group, name) => {
      group.visible = mode === 'compare' || name === selected;
      if (mode === 'hero') group.rotation.y = 0;
      group.position.set(
        mode === 'compare' ? 0 : 1.8,
        mode === 'hero' ? 0.1 : 0,
        0,
      );
      group.traverse((object) => {
        if (object instanceof THREE.Mesh)
          object.material = mode === 'compare' ? neutral : obsidian;
      });
    });
  }
  async function setMode(next: 'hero' | 'compare') {
    const request = ++revision;
    mode = next;
    lab.dataset.mode = mode;
    world.visible = mode === 'hero';
    scene.background = new THREE.Color(mode === 'hero' ? '#080711' : '#14131b');
    scene.fog = mode === 'hero' ? new THREE.FogExp2('#080711', 0.035) : null;
    rim.intensity = mode === 'hero' ? 5 : 1;
    rim.color.set(mode === 'hero' ? '#9950ff' : '#d9dfff');
    controls.enabled = mode === 'compare';
    renderer.domElement.style.touchAction =
      mode === 'compare' ? 'none' : 'pan-y';
    document.querySelector<HTMLElement>('.model-labels')!.hidden =
      mode !== 'compare';
    document.querySelector<HTMLElement>('.views')!.hidden = mode !== 'compare';
    document.querySelector<HTMLElement>('.model-select')!.hidden =
      mode === 'compare';
    motionButton.hidden = mode === 'compare';
    document
      .querySelectorAll<HTMLButtonElement>('.mode-switch button')
      .forEach((button) =>
        button.setAttribute(
          'aria-pressed',
          String(button.dataset.mode === mode),
        ),
      );
    status.textContent =
      mode === 'compare'
        ? 'Loading both original models…'
        : `Loading ${selected === 'hi3dgen' ? 'Hi3DGen' : 'Hunyuan'}…`;
    layoutModels();
    resize();
    schedule();
    try {
      await Promise.all(
        (mode === 'compare'
          ? (['hunyuan', 'hi3dgen'] as ModelName[])
          : [selected]
        ).map(load),
      );
      if (request !== revision || disposed) return;
      layoutModels();
      lab.classList.add('ready');
      status.textContent =
        mode === 'compare'
          ? 'Original geometry · equal height · shared neutral material and lighting'
          : 'Move your pointer to look around. Scroll to move closer.';
      render();
    } catch {
      if (request === revision)
        status.textContent =
          'Model could not load. Select World or Compare models to retry.';
    }
  }
  document
    .querySelectorAll<HTMLButtonElement>('.mode-switch button')
    .forEach((button) =>
      button.addEventListener(
        'click',
        () => void setMode(button.dataset.mode as 'hero' | 'compare'),
        on,
      ),
    );
  modelSelect.addEventListener(
    'change',
    () => {
      selected = modelSelect.value as ModelName;
      void setMode('hero');
    },
    on,
  );
  document
    .querySelectorAll<HTMLButtonElement>('[data-view]')
    .forEach((button) =>
      button.addEventListener(
        'click',
        () => {
          const view = button.dataset.view;
          // Rotate each model locally for side/back views, preserving side-by-side comparison.
          compareCamera.position.set(0, 1.8, 10);
          models.forEach(
            (group) =>
              (group.rotation.y =
                view === 'side' ? -Math.PI / 2 : view === 'back' ? Math.PI : 0),
          );
          compareCamera.zoom = 1;
          controls.update();
          resize();
        },
        on,
      ),
    );
  const syncMotion = () => {
    motionButton.disabled = reduced.matches;
    motionButton.textContent = reduced.matches
      ? 'Reduced motion'
      : paused
        ? 'Resume motion'
        : 'Pause motion';
    motionButton.setAttribute('aria-pressed', String(paused));
    positionCamera();
    render();
    schedule();
  };
  motionButton.addEventListener(
    'click',
    () => {
      paused = !paused;
      syncMotion();
    },
    on,
  );
  reduced.addEventListener(
    'change',
    () => {
      paused = reduced.matches;
      syncMotion();
    },
    on,
  );
  host.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse' || paused) return;
      const rect = host.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1),
      );
    },
    on,
  );
  host.addEventListener('pointerleave', () => pointer.set(0, 0), on);
  controls.addEventListener('change', render);
  document.addEventListener('visibilitychange', schedule, on);
  renderer.domElement.addEventListener(
    'webglcontextlost',
    (event) => {
      event.preventDefault();
      paused = true;
      schedule();
      status.textContent =
        'The graphics context was interrupted. Reload to restart the preview.';
      lab.classList.remove('ready');
    },
    on,
  );
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  });
  observer.observe(host);
  const sizes = new ResizeObserver(resize);
  sizes.observe(host);
  window.addEventListener(
    'pagehide',
    (event) => {
      if (event.persisted) {
        cancelAnimationFrame(frame);
        return;
      }
      disposed = true;
      cancelAnimationFrame(frame);
      events.abort();
      observer.disconnect();
      sizes.disconnect();
      controls.dispose();
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          geometries.add(object.geometry);
          (Array.isArray(object.material)
            ? object.material
            : [object.material]
          ).forEach((m) => materials.add(m));
        }
      });
      geometries.forEach((g) => g.dispose());
      materials.add(neutral);
      materials.add(obsidian);
      materials.forEach((m) => m.dispose());
      renderer.dispose();
    },
    on,
  );
  window.addEventListener('pageshow', schedule, on);
  resize();
  syncMotion();
  await setMode(initialMode);
}
