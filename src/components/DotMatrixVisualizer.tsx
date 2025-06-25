
import React, { useEffect, useRef, useMemo } from 'react';

interface DotMatrixVisualizerProps {
  currentTone: string;
  currentTime: number;
  beats: number[];
  isPlaying: boolean;
}

const DotMatrixVisualizer: React.FC<DotMatrixVisualizerProps> = ({
  currentTone,
  currentTime,
  beats,
  isPlaying,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Tone color mapping
  const toneColors = useMemo(() => ({
    happy: { r: 255, g: 193, b: 7 },      // Golden yellow
    sad: { r: 59, g: 130, b: 246 },       // Blue
    energetic: { r: 239, g: 68, b: 68 },  // Red
    calm: { r: 34, g: 197, b: 94 },       // Green
    angry: { r: 220, g: 38, b: 127 },     // Pink
    neutral: { r: 156, g: 163, b: 175 },  // Gray
  }), []);

  const getCurrentBeatIntensity = () => {
    if (!beats.length) return 0;
    
    // Find the closest beat to current time
    const closestBeat = beats.reduce((prev, curr) => 
      Math.abs(curr - currentTime) < Math.abs(prev - currentTime) ? curr : prev
    );
    
    const timeDiff = Math.abs(currentTime - closestBeat);
    // Create a pulse effect that fades over 0.2 seconds
    return timeDiff < 0.2 ? Math.max(0, 1 - (timeDiff / 0.2)) : 0;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const gridSize = 20;
    const dotSize = (width / gridSize) * 0.6;
    const spacing = width / gridSize;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    const baseColor = toneColors[currentTone as keyof typeof toneColors] || toneColors.neutral;
    const beatIntensity = getCurrentBeatIntensity();

    // Draw dots
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = col * spacing + spacing / 2;
        const y = row * spacing + spacing / 2;

        // Add some randomness and wave effect
        const wave = Math.sin(currentTime * 2 + row * 0.1 + col * 0.1) * 0.3;
        const random = Math.random() * 0.2;
        
        // Calculate opacity based on position, time, and beat
        let opacity = 0.3 + wave + random;
        if (isPlaying) {
          opacity += beatIntensity * 0.7;
        }
        opacity = Math.max(0.1, Math.min(1, opacity));

        // Calculate size with beat effect
        let currentDotSize = dotSize;
        if (isPlaying && beatIntensity > 0) {
          currentDotSize *= (1 + beatIntensity * 0.5);
        }

        // Draw dot
        ctx.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, currentDotSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect for beats
        if (beatIntensity > 0.5) {
          ctx.shadowBlur = 10 + beatIntensity * 20;
          ctx.shadowColor = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${beatIntensity})`;
          ctx.beginPath();
          ctx.arc(x, y, currentDotSize / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(draw);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const container = canvas.parentElement;
    if (container) {
      const size = Math.min(container.clientWidth - 32, 400);
      canvas.width = size;
      canvas.height = size;
    }

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentTone, currentTime, isPlaying, beats]);

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        className="border border-slate-600 rounded-lg bg-black/30"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
};

export default DotMatrixVisualizer;
