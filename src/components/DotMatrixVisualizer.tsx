
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
  const lastBeatTimeRef = useRef<number>(0);

  // Get the closest beat to current time for intensity calculation
  const getCurrentBeatIntensity = () => {
    if (!beats.length || !isPlaying) return 0;
    
    // Find the closest beat to current time
    let closestBeat = beats[0];
    let minDiff = Math.abs(currentTime - beats[0]);
    
    for (const beat of beats) {
      const diff = Math.abs(currentTime - beat);
      if (diff < minDiff) {
        minDiff = diff;
        closestBeat = beat;
      }
    }
    
    // Create a pulse effect that's strongest right at the beat
    const timeDiff = Math.abs(currentTime - closestBeat);
    if (timeDiff < 0.15) {
      return Math.max(0, 1 - (timeDiff / 0.15));
    }
    return 0;
  };

  // Get tone-based intensity multiplier
  const getToneIntensity = () => {
    const intensityMap: { [key: string]: number } = {
      happy: 0.9,
      energetic: 1.0,
      sad: 0.4,
      melancholy: 0.3,
      calm: 0.6,
      angry: 0.95,
      neutral: 0.5,
    };
    return intensityMap[currentTone] || 0.5;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const gridSize = 20;
    const dotSize = (width / gridSize) * 0.4;
    const spacing = width / gridSize;

    // Clear canvas with black background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    const beatIntensity = getCurrentBeatIntensity();
    const toneIntensity = getToneIntensity();
    
    // Create different patterns based on tone
    const getPatternForTone = (row: number, col: number, time: number) => {
      switch (currentTone) {
        case 'happy':
        case 'energetic':
          // Radial waves from center
          const centerX = gridSize / 2;
          const centerY = gridSize / 2;
          const distance = Math.sqrt((col - centerX) ** 2 + (row - centerY) ** 2);
          return Math.sin(time * 3 - distance * 0.5) * 0.5 + 0.5;
          
        case 'sad':
        case 'melancholy':
          // Slow vertical waves
          return Math.sin(time * 1.5 + row * 0.3) * 0.3 + 0.3;
          
        case 'calm':
          // Gentle horizontal ripples
          return Math.sin(time * 2 + col * 0.2) * 0.4 + 0.4;
          
        case 'angry':
          // Chaotic pattern
          return Math.sin(time * 4 + row * 0.4) * Math.cos(time * 3 + col * 0.3) * 0.6 + 0.6;
          
        default:
          // Simple diagonal wave
          return Math.sin(time * 2 + (row + col) * 0.2) * 0.4 + 0.4;
      }
    };

    // Draw dots
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = col * spacing + spacing / 2;
        const y = row * spacing + spacing / 2;

        // Calculate base opacity from pattern
        let opacity = getPatternForTone(row, col, currentTime);
        
        // Apply tone intensity
        opacity *= toneIntensity;
        
        // Add beat pulse effect
        if (beatIntensity > 0) {
          const beatPulse = beatIntensity * 0.8;
          opacity += beatPulse;
        }
        
        // Ensure opacity is within valid range
        opacity = Math.max(0.1, Math.min(1, opacity));

        // Calculate size with beat effect
        let currentDotSize = dotSize;
        if (beatIntensity > 0.3) {
          currentDotSize *= (1 + beatIntensity * 0.4);
        }

        // Draw white dot with calculated opacity
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, currentDotSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect for strong beats
        if (beatIntensity > 0.6) {
          ctx.shadowBlur = 15 * beatIntensity;
          ctx.shadowColor = `rgba(255, 255, 255, ${beatIntensity * 0.8})`;
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

    // Cancel previous animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
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
        className="border border-gray-600 rounded-lg bg-black"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
};

export default DotMatrixVisualizer;
