import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface SphereVisualizerProps {
  currentTone: string;
  currentTime: number;
  beats: number[];
  isPlaying: boolean;
}

const AnimatedSphere: React.FC<SphereVisualizerProps> = ({
  currentTone,
  currentTime,
  beats,
  isPlaying,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Get the closest beat to current time for intensity calculation
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

  // Create sphere points based on tone patterns
  const { positions, colors } = useMemo(() => {
    const pointCount = 2000;
    const positions = new Float32Array(pointCount * 3);
    const colors = new Float32Array(pointCount * 3);

    for (let i = 0; i < pointCount; i++) {
      // Distribute points on sphere surface using Fibonacci spiral
      const theta = Math.acos(1 - 2 * (i / pointCount));
      const phi = Math.PI * (1 + Math.sqrt(5)) * i;

      const radius = 2 + Math.random() * 0.5;
      
      positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.cos(theta);

      // Set base color to white
      colors[i * 3] = 1;     // R
      colors[i * 3 + 1] = 1; // G
      colors[i * 3 + 2] = 1; // B
    }

    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current || !groupRef.current) return;

    const beatIntensity = getCurrentBeatIntensity();
    const toneIntensity = getToneIntensity();
    const time = state.clock.getElapsedTime();

    // Update point colors and positions based on tone and beats
    const colorArray = pointsRef.current.geometry.attributes.color.array as Float32Array;
    const positionArray = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < colorArray.length / 3; i++) {
      const baseIndex = i * 3;
      
      // Calculate pattern based on tone
      let intensity = 0.3;
      
      switch (currentTone) {
        case 'happy':
        case 'energetic':
          intensity = 0.8 + Math.sin(time * 4 + i * 0.1) * 0.4;
          break;
        case 'sad':
        case 'melancholy':
          intensity = 0.2 + Math.sin(time * 1 + i * 0.05) * 0.2;
          break;
        case 'calm':
          intensity = 0.5 + Math.sin(time * 2 + i * 0.02) * 0.3;
          break;
        case 'angry':
          intensity = 0.9 + Math.sin(time * 6 + i * 0.2) * 0.3;
          break;
        default:
          intensity = 0.4 + Math.sin(time * 2 + i * 0.1) * 0.2;
      }

      // Apply tone intensity
      intensity *= toneIntensity;

      // Add beat pulse effect
      if (beatIntensity > 0) {
        intensity += beatIntensity * 0.6;
      }

      // Ensure intensity is within valid range
      intensity = Math.max(0.1, Math.min(1, intensity));

      // Set color (keeping it white/grayscale)
      colorArray[baseIndex] = intensity;
      colorArray[baseIndex + 1] = intensity;
      colorArray[baseIndex + 2] = intensity;

      // Add slight position animation for beats
      if (beatIntensity > 0.5) {
        const originalRadius = Math.sqrt(
          positions[baseIndex] ** 2 + 
          positions[baseIndex + 1] ** 2 + 
          positions[baseIndex + 2] ** 2
        );
        const pulseRadius = originalRadius * (1 + beatIntensity * 0.2);
        const normalizedRadius = originalRadius > 0 ? pulseRadius / originalRadius : 1;
        
        positionArray[baseIndex] = positions[baseIndex] * normalizedRadius;
        positionArray[baseIndex + 1] = positions[baseIndex + 1] * normalizedRadius;
        positionArray[baseIndex + 2] = positions[baseIndex + 2] * normalizedRadius;
      }
    }

    pointsRef.current.geometry.attributes.color.needsUpdate = true;
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Rotate the entire sphere based on tone
    if (isPlaying) {
      const rotationSpeed = toneIntensity * 0.5;
      groupRef.current.rotation.y += rotationSpeed * 0.01;
      groupRef.current.rotation.x += rotationSpeed * 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

const SphereVisualizer: React.FC<SphereVisualizerProps> = (props) => {
  return (
    <div className="w-full h-96 border border-gray-600 rounded-lg bg-black overflow-hidden">
      <Canvas camera={{ position: [0, 0, 6], fov: 75 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <AnimatedSphere {...props} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={10}
        />
      </Canvas>
    </div>
  );
};

export default SphereVisualizer;
