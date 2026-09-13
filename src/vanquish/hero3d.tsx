import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * 3D hero: an obsidian shard (the Vanquish "V" monolith) orbited by a
 * green wireframe halo and a particle field, slowly rotating and
 * reacting to pointer movement.
 */
export function Hero3D() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.2, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    // Obsidian shard — an elongated octahedron, like a cut gem
    const shardGeo = new THREE.OctahedronGeometry(1.5, 0);
    shardGeo.scale(0.72, 1.35, 0.72);
    const shard = new THREE.Mesh(
      shardGeo,
      new THREE.MeshStandardMaterial({
        color: 0x0c0f12,
        metalness: 0.92,
        roughness: 0.18,
        flatShading: true,
      }),
    );
    scene.add(shard);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(shardGeo),
      new THREE.LineBasicMaterial({ color: 0x00e07f, transparent: true, opacity: 0.55 }),
    );
    shard.add(edges);

    // Halo ring
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(2.5, 0.012, 12, 128),
      new THREE.MeshBasicMaterial({ color: 0x00e07f, transparent: true, opacity: 0.4 }),
    );
    halo.rotation.x = Math.PI / 2.4;
    scene.add(halo);

    const halo2 = halo.clone();
    halo2.scale.setScalar(1.22);
    (halo2.material as THREE.MeshBasicMaterial) = new THREE.MeshBasicMaterial({
      color: 0x9aa5ad,
      transparent: true,
      opacity: 0.12,
    });
    halo2.material = halo2.material;
    scene.add(halo2);

    // Particle field
    const count = 900;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({ color: 0x00e07f, size: 0.02, transparent: true, opacity: 0.5 }),
    );
    scene.add(particles);

    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    const key = new THREE.DirectionalLight(0x00e07f, 2.2);
    key.position.set(4, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x9aa5ad, 1.4);
    rim.position.set(-5, -2, -4);
    scene.add(rim);

    let mx = 0;
    let my = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      my = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove);

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let raf = 0;
    const clock = new THREE.Clock();
    const tick = () => {
      const t = clock.getElapsedTime();
      shard.rotation.y = t * 0.35 + mx * 0.4;
      shard.rotation.x = Math.sin(t * 0.3) * 0.1 + my * 0.25;
      shard.position.y = Math.sin(t * 0.8) * 0.12;
      halo.rotation.z = t * 0.12;
      halo2.rotation.z = -t * 0.08;
      particles.rotation.y = t * 0.04;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={ref} className="h-full w-full" aria-hidden />;
}
