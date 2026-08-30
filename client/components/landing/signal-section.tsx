import { ArrowUpRight, MousePointer2 } from "lucide-react";

export function SignalSection() {
  return (
    <section className="signal-strip" id="signal">
      <div>
        <span className="strip-index">01 /</span>
        <strong>Context, connected.</strong>
        <span>Every issue, commit, and conversation in one field of view.</span>
      </div>
      <div className="strip-arrow">
        <MousePointer2 size={15} /> move through the signal <ArrowUpRight size={15} />
      </div>
    </section>
  );
}
