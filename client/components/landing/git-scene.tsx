"use client";

import { useEffect, useRef } from "react";

export function GitScene({ spinRequest }: { spinRequest: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let frame = 0;
    let cancelled = false;
    let cleanupScene = () => {};
    let scene: import("three").Scene | undefined;
    let renderer: import("three").WebGLRenderer | undefined;
    let camera: import("three").PerspectiveCamera | undefined;
    let group: import("three").Group | undefined;
    let pointerX = 0;
    let pointerY = 0;

    const start = async () => {
      const THREE = await import("three");
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        32,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        100
      );
      camera.position.set(0, 0.3, 8.8);
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      group = new THREE.Group();
      scene.add(group);
      group.rotation.z = -0.18;

      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.34, 2),
        new THREE.MeshBasicMaterial({
          color: 0xeffff7,
          wireframe: true,
          transparent: true,
          opacity: 0.82,
        })
      );
      group.add(core);

      const inner = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.07, 1),
        new THREE.MeshBasicMaterial({
          color: 0x39e58c,
          transparent: true,
          opacity: 0.12,
          wireframe: true,
        })
      );
      group.add(inner);

      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0x7cf7b4,
        transparent: true,
        opacity: 0.42,
        wireframe: true,
      });
      [1.75, 2.14, 2.52].forEach((radius, index) => {
        const orbit = new THREE.Mesh(
          new THREE.TorusGeometry(radius, 0.008, 6, 80),
          orbitMaterial
        );
        orbit.rotation.set(index * 0.73, index * 0.52, index * 0.4);
        group?.add(orbit);
      });

      const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xb6ffd4 });
      const nodePositions = [
        [-2.05, 0.18, 0.15],
        [1.98, 0.8, -0.2],
        [1.15, -1.93, 0.3],
        [-0.45, 2.04, -0.1],
        [-1.72, -1.38, 0.2],
        [2.1, -1.15, -0.1],
        [-2.2, 1.45, -0.2],
        [0.12, 2.35, 0.1],
      ];
      nodePositions.forEach(([x, y, z], index) => {
        const node = new THREE.Mesh(
          new THREE.SphereGeometry(index % 3 === 0 ? 0.1 : 0.06, 12, 12),
          nodeMaterial
        );
        node.position.set(x, y, z);
        group?.add(node);
      });

      const starGeometry = new THREE.BufferGeometry();
      const starPositions = new Float32Array(500 * 3);
      for (let index = 0; index < 500; index += 1) {
        starPositions[index * 3] = (Math.random() - 0.5) * 12;
        starPositions[index * 3 + 1] = (Math.random() - 0.5) * 8;
        starPositions[index * 3 + 2] = (Math.random() - 0.5) * 5 - 1;
      }
      starGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(starPositions, 3)
      );
      scene.add(
        new THREE.Points(
          starGeometry,
          new THREE.PointsMaterial({
            color: 0x7cf7b4,
            size: 0.018,
            transparent: true,
            opacity: 0.54,
          })
        )
      );

      const onPointerMove = (event: PointerEvent) => {
        pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
        pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
      };
      const onResize = () => {
        if (!camera || !renderer || !canvas) return;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      };
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("resize", onResize);

      const animate = () => {
        if (!group || !scene || !camera || !renderer) return;
        group.rotation.y += 0.0023;
        group.rotation.x += (pointerY * 0.1 - group.rotation.x) * 0.012;
        group.rotation.z += (-0.18 + pointerX * 0.06 - group.rotation.z) * 0.012;
        renderer.render(scene, camera);
        frame = requestAnimationFrame(animate);
      };
      animate();
      cleanupScene = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("resize", onResize);
        renderer?.dispose();
        starGeometry.dispose();
      };
    };

    void start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      cleanupScene();
    };
  }, [spinRequest]);

  return (
    <canvas
      ref={canvasRef}
      className="hero-canvas"
      aria-label="A rotating 3D constellation of connected code branches"
    />
  );
}
