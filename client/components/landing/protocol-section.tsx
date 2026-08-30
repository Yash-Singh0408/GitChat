import { GitBranch, Sparkles } from "lucide-react";

export function ProtocolSection() {
  return (
    <section className="protocol" id="protocol">
      <div className="protocol-head">
        <span className="eyebrow">built for the curious</span>
        <h2>
          A second pair of eyes
          <br />
          <em>for your entire codebase.</em>
        </h2>
      </div>

      <div className="protocol-grid">
        <div>
          <Sparkles size={20} />
          <h3>See what is emerging</h3>
          <p>Surface patterns across branches before they become blockers.</p>
        </div>
        <div>
          <GitBranch size={20} />
          <h3>Stay in the flow</h3>
          <p>Ask your repository questions in plain language. Get to the useful part faster.</p>
        </div>
        <div>
          <GitBranch size={20} />
          <h3>Ship with context</h3>
          <p>Turn scattered knowledge into decisions your whole team can act on.</p>
        </div>
      </div>
    </section>
  );
}
