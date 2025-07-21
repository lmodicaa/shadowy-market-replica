import { useEffect, useState, useMemo } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  animationDelay: number;
}

const StarField = () => {
  const [stars, setStars] = useState<Star[]>([]);

  // Reduce star count for better performance
  const starCount = 50; // Reduced from 100

  const generateStars = useMemo(() => {
    const newStars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        animationDelay: Math.random() * 3,
      });
    }
    return newStars;
  }, [starCount]);

  useEffect(() => {
    setStars(generateStars);
  }, [generateStars]);

  return (
    <div className="star-field will-change-transform">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star will-change-transform"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.animationDelay}s`,
            transform: 'translateZ(0)', // GPU acceleration
          }}
        />
      ))}
    </div>
  );
};

export default StarField;