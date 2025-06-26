
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
      happy: { intensity: 0.9, speed: 3.5, pattern: 'radial', brightness: 1.0, waveHeight: 0.8 },
      energetic: { intensity: 1.0, speed: 4.0, pattern: 'waves', brightness: 1.2, waveHeight: 1.0 },
      sad: { intensity: 0.3, speed: 1.0, pattern: 'vertical', brightness: 0.6, waveHeight: 0.4 },
      melancholy: { intensity: 0.25, speed: 0.8, pattern: 'drops', brightness: 0.5, waveHeight: 0.3 },
      calm: { intensity: 0.6, speed: 1.5, pattern: 'horizontal', brightness: 0.8, waveHeight: 0.6 },
      angry: { intensity: 0.95, speed: 5.0, pattern: 'chaos', brightness: 1.1, waveHeight: 0.9 },
      neutral: { intensity: 0.5, speed: 2.0, pattern: 'diagonal', brightness: 0.7, waveHeight: 0.5 },
    };
    return configs[tone as keyof typeof configs] || configs.neutral;
  };

  const getPatternOpacity = (row: number, col: number, time: number, config: any) => {
    const centerX = GRID_SIZE / 2;
    const centerY = GRID_SIZE / 2;
    
    switch (config.pattern) {
      case 'radial':
        const distance = Math.sqrt((col - centerX) ** 2 + (row - centerY) ** 2);
        return Math.sin(time * config.speed - distance * 0.4) * config.waveHeight + 0.5;
        
      case 'waves':
        return Math.sin(time * config.speed + row * 0.3) * Math.cos(time * config.speed * 0.7 + col * 0.2) * config.waveHeight + 0.5;
        
      case 'vertical':
        return Math.sin(time * config.speed + row * 0.5) * config.waveHeight + 0.4;
        
      case 'drops':
        return Math.sin(time * config.speed + row * 0.8) * Math.exp(-row * 0.1) * config.waveHeight + 0.3;
        
      case 'horizontal':
        return Math.sin(time * config.speed + col * 0.3) * config.waveHeight + 0.4;
        
      case 'chaos':
        return Math.sin(time * config.speed + row * 0.4) * Math.cos(time * config.speed * 0.8 + col * 0.3) * config.waveHeight + 0.5;
        
      default:
        return Math.sin(time * config.speed + (row + col) * 0.2) * config.waveHeight + 0.4;
    }
  };

  const createRadialGradient = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, opacity: number) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
    gradient.addColorStop(0.6, `rgba(255, 255, 255, ${opacity * 0.6})`);
    gradient.addColorStop(1, `rgba(255, 255, 255, ${opacity * 0.1})`);
    return gradient;
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
    
    // Draw dots with enhanced shading and patterns
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const x = col * SPACING + SPACING / 2;
        const y = row * SPACING + SPACING / 2;

        // Base pattern opacity
        let opacity = getPatternOpacity(row, col, currentTime, toneConfig);
        opacity *= toneConfig.intensity * toneConfig.brightness;
        
        // Add secondary wave for depth
        const secondaryWave = Math.sin(currentTime * toneConfig.speed * 0.5 + (row * col) * 0.1) * 0.3;
        opacity += secondaryWave;
        
        // Add beat pulse with gradient effect
        if (beatIntensity > 0) {
          const centerDistance = Math.sqrt((col - GRID_SIZE/2) ** 2 + (row - GRID_SIZE/2) ** 2);
          const beatWave = beatIntensity * Math.exp(-centerDistance * 0.1);
          opacity += beatWave * 0.8;
        }
        
        opacity = Math.max(0.02, Math.min(1, opacity));

        // Calculate dynamic dot size
        let currentDotSize = DOT_SIZE;
        const sizeVariation = Math.sin(currentTime * toneConfig.speed * 0.3 + row * 0.2 + col * 0.2) * 0.3;
        currentDotSize *= (1 + sizeVariation);
        
        if (beatIntensity > 0.4) {
          currentDotSize *= (1 + beatIntensity * 0.4);
        }

        // Create gradient for each dot
        const gradient = createRadialGradient(ctx, x, y, currentDotSize, opacity);
        ctx.fillStyle = gradient;

        // Draw main dot
        ctx.beginPath();
        ctx.arc(x, y, currentDotSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Add inner bright core for high opacity dots
        if (opacity > 0.7) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, opacity * 1.2)})`;
          ctx.beginPath();
          ctx.arc(x, y, currentDotSize / 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Add outer glow for beat effects
        if (beatIntensity > 0.6) {
          const glowSize = currentDotSize * (1 + beatIntensity);
          const glowGradient = createRadialGradient(ctx, x, y, glowSize, beatIntensity * 0.3);
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(x, y, glowSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Add synchronous wave overlay for extra liveliness
    if (isPlaying) {
      ctx.globalCompositeOperation = 'screen';
      const waveOpacity = Math.sin(currentTime * toneConfig.speed) * 0.1 + 0.05;
      
      for (let i = 0; i < 3; i++) {
        const waveY = (Math.sin(currentTime * toneConfig.speed + i * Math.PI / 3) * 0.3 + 0.5) * CANVAS_SIZE;
        const waveGradient = ctx.createLinearGradient(0, waveY - 20, 0, waveY + 20);
        waveGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        waveGradient.addColorStop(0.5, `rgba(255, 255, 255, ${waveOpacity})`);
        waveGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = waveGradient;
        ctx.fillRect(0, waveY - 20, CANVAS_SIZE, 40);
      }
      ctx.globalCompositeOperation = 'source-over';
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
