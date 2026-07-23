export function RippleLayer({ ripples }: { ripples: { id: number; x: number; y: number; size: number }[] }) {
  return (
    <>
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full bg-current opacity-20 animate-ripple"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
    </>
  );
}
