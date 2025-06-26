
import React, { useRef, useEffect, useState } from 'react';

interface CosmicVisualizerProps {
  currentTone: string;
  currentTime: number;
  beats: number[];
  isPlaying: boolean;
}

const CosmicVisualizer: React.FC<CosmicVisualizerProps> = ({
  currentTone,
  currentTime,
  beats,
  isPlaying,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    hue: number;
  }>>([]);

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
    return timeDiff < 0.2 ? Math.max(0, 1 - (timeDiff / 0.2)) : 0;
  };

  const getToneColors = (tone: string) => {
    const colorMap: { [key: string]: { primary: number; secondary: number; accent: number } } = {
      happy: { primary: 60, secondary: 45, accent: 30 }, // Yellows/Golds
      energetic: { primary: 15, secondary: 30, accent: 0 }, // Oranges/Reds
      sad: { primary: 240, secondary: 220, accent: 200 }, // Blues
      melancholy: { primary: 280, secondary: 260, accent: 300 }, // Purples
      calm: { primary: 180, secondary: 160, accent: 200 }, // Teals/Cyans
      angry: { primary: 0, secondary: 15, accent: 345 }, // Reds
      neutral: { primary: 0, secondary: 0, accent: 0 }, // Grays
    };
    return colorMap[tone] || colorMap.neutral;
  };

  const initializeParticles = (width: number, height: number) => {
    const particles = [];
    const particleCount = 150;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.7 + 0.3,
        hue: Math.random() * 360,
      });
    }
    
    particlesRef.current = particles;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear with cosmic gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height));
    gradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
    gradient.addColorStop(0.5, 'rgba(30, 41, 59, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const beatIntensity = getCurrentBeatIntensity();
    const colors = getToneColors(currentTone);
    const time = currentTime;

    // Draw cosmic waves based on tone
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 5; i++) {
      const radius = 50 + i * 30 + beatIntensity * 20;
      const waveGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      
      waveGradient.addColorStop(0, `hsla(${colors.primary}, 70%, 60%, ${0.3 - i * 0.05})`);
      waveGradient.addColorStop(0.7, `hsla(${colors.secondary}, 60%, 50%, ${0.2 - i * 0.03})`);
      waveGradient.addColorStop(1, `hsla(${colors.accent}, 50%, 40%, 0)`);
      
      ctx.fillStyle = waveGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Update and draw particles
    particlesRef.current.forEach((particle, index) => {
      // Update particle position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Wrap around edges
      if (particle.x < 0) particle.x = width;
      if (particle.x > width) particle.x = 0;
      if (particle.y < 0) particle.y = height;
      if (particle.y > height) particle.y = 0;

      // Adjust particle based on tone and beat
      const distance = Math.sqrt((particle.x - centerX) ** 2 + (particle.y - centerY) ** 2);
      const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
      const normalizedDistance = distance / maxDistance;

      let intensity = 0.5;
      let particleHue = colors.primary;

      switch (currentTone) {
        case 'happy':
        case 'energetic':
          intensity = 0.8 + Math.sin(time * 2 + index * 0.1) * 0.3;
          particleHue = colors.primary + Math.sin(time + index * 0.2) * 20;
          break;
        case 'sad':
        case 'melancholy':
          intensity = 0.3 + Math.sin(time * 0.5 + index * 0.05) * 0.2;
          particleHue = colors.primary;
          break;
        case 'calm':
          intensity = 0.4 + Math.sin(time + index * 0.02) * 0.2;
          particleHue = colors.primary + normalizedDistance * 40;
          break;
        case 'angry':
          intensity = 0.9 + Math.sin(time * 3 + index * 0.3) * 0.4;
          particleHue = colors.primary + Math.random() * 30;
          break;
        default:
          intensity = 0.5;
          particleHue = colors.primary;
      }

      if (beatIntensity > 0) {
        intensity += beatIntensity * 0.7;
        particle.size = Math.max(1, particle.size + beatIntensity * 2);
      } else {
        particle.size = Math.max(1, particle.size * 0.98);
      }

      // Draw particle
      ctx.globalCompositeOperation = 'screen';
      const alpha = intensity * particle.opacity * (1 - normalizedDistance * 0.3);
      ctx.fillStyle = `hsla(${particleHue}, 80%, 70%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      // Add glow for strong beats
      if (beatIntensity > 0.5) {
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `hsla(${particleHue}, 90%, 80%, ${beatIntensity * 0.5})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.globalCompositeOperation = 'source-over';

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(draw);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      if (particlesRef.current.length === 0) {
        initializeParticles(canvas.width, canvas.height);
      }
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentTone, currentTime, isPlaying, beats]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-xl"
      style={{ background: 'transparent' }}
    />
  );
};

export default CosmicVisualizer;
