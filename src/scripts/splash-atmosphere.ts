// Procedural atmosphere: generated noise, wisps and motes. No image textures.
export function animateSplash(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return () => {};
  canvas.width = 1008;
  canvas.height = 568;
  const fog = document.createElement('canvas');
  fog.width = 256;
  fog.height = 192;
  const fogCtx = fog.getContext('2d')!;
  const pixels = fogCtx.createImageData(256, 192);
  const hash = (x: number, y: number) => {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };
  const noise = (x: number, y: number) => {
    const ix = Math.floor(x),
      iy = Math.floor(y);
    let fx = x - ix,
      fy = y - iy;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    const a = hash(ix, iy),
      b = hash(ix + 1, iy);
    const c = hash(ix, iy + 1),
      d = hash(ix + 1, iy + 1);
    return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
  };
  for (let y = 0; y < 192; y++)
    for (let x = 0; x < 256; x++) {
      const nx = x / 256,
        ny = y / 192;
      const warp = noise(nx * 6, ny * 6) * 2;
      let density = 0;
      for (let octave = 0; octave < 5; octave++) {
        const frequency = 4 * 2 ** octave;
        density +=
          noise(nx * frequency + warp, ny * frequency + warp) /
          2 ** (octave + 1);
      }
      const edge = Math.max(0, 1 - Math.hypot((nx - 0.5) * 2, (ny - 0.5) * 2));
      const i = (y * 256 + x) * 4;
      pixels.data[i] = 142;
      pixels.data[i + 1] = 77;
      pixels.data[i + 2] = 211;
      pixels.data[i + 3] = Math.round(Math.max(0, density - 0.32) * edge * 150);
    }
  fogCtx.putImageData(pixels, 0, 0);
  let frame = 0,
    last = 0,
    stopped = false;
  const start = performance.now();
  function draw(now: number) {
    if (stopped || !canvas.isConnected) return;
    frame = requestAnimationFrame(draw);
    if (now - last < 32 || document.hidden) return;
    last = now;
    const t = (now - start) / 1000;
    const c = ctx!;
    c.clearRect(0, 0, 1008, 568);
    c.globalCompositeOperation = 'screen';
    // Banks of mist drift inward, leaving the title region unobscured.
    for (let j = 0; j < 12; j++) {
      const side = j % 2 ? 1 : -1;
      const x = 504 + side * (195 + (j % 3) * 93) + Math.sin(t * 0.19 + j) * 23;
      const y = 325 + Math.sin(j * 2.1 + t * 0.15) * 77;
      c.save();
      c.translate(x, y);
      c.rotate(side * (0.25 + Math.sin(t * 0.09 + j) * 0.16));
      c.globalAlpha = 0.8;
      c.drawImage(fog, -180, -130, 360, 260);
      c.restore();
    }
    // Fine curved strands of energy around the seal, each evolving independently.
    for (let j = 0; j < 16; j++) {
      c.beginPath();
      for (let k = 0; k <= 96; k++) {
        const angle = (k / 96) * Math.PI * 2;
        const r =
          166 +
          Math.sin(angle * 5 + t * 0.6 + j) * 8 +
          Math.sin(angle * 11 - t * 0.3 + j) * 3 +
          j * 0.55;
        const x = 504 + Math.cos(angle) * r;
        const y = 210 + Math.sin(angle) * r;
        if (!k) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.globalAlpha = 0.12;
      c.strokeStyle = j % 3 ? '#9b58ee' : '#dec3ff';
      c.lineWidth = j % 3 ? 1 : 0.5;
      c.stroke();
    }
    for (let i = 0; i < 68; i++) {
      const x =
        504 + Math.sin(i * 137.5) * (185 + i * 3) + Math.sin(t * 0.3 + i) * 4;
      const y = (((i * 73.7 - t * (3 + (i % 4))) % 500) + 500) % 500;
      c.globalAlpha = 0.15 + 0.3 * Math.pow(Math.sin(t * 0.7 + i), 2);
      c.fillStyle = i % 5 ? '#ba94ec' : '#f6dbac';
      c.beginPath();
      c.arc(x, y, i % 5 ? 0.65 : 1.1, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
  }
  const stop = () => {
    stopped = true;
    cancelAnimationFrame(frame);
    reduce.removeEventListener('change', stop);
    window.removeEventListener('ds:splash-done', stop);
  };
  window.addEventListener('ds:splash-done', stop, { once: true });
  reduce.addEventListener('change', stop, { once: true });
  frame = requestAnimationFrame(draw);
  return stop;
}
