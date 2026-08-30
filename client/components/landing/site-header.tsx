"use client";

import Link from "next/link";
import { ArrowUpRight, GitBranch, Menu, X } from "lucide-react";

import { ModeToggle } from "@/components/ui/mode-toggle";

export function SiteHeader({
  menuOpen,
  onToggleMenu,
}: {
  menuOpen: boolean;
  onToggleMenu: () => void;
}) {
  return (
    <nav className="topbar">
      <Link className="brand" href="/" aria-label="GitChat home">
        <span className="brand-mark">
          <GitBranch size={17} />
        </span>
        gitchat<span className="brand-dot">.</span>
      </Link>

      {/* <div className={`nav-links ${menuOpen ? "is-open" : ""}`}>
        <Link href="/#signal" onClick={onToggleMenu}>
          The signal
        </Link>
        <Link href="/#protocol" onClick={onToggleMenu}>
          Protocol
        </Link>
        <Link href="/#access" onClick={onToggleMenu}>
          Early access
        </Link>
      </div> */}

      <div className="nav-actions">
        <ModeToggle />
        <Link className="nav-login" href="/login">
          Sign in <ArrowUpRight size={14} />
        </Link>
        <button
          className="menu-button"
          type="button"
          aria-label="Toggle navigation"
          onClick={onToggleMenu}
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
    </nav>
  );
}
