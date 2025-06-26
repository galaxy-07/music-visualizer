
import React, { useEffect, useRef } from 'react';

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

  // Static size optimized for laptop displays
  const CANVAS_SIZE = 480;
  const GRID_SIZE = 24;
  const DOT_SIZE = 8;
  const SPACING = CANVAS_SIZE / GRID_SIZE;

  const getCurrentBeatIntensity = () => {
    if (!beats.length || !isPlaying) return 0;
    
    let closestBeat = beats[0];
    let minDiff = Math.abs(currentTime - beats[0]);
    
    for (const beat of beats) {
      const diff = Math.abs(currentTime - beat);
      if (diff < minDiff) {
        minDiff = diff;
        closestBeat = beat;
      }
    }
    
    const timeDiff = Math.abs(currentTime - closestBeat);
    if (timeDiff < 0.2) {
      return Math.max(0, 1 - (timeDiff / 0.2));
    }
    return 0;
  };

  const getToneConfig = (tone: string) => {
    const configs = {
      happy: { intensity: 0.9, speed: 3.5, pattern: 'radial', brightness: 1.0 },
      energetic: { intensity: 1.0, speed: 4.0, pattern: 'waves', brightness: 1.2 },
      sad: { intensity: 0.3, speed: 1.0, pattern: 'vertical', brightness: 0.6 },
      melancholy: { intensity: 0.25, speed: 0.8, pattern: 'drops', brightness: 0.5 },
      calm: { intensity: 0.6, speed: 1.5, pattern: 'horizontal', brightness: 0.8 },
      angry: { intensity: 0.95, speed: 5.0, pattern: 'chaos', brightness: 1.1 },
      neutral: { intensity: 0.5, speed: 2.0, pattern: 'diagonal', brightness: 0.7 },
    };
    return configs[tone as keyof typeof configs] || configs.neutral;
  };

  const getPatternOpacity = (row: number, col: number, time: number, config: any) => {
    const centerX = GRID_SIZE / 2;
    const centerY = GRID_SIZE / 2;
    
    switch (config.pattern) {
      case 'radial':
        const distance = Math.sqrt((col - centerX) ** 2 + (row - centerY) ** 2);
        return Math.sin(time * config.speed - distance * 0.4) * 0.5 + 0.5;
        
      case 'waves':
        return Math.sin(time * config.speed + row * 0.3) * Math.cos(time * config.speed * 0.7 + col * 0.2) * 0.5 + 0.5;
        
      case 'vertical':
        return Math.sin(time * config.speed + row * 0.5) * 0.4 + 0.4;
        
      case 'drops':
        return Math.sin(time * config.speed + row * 0.8) * Math.exp(-row * 0.1) * 0.4 + 0.3;
        
      case 'horizontal':
        return Math.sin(time * config.speed + col * 0.3) * 0.4 + 0.4;
        
      case 'chaos':
        return Math.sin(time * config.speed + row * 0.4) * Math.cos(time * config.speed * 0.8 + col * 0.3) * 0.6 + 0.6;
        
      default:
        return Math.sin(time * config.speed + (row + col) * 0.2) * 0.4 + 0.4;
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with black background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const beatIntensity = getCurrentBeatIntensity();
    const toneConfig = getToneConfig(currentTone);
    
    // Draw dots
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const x = col * SPACING + SPACING / 2;
        const y = row * SPACING + SPACING / 2;

        let opacity = getPatternOpacity(row, col, currentTime, toneConfig);
        opacity *= toneConfig.intensity * toneConfig.brightness;
        
        // Add beat pulse
        if (beatIntensity > 0) {
          opacity += beatIntensity * 0.6;
        }
        
        opacity = Math.max(0.05, Math.min(1, opacity));

        // Calculate dot size with beat effect
        let currentDotSize = DOT_SIZE;
        if (beatIntensity > 0.4) {
          currentDotSize *= (1 + beatIntensity * 0.3);
        }

        // Draw dot
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, currentDotSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Add glow for strong beats
        if (beatIntensity > 0.7) {
          ctx.shadowBlur = 10 * beatIntensity;
          ctx.shadowColor = `rgba(255, 255, 255, ${beatIntensity * 0.6})`;
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

    // Set static canvas size
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

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
    <div className="flex justify-center items-center">
      <canvas
        ref={canvasRef}
        className="border border-gray-600 rounded-lg bg-black"
        style={{ width: '480px', height: '480px' }}
      />
    </div>
  );
};

export default DotMatrixVisualizer;
