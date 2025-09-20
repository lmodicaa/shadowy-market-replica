import { useEffect, useState, useMemo } from 'react';

interface Star {
  id: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size: number; // px
  animationDelay: number; // seconds
  driftX: number; // vw
  driftY: number; // vh
  driftDuration: number; // seconds
}

const StarField = () => {
  const [stars, setStars] = useState<Star[]>([]);

  // Optimized star count for better performance (responsive)
  const starCount = useMemo(() => {
    if (typeof window === 'undefined') return 30;
    const w = window.innerWidth;
    // Scale from 24 to 60 stars depending on width
    return Math.max(24, Math.min(60, Math.floor(w / 24)));
  }, []);

  const generateStars = useMemo(() => {
    const newStars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      const driftX = (Math.random() * 4 - 2); // -2vw .. 2vw
      const driftY = (Math.random() * 4 - 2); // -2vh .. 2vh
      const driftDuration = 20 + Math.random() * 12; // 20s .. 32s
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        animationDelay: Math.random() * 3,
        driftX,
        driftY,
        driftDuration,
      });
    }
    return newStars;
  }, [starCount]);

  useEffect(() => {
    setStars(generateStars);
  }, [generateStars]);

  return (
    <div className="star-field will-change-transform">
      {/* Aurora soft glow layer behind stars */}
      <div className="aurora-layer" aria-hidden />

      {/* Drifting stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="star-wrapper"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            // CSS custom properties drive the drift animation in CSS
            ['--drift-x' as any]: `${star.driftX}vw`,
            ['--drift-y' as any]: `${star.driftY}vh`,
            ['--drift-duration' as any]: `${star.driftDuration}s`,
          }}
        >
          <div
            className="star will-change-transform"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.animationDelay}s`,
              transform: 'translateZ(0)',
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default StarField;