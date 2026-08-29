"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, GitBranch, Menu, MousePointer2, Play, Sparkles, X } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";

function GitScene({ spinRequest }: { spinRequest: number }) {
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
      camera = new THREE.PerspectiveCamera(32, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
      camera.position.set(0, 0.3, 8.8);
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      group = new THREE.Group();
      scene.add(group);
      group.rotation.z = -0.18;

      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.34, 2),
        new THREE.MeshBasicMaterial({ color: 0xeffff7, wireframe: true, transparent: true, opacity: 0.82 }),
      );
      group.add(core);

      const inner = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.07, 1),
        new THREE.MeshBasicMaterial({ color: 0x39e58c, transparent: true, opacity: 0.12, wireframe: true }),
      );
      group.add(inner);

      const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x7cf7b4, transparent: true, opacity: 0.42, wireframe: true });
      [1.75, 2.14, 2.52].forEach((radius, index) => {
        const orbit = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.008, 6, 80), orbitMaterial);
        orbit.rotation.set(index * 0.73, index * 0.52, index * 0.4);
        group?.add(orbit);
      });

      const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xb6ffd4 });
      const nodePositions = [
        [-2.05, 0.18, 0.15], [1.98, 0.8, -0.2], [1.15, -1.93, 0.3], [-0.45, 2.04, -0.1],
        [-1.72, -1.38, 0.2], [2.1, -1.15, -0.1], [-2.2, 1.45, -0.2], [0.12, 2.35, 0.1],
      ];
      nodePositions.forEach(([x, y, z], index) => {
        const node = new THREE.Mesh(new THREE.SphereGeometry(index % 3 === 0 ? 0.1 : 0.06, 12, 12), nodeMaterial);
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
      starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
      scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0x7cf7b4, size: 0.018, transparent: true, opacity: 0.54 })));

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

  return <canvas ref={canvasRef} className="hero-canvas" aria-label="A rotating 3D constellation of connected code branches" />;
}

export default function Home() {
  const [spinRequest, setSpinRequest] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="landing-shell">
      <div className="grain" />
      <nav className="topbar">
        <a className="brand" href="#top" aria-label="GitChat home"><span className="brand-mark"><GitBranch size={17} /></span>gitchat<span className="brand-dot">.</span></a>
        <div className={`nav-links ${menuOpen ? "is-open" : ""}`}>
          <a href="#signal" onClick={() => setMenuOpen(false)}>The signal</a>
          <a href="#protocol" onClick={() => setMenuOpen(false)}>Protocol</a>
          <a href="#access" onClick={() => setMenuOpen(false)}>Early access</a>
        </div>
        <div className="nav-actions"><ModeToggle /><a className="nav-login" href="/login">Sign in <ArrowUpRight size={14} /></a><button className="menu-button" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button></div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span className="status-pulse" /> intelligence for the open source era</div>
          <h1>Read the code.<br /><em>Feel the signal.</em></h1>
          <p className="hero-lede">GitChat turns the noise of your repositories into a living map of context, momentum, and what to build next.</p>
          <div className="hero-actions"><a className="primary-button" href="#access">Enter the constellation <ArrowUpRight size={16} /></a><button className="ghost-button" onClick={() => setSpinRequest((value) => value + 1)}><span className="play-icon"><Play size={11} fill="currentColor" /></span> spin the model</button></div>
          <div className="proof-row"><div className="avatars"><span>AL</span><span>MK</span><span>JR</span><span>+</span></div><span>Trusted by 4,000+ builders<br /><strong>shipping in public</strong></span></div>
        </div>
        <div className="scene-wrap"><GitScene spinRequest={spinRequest} /><div className="scene-label scene-label-top"><span>01</span> live repository graph</div><div className="scene-label scene-label-bottom"><span className="tiny-dot" /> 8,421 nodes active</div><div className="scene-crosshair crosshair-one" /><div className="scene-crosshair crosshair-two" /></div>
      </section>

      <section className="signal-strip" id="signal"><div><span className="strip-index">01 /</span><strong>Context, connected.</strong><span>Every issue, commit, and conversation in one field of view.</span></div><div className="strip-arrow"><MousePointer2 size={15} /> move through the signal <ArrowUpRight size={15} /></div></section>
      <section className="protocol" id="protocol"><div className="protocol-head"><span className="eyebrow">built for the curious</span><h2>A second pair of eyes<br /><em>for your entire codebase.</em></h2></div><div className="protocol-grid"><div><Sparkles size={20} /><h3>See what is emerging</h3><p>Surface patterns across branches before they become blockers.</p></div><div><GitBranch size={20} /><h3>Stay in the flow</h3><p>Ask your repository questions in plain language. Get to the useful part faster.</p></div><div><GitBranch size={20} /><h3>Ship with context</h3><p>Turn scattered knowledge into decisions your whole team can act on.</p></div></div></section>
      <section className="access" id="access"><div><span className="eyebrow">the next commit starts here</span><h2>Make your codebase<br /><em>legible.</em></h2></div><a className="primary-button" href="mailto:hello@gitchat.dev">Request access <ArrowUpRight size={16} /></a></section>
      <footer><span>gitchat<span className="brand-dot">.</span></span><span>© 2026 / built in the open</span><a href="#top">back to top ↑</a></footer>
    </main>
  );
}
