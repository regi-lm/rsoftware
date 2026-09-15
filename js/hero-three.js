function createBar(THREE, width, height, depth, color) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.72,
    roughness: 0.24,
    emissive: 0x061c28,
    emissiveIntensity: 0.55
  });
  return new THREE.Mesh(geometry, material);
}

export function initHeroThree() {
  const canvas = document.querySelector("[data-hero-canvas]");
  const THREE = window.THREE;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canvas || !THREE || reduced) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.2, 8);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 768 ? 1.35 : 1.8));

  const group = new THREE.Group();
  const color = 0x061016;
  const leftTop = createBar(THREE, 0.34, 2.4, 0.34, color);
  const leftBottom = createBar(THREE, 0.34, 2.4, 0.34, color);
  const rightTop = createBar(THREE, 0.34, 2.4, 0.34, color);
  const rightBottom = createBar(THREE, 0.34, 2.4, 0.34, color);
  const slash = createBar(THREE, 0.38, 3.8, 0.4, color);

  leftTop.position.set(-1.5, 0.72, 0);
  leftTop.rotation.z = 0.9;
  leftBottom.position.set(-1.5, -0.72, 0);
  leftBottom.rotation.z = -0.9;
  rightTop.position.set(1.5, 0.72, 0);
  rightTop.rotation.z = -0.9;
  rightBottom.position.set(1.5, -0.72, 0);
  rightBottom.rotation.z = 0.9;
  slash.rotation.z = -2.92;

  group.add(leftTop, leftBottom, slash, rightTop, rightBottom);
  scene.add(group);

  const blue = new THREE.PointLight(0x4cc9ff, 7, 18);
  blue.position.set(2.5, 2.2, 4);
  scene.add(blue, new THREE.AmbientLight(0x8ccfff, 1.2));

  let mx = 0;
  let my = 0;
  window.addEventListener("pointermove", (event) => {
    mx = (event.clientX / innerWidth - 0.5) * 0.55;
    my = (event.clientY / innerHeight - 0.5) * 0.4;
  }, { passive: true });

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);

  const clock = new THREE.Clock();
  const animate = () => {
    if (document.visibilityState === "visible") {
      const t = clock.getElapsedTime();
      group.rotation.y += ((mx + Math.sin(t * 0.45) * 0.14) - group.rotation.y) * 0.035;
      group.rotation.x += ((-my + Math.sin(t * 0.35) * 0.08) - group.rotation.x) * 0.035;
      group.position.y = Math.sin(t * 0.8) * 0.12;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
  };
  animate();
}
