const BASE_LAYERS = Object.freeze([
  Object.freeze({ name: "back", fontSize: 12, spacing: 42, speed: [20, 34], trail: [8, 15], opacity: [.08, .16], glow: 2 }),
  Object.freeze({ name: "middle", fontSize: 16, spacing: 31, speed: [34, 58], trail: [7, 13], opacity: [.16, .3], glow: 5 }),
  Object.freeze({ name: "front", fontSize: 20, spacing: 92, speed: [54, 82], trail: [5, 10], opacity: [.24, .4], glow: 8 })
]);

const between = (random, [minimum, maximum]) => minimum + (maximum - minimum) * random();
const integerBetween = (random, range) => Math.round(between(random, range));

export function getMatrixSettings({ width, dpr, coarse, reduced }) {
  const mobile = width < 760 || coarse;
  const densityScale = reduced ? .52 : mobile ? .62 : 1;
  const glowScale = reduced ? .35 : mobile ? .58 : 1;
  return {
    dpr: Math.min(Math.max(dpr || 1, 1), mobile ? 1.5 : 2),
    densityScale,
    glowScale,
    mobile,
    reduced,
    layers: BASE_LAYERS.map((layer) => ({
      ...layer,
      spacing: layer.spacing / densityScale,
      glow: layer.glow * glowScale
    }))
  };
}

export function createMatrixColumns({ width, height, settings, random = Math.random }) {
  return settings.layers.flatMap((layer) => {
    const count = Math.max(1, Math.floor(width / layer.spacing));
    return Array.from({ length: count }, (_, index) => ({
      layer: layer.name,
      x: Math.min(width, (index + random() * .72) * layer.spacing),
      y: between(random, settings.reduced ? [0, height] : [-height * 1.35, height * .85]),
      speed: between(random, layer.speed),
      trailLength: integerBetween(random, layer.trail),
      opacity: between(random, layer.opacity),
      glow: layer.glow * between(random, [.72, 1.08]),
      fontSize: layer.fontSize * between(random, [.92, 1.08]),
      respawnDelay: settings.reduced ? 0 : between(random, [0, 2.2]),
      glyphOffset: Math.floor(random() * 97)
    }));
  });
}

export function getScrollBoost(deltaY) {
  const intensity = Math.min(Math.abs(deltaY) / 720, 1);
  return {
    speed: 1 + intensity * .22,
    brightness: 1 + intensity * .12
  };
}

export function approach(current, target, factor) {
  return current + (target - current) * factor;
}

export function getPointerInfluence(column, pointer, radius = 120) {
  if (!pointer.active) return 1;
  const distance = Math.hypot(column.x - pointer.x, column.y - pointer.y);
  return distance < radius ? 1 + (1 - distance / radius) * .2 : 1;
}

export function advanceColumn(column, {
  height, deltaSeconds, speedMultiplier, pointerMultiplier = 1, random = Math.random
}) {
  if (column.respawnDelay > 0) {
    return { ...column, respawnDelay: Math.max(0, column.respawnDelay - deltaSeconds) };
  }
  const next = {
    ...column,
    y: column.y + column.speed * deltaSeconds * speedMultiplier * pointerMultiplier
  };
  const tailHeight = column.trailLength * column.fontSize;
  if (next.y - tailHeight <= height + column.fontSize) return next;
  return {
    ...next,
    y: -tailHeight - random() * height * .5,
    respawnDelay: .15 + random() * 1.85,
    glyphOffset: Math.floor(random() * 97)
  };
}

const MATRIX_COLORS = Object.freeze(["#1E90FF", "#00BFFF", "#38BDF8", "#7DD3FC", "#BAE6FD"]);

