const COLORS = [
  "220,190,140",
  "240,215,165",
  "255,248,220",
  "195,165,115",
  "250,230,185",
  "210,175,120",
];

const CSS_PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 5.6 + 2) % 96}%`,
  top: `${(i * 13.3 + 5) % 90}%`,
  duration: 18 + (i * 5.3) % 20,
  delay: (i * 2.7) % 13,
  size: 1 + (i % 4) * 0.6,
  opacity: 0.04 + (i % 5) * 0.018,
  color: COLORS[i % COLORS.length],
}));

export function GlobalDust() {
  return (
    <>
      <style>{`
        @keyframes dune-drift {
          0%   { transform: translate(0px, 0px) rotate(0deg); opacity: 0; }
          8%   { opacity: 1; }
          90%  { opacity: 0.9; }
          100% { transform: translate(220px, -65px) rotate(55deg); opacity: 0; }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        {CSS_PARTICLES.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${(p.size * 0.42).toFixed(1)}px`,
              borderRadius: "50%",
              background: `rgb(${p.color})`,
              opacity: p.opacity,
              animation: `dune-drift ${p.duration}s ${p.delay}s infinite linear`,
            }}
          />
        ))}
      </div>
    </>
  );
}
