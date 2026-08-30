"use client";

import { useState } from "react";

import { AccessSection } from "@/components/landing/access-section";
import { HeroSection } from "@/components/landing/hero-section";
import { ProtocolSection } from "@/components/landing/protocol-section";
import { SignalSection } from "@/components/landing/signal-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export default function Home() {
  const [spinRequest, setSpinRequest] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="landing-shell">
      <div className="grain" />

      <SiteHeader
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((value) => !value)}
      />

      <HeroSection
        spinRequest={spinRequest}
        onSpin={() => setSpinRequest((value) => value + 1)}
        onCloseMenu={() => setMenuOpen(false)}
      />

      <SignalSection />
      <ProtocolSection />
      <AccessSection />
      <SiteFooter />
    </main>
  );
}
