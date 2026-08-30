"use client";

import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";

import { GitScene } from "@/components/landing/git-scene";

export function HeroSection({
  spinRequest,
  onSpin,
  onCloseMenu,
}: {
  spinRequest: number;
  onSpin: () => void;
  onCloseMenu: () => void;
}) {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="status-pulse" /> Indexing your codebase for context and insight
        </div>
        <h1>
          Read the code.
          <br />
          <em>Understand it.</em>
        </h1>
        <p className="hero-lede">
            GitChat is a codebase companion that answers questions about your repository in plain language. It helps you understand the code, surface patterns, and make decisions faster.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" href="/login" onClick={onCloseMenu}>
            Enter in your Codebase <ArrowUpRight size={16} />
          </Link>
          <button className="ghost-button" type="button" onClick={onSpin}>
            <span className="play-icon">
              <Play size={11} fill="currentColor" />
            </span>
            spin the model
          </button>
        </div>
        <div className="proof-row">
          <div className="avatars">
            <span>AL</span>
            <span>MK</span>
            <span>JR</span>
            <span>+</span>
          </div>
          <span>
            Can you ship a product without reading code?
            <br />
            <strong>Yes, but it&apos;s harder.</strong>
          </span>
        </div>
      </div>

      <div className="scene-wrap">
        <GitScene spinRequest={spinRequest} />
        <div className="scene-crosshair crosshair-one" />
        <div className="scene-crosshair crosshair-two" />
      </div>
    </section>
  );
}
