import Link from "next/link";
import { GitBranch } from "lucide-react";

export function SiteFooter() {
  return (
    <footer>
      <span className="brand-mark">
        <GitBranch size={14} />
      </span>
      <span>
        gitchat<span className="brand-dot">.</span>
      </span>
      <span>© 2026 / Yash-singh0408</span>
      <Link href="/">back to top ↑</Link>
    </footer>
  );
}
