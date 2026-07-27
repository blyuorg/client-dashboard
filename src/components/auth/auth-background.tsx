const PARTICLES = [
  { top: "12%", left: "18%", size: 3, delay: "0s", duration: "7s" },
  { top: "24%", left: "76%", size: 2, delay: "1.2s", duration: "9s" },
  { top: "68%", left: "12%", size: 2, delay: "2.1s", duration: "8s" },
  { top: "80%", left: "62%", size: 3, delay: "0.6s", duration: "10s" },
  { top: "42%", left: "48%", size: 2, delay: "3s", duration: "7.5s" },
  { top: "55%", left: "88%", size: 2, delay: "1.8s", duration: "9.5s" },
  { top: "8%", left: "55%", size: 2, delay: "2.6s", duration: "8.5s" },
  { top: "90%", left: "30%", size: 3, delay: "0.3s", duration: "11s" },
];

/**
 * Purely decorative — gradient orbs, a grid, and drifting particles behind
 * the auth shell. Fixed + pointer-events-none so it never affects layout,
 * focus order, or hit-testing for the real UI in front of it.
 */
export function AuthBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden bg-auth-bg" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
        }}
      />

      <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] animate-blob rounded-full bg-auth-primary/20 blur-[120px]" />
      <div
        className="absolute -bottom-40 left-1/3 h-[28rem] w-[28rem] animate-blob rounded-full bg-[#60A5FA]/15 blur-[120px]"
        style={{ animationDelay: "-5s" }}
      />
      <div
        className="absolute -right-24 top-1/4 h-[24rem] w-[24rem] animate-blob rounded-full bg-auth-primary/10 blur-[120px]"
        style={{ animationDelay: "-10s" }}
      />

      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute animate-float rounded-full bg-white/40"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-auth-bg" />
    </div>
  );
}
