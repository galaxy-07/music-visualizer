
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
    
    // Create a smooth decay from beat impact
    const timeDiff = Math.abs(currentTime - closestBeat);
    if (timeDiff < 0.3) {
      return Math.max(0, 1 - (timeDiff / 0.3)) * 0.8;
    }
    return 0;
  };

  const getToneConfig = (tone: string) => {
    const configs = {
      happy: { 
        baseIntensity: 0.7, 
        speed: 1.2, 
        pattern: 'radial', 
        waveAmplitude: 0.4,
        flowDirection: 'outward'
      },
      energetic: { 
        baseIntensity: 0.9, 
        speed: 1.8, 
        pattern: 'waves', 
        waveAmplitude: 0.6,
        flowDirection: 'vertical'
      },
      sad: { 
        baseIntensity: 0.3, 
        speed: 0.5, 
        pattern: 'drops', 
        waveAmplitude: 0.2,
        flowDirection: 'downward'
      },
      melancholy: { 
        baseIntensity: 0.25, 
        speed: 0.4, 
        pattern: 'ripples', 
        waveAmplitude: 0.15,
        flowDirection: 'inward'
      },
      calm: { 
        baseIntensity: 0.5, 
        speed: 0.8, 
        pattern: 'horizontal', 
        waveAmplitude: 0.3,
        flowDirection: 'horizontal'
      },
      angry: { 
        baseIntensity: 0.95, 
        speed: 2.2, 
        pattern: 'chaos', 
        waveAmplitude: 0.7,
        flowDirection: 'random'
      },
      neutral: { 
        baseIntensity: 0.4, 
        speed: 1.0, 
        pattern: 'gentle', 
        waveAmplitude: 0.25,
        flowDirection: 'diagonal'
      },
    };
    return configs[tone as keyof typeof configs] || configs.neutral;
  };

  const getPatternOpacity = (row: number, col: number, time: number, config: any) => {
    const centerX = GRID_SIZE / 2;
    const centerY = GRID_SIZE / 2;
    const normalizedTime = time * config.speed;
    
    switch (config.pattern) {
      case 'radial':
        const distance = Math.sqrt((col - centerX) ** 2 + (row - centerY) ** 2);
        return Math.sin(normalizedTime - distance * 0.3) * config.waveAmplitude + config.baseIntensity;
        
      case 'waves':
        return Math.sin(normalizedTime + row * 0.4) * 
               Math.cos(normalizedTime * 0.7 + col * 0.2) * 
               config.waveAmplitude + config.baseIntensity;
        
      case 'drops':
        const dropWave = Math.sin(normalizedTime + row * 0.6) * Math.exp(-row * 0.08);
        return dropWave * config.waveAmplitude + config.baseIntensity;
        
      case 'ripples':
        const rippleDistance = Math.sqrt((col - centerX) ** 2 + (row - centerY) ** 2);
        return Math.sin(normalizedTime + rippleDistance * 0.5) * 
               Math.exp(-rippleDistance * 0.05) * 
               config.waveAmplitude + config.baseIntensity;
        
      case 'horizontal':
        return Math.sin(normalizedTime + col * 0.3) * config.waveAmplitude + config.baseIntensity;
        
      case 'chaos':
        const chaos1 = Math.sin(normalizedTime + row * 0.7);
        const chaos2 = Math.cos(normalizedTime * 1.3 + col * 0.5);
        return (chaos1 * chaos2) * config.waveAmplitude + config.baseIntensity;
        
      case 'gentle':
        return Math.sin(normalizedTime + (row + col) * 0.15) * config.waveAmplitude + config.baseIntensity;
        
      default:
        return config.baseIntensity;
    }
  };

  const createGradient = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, opacity: number) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
    gradient.addColorStop(0.5, `rgba(255, 255, 255, ${opacity * 0.7})`);
    gradient.addColorStop(1, `rgba(255, 255, 255, ${opacity * 0.1})`);
    return gradient;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const beatIntensity = getCurrentBeatIntensity();
    const toneConfig = getToneConfig(currentTone);
    
    // Draw dots with enhanced patterns
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const x = col * SPACING + SPACING / 2;
        const y = row * SPACING + SPACING / 2;

        // Calculate base pattern opacity
        let opacity = getPatternOpacity(row, col, currentTime, toneConfig);
        
        // Add beat responsiveness
        if (beatIntensity > 0.1) {
          const centerDistance = Math.sqrt((col - GRID_SIZE/2) ** 2 + (row - GRID_SIZE/2) ** 2);
          const beatWave = beatIntensity * Math.exp(-centerDistance * 0.08);
          opacity += beatWave * 0.6;
        }
        
        // Clamp opacity
        opacity = Math.max(0.05, Math.min(1, opacity));

        // Dynamic dot size based on opacity and beat
        let dotSize = DOT_SIZE * (0.6 + opacity * 0.4);
        if (beatIntensity > 0.3) {
          dotSize *= (1 + beatIntensity * 0.3);
        }

        // Create gradient
        const gradient = createGradient(ctx, x, y, dotSize, opacity);
        ctx.fillStyle = gradient;

        // Draw main dot
        ctx.beginPath();
        ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Add bright core for high intensity dots
        if (opacity > 0.6) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, opacity * 0.8)})`;
          ctx.beginPath();
          ctx.arc(x, y, dotSize / 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Add subtle overlay effects for beat synchronization
    if (isPlaying && beatIntensity > 0.2) {
      ctx.globalCompositeOperation = 'screen';
      const overlayOpacity = beatIntensity * 0.1;
      
      // Subtle wave overlay
      const waveY = (Math.sin(currentTime * toneConfig.speed) * 0.2 + 0.5) * CANVAS_SIZE;
      const waveGradient = ctx.createLinearGradient(0, waveY - 15, 0, waveY + 15);
      waveGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      waveGradient.addColorStop(0.5, `rgba(255, 255, 255, ${overlayOpacity})`);
      waveGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = waveGradient;
      ctx.fillRect(0, waveY - 15, CANVAS_SIZE, 30);
      ctx.globalCompositeOperation = 'source-over';
    }

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(draw);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