export function drawMatrixFrame(ctx, state) {
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  state.columns.forEach((column, columnIndex) => {
    if (column.respawnDelay > 0) return;
    const pointerBoost = getPointerInfluence(column, state.pointer);
    ctx.font = `600 ${column.fontSize}px ui-monospace, SFMono-Regular, Consolas, monospace`;
    ctx.shadowColor = "#1E90FF";
    ctx.shadowBlur = column.glow * pointerBoost;

    for (let trailIndex = 0; trailIndex < column.trailLength; trailIndex += 1) {
      const progress = trailIndex / Math.max(column.trailLength - 1, 1);
      const alpha = column.opacity * (1 - progress) * state.brightnessMultiplier * pointerBoost;
      const brightHead = trailIndex === 0 && columnIndex % 3 === 0;
      ctx.globalAlpha = Math.min(alpha * (brightHead ? 1.45 : 1), .82);
      ctx.fillStyle = brightHead ? "#E0F7FF" : MATRIX_COLORS[(columnIndex + trailIndex) % MATRIX_COLORS.length];
      ctx.fillText((column.glyphOffset + trailIndex + state.frameIndex) % 2 ? "1" : "0", column.x, column.y - trailIndex * column.fontSize);
    }
  });

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

export function initMatrixBackground(options = {}) {
  const win = options.win ?? globalThis.window;
  const doc = options.doc ?? globalThis.document;
  const canvas = options.canvas === undefined
    ? doc?.querySelector?.("#matrix-background")
    : options.canvas;
  const random = options.random ?? Math.random;
  const requestFrame = options.requestFrame ?? win?.requestAnimationFrame?.bind(win);
  const cancelFrame = options.cancelFrame ?? win?.cancelAnimationFrame?.bind(win);
  const ctx = canvas?.getContext?.("2d");
  if (!canvas || !ctx || !win || !doc || !requestFrame || !cancelFrame) return () => {};

  const reducedQuery = win.matchMedia("(prefers-reduced-motion: reduce)");
  const coarseQuery = win.matchMedia("(pointer: coarse)");
  let settings;
  let columns = [];
  let frameId = 0;
  let resizePending = false;
  let disposed = false;
  let lastTime = 0;
  let lastScrollY = win.scrollY;
  let targetSpeed = 1;
  let currentSpeed = 1;
  let targetBrightness = 1;
  let currentBrightness = 1;
  let frameIndex = 0;
  let pointerListenerActive = false;
  const pointer = { active: false, x: 0, y: 0 };

  const rebuild = () => {
    settings = getMatrixSettings({
      width: win.innerWidth,
      dpr: win.devicePixelRatio,
      coarse: coarseQuery.matches,
      reduced: reducedQuery.matches
    });
    canvas.width = Math.round(win.innerWidth * settings.dpr);
    canvas.height = Math.round(win.innerHeight * settings.dpr);
    canvas.style.width = `${win.innerWidth}px`;
    canvas.style.height = `${win.innerHeight}px`;
    ctx.setTransform(settings.dpr, 0, 0, settings.dpr, 0, 0);
    columns = createMatrixColumns({ width: win.innerWidth, height: win.innerHeight, settings, random });
  };

  const render = () => drawMatrixFrame(ctx, {
    width: win.innerWidth,
    height: win.innerHeight,
    dpr: settings.dpr,
    columns,
    frameIndex,
    brightnessMultiplier: currentBrightness,
    pointer
  });

  const tick = (time) => {
    frameId = 0;
    if (disposed || doc.hidden) return;
    if (resizePending) {
      resizePending = false;
      rebuild();
      syncPointerListener();
      if (reducedQuery.matches) render();
    }
    if (reducedQuery.matches) return;
    const deltaSeconds = Math.min(lastTime ? (time - lastTime) / 1000 : 0, .05);
    lastTime = time;
    currentSpeed = approach(currentSpeed, targetSpeed, .05);
    currentBrightness = approach(currentBrightness, targetBrightness, .05);
    targetSpeed = approach(targetSpeed, 1, .035);
    targetBrightness = approach(targetBrightness, 1, .045);
    columns = columns.map((column) => advanceColumn(column, {
      height: win.innerHeight,
      deltaSeconds,
      speedMultiplier: currentSpeed,
      pointerMultiplier: getPointerInfluence(column, pointer),
      random
    }));
    frameIndex += 1;
    render();
    frameId = requestFrame(tick);
  };

  const start = () => {
    if (disposed || doc.hidden || frameId || (reducedQuery.matches && !resizePending)) return;
    lastTime = 0;
    frameId = requestFrame(tick);
  };

  const stop = () => {
    if (frameId) cancelFrame(frameId);
    frameId = 0;
  };

  const onPointerMove = (event) => {
    if (coarseQuery.matches || reducedQuery.matches) return;
    pointer.active = true;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  };
  const syncPointerListener = () => {
    const shouldListen = win.innerWidth >= 760 && !coarseQuery.matches && !reducedQuery.matches;
    if (shouldListen && !pointerListenerActive) {
      win.addEventListener("pointermove", onPointerMove, { passive: true });
      pointerListenerActive = true;
    } else if (!shouldListen && pointerListenerActive) {
      win.removeEventListener("pointermove", onPointerMove);
      pointerListenerActive = false;
      pointer.active = false;
    }
  };
  const onScroll = () => {
    const deltaY = win.scrollY - lastScrollY;
    lastScrollY = win.scrollY;
    if (reducedQuery.matches) return;
    const boost = getScrollBoost(deltaY);
    targetSpeed = Math.max(targetSpeed, boost.speed);
    targetBrightness = Math.max(targetBrightness, boost.brightness);
  };
  const onResize = () => {
    resizePending = true;
    start();
  };
  const onVisibilityChange = () => doc.hidden ? stop() : start();
  const onPreferenceChange = () => {
    stop();
    syncPointerListener();
    resizePending = true;
    if (doc.hidden) return;
    rebuild();
    resizePending = false;
    render();
    start();
  };

  rebuild();
  render();
  if (!reducedQuery.matches) start();
  win.addEventListener("resize", onResize, { passive: true });
  win.addEventListener("scroll", onScroll, { passive: true });
  doc.addEventListener("visibilitychange", onVisibilityChange);
  syncPointerListener();
  reducedQuery.addEventListener("change", onPreferenceChange);
  coarseQuery.addEventListener("change", onPreferenceChange);

  return () => {
    disposed = true;
    stop();
    win.removeEventListener("resize", onResize);
    win.removeEventListener("scroll", onScroll);
    if (pointerListenerActive) win.removeEventListener("pointermove", onPointerMove);
    doc.removeEventListener("visibilitychange", onVisibilityChange);
    reducedQuery.removeEventListener("change", onPreferenceChange);
    coarseQuery.removeEventListener("change", onPreferenceChange);
  };
}
