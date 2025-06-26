
import React, { useRef, useMemo, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import SphereControls from './SphereControls';

interface SphereVisualizerProps {
  currentTone: string;
  currentTime: number;
  beats: number[];
  isPlaying: boolean;
}

const AnimatedSphere: React.FC<SphereVisualizerProps & { controlsRef: React.RefObject<any> }> = ({
  currentTone,
  currentTime,
  beats,
  isPlaying,
  controlsRef,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const { camera } = useThree();
  
  // Reset position when song changes
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.set(0, 0, 0);
      groupRef.current.position.set(0, 0, 0);
    }
    if (camera) {
      camera.position.set(0, 0, 6);
      camera.lookAt(0, 0, 0);
    }
  }, [beats.length, camera]); // Reset when new song is uploaded (beats array changes)

  const getCurrentBeatIntensity = useCallback(() => {
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
  }, [beats, currentTime, isPlaying]);

  const getToneColor = useCallback((tone: string) => {
    const colorMap: { [key: string]: [number, number, number] } = {
      happy: [1.0, 0.8, 0.2], // Golden yellow
      energetic: [1.0, 0.3, 0.1], // Bright orange
      sad: [0.2, 0.4, 0.8], // Blue
      melancholy: [0.4, 0.2, 0.6], // Purple
      calm: [0.2, 0.8, 0.6], // Teal
      angry: [0.9, 0.1, 0.1], // Red
      neutral: [0.7, 0.7, 0.7], // Gray
    };
    return colorMap[tone] || [0.5, 0.5, 0.5];
  }, []);

  const { positions, colors } = useMemo(() => {
    const pointCount = 3000;
    const positions = new Float32Array(pointCount * 3);
    const colors = new Float32Array(pointCount * 3);

    for (let i = 0; i < pointCount; i++) {
      const theta = Math.acos(1 - 2 * (i / pointCount));
      const phi = Math.PI * (1 + Math.sqrt(5)) * i;
      const radius = 2 + Math.random() * 0.8;
      
      positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.cos(theta);

      const baseColor = getToneColor(currentTone);
      colors[i * 3] = baseColor[0];
      colors[i * 3 + 1] = baseColor[1];
      colors[i * 3 + 2] = baseColor[2];
    }

    return { positions, colors };
  }, [currentTone, getToneColor]);

  useFrame((state) => {
    if (!pointsRef.current || !groupRef.current) return;

    const beatIntensity = getCurrentBeatIntensity();
    const time = state.clock.getElapsedTime();
    const toneColor = getToneColor(currentTone);

    const colorArray = pointsRef.current.geometry.attributes.color.array as Float32Array;
    const positionArray = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < colorArray.length / 3; i++) {
      const baseIndex = i * 3;
      
      let intensity = 0.3;
      let colorMultiplier = [1, 1, 1];
      
      switch (currentTone) {
        case 'happy':
        case 'energetic':
          intensity = 0.8 + Math.sin(time * 4 + i * 0.1) * 0.4;
          colorMultiplier = [1.2, 1.0, 0.6];
          break;
        case 'sad':
        case 'melancholy':
          intensity = 0.3 + Math.sin(time * 1 + i * 0.05) * 0.3;
          colorMultiplier = [0.6, 0.8, 1.2];
          break;
        case 'calm':
          intensity = 0.5 + Math.sin(time * 2 + i * 0.02) * 0.3;
          colorMultiplier = [0.8, 1.2, 1.1];
          break;
        case 'angry':
          intensity = 0.9 + Math.sin(time * 6 + i * 0.2) * 0.3;
          colorMultiplier = [1.3, 0.7, 0.7];
          break;
        default:
          intensity = 0.4 + Math.sin(time * 2 + i * 0.1) * 0.2;
      }

      if (beatIntensity > 0) {
        intensity += beatIntensity * 0.8;
        const pulseIntensity = 1 + beatIntensity * 0.5;
        colorMultiplier = colorMultiplier.map(c => c * pulseIntensity);
      }

      intensity = Math.max(0.1, Math.min(1.5, intensity));

      colorArray[baseIndex] = toneColor[0] * intensity * colorMultiplier[0];
      colorArray[baseIndex + 1] = toneColor[1] * intensity * colorMultiplier[1];
      colorArray[baseIndex + 2] = toneColor[2] * intensity * colorMultiplier[2];

      if (beatIntensity > 0.3) {
        const originalRadius = Math.sqrt(
          positions[baseIndex] ** 2 + 
          positions[baseIndex + 1] ** 2 + 
          positions[baseIndex + 2] ** 2
        );
        const pulseRadius = originalRadius * (1 + beatIntensity * 0.3);
        const normalizedRadius = originalRadius > 0 ? pulseRadius / originalRadius : 1;
        
        positionArray[baseIndex] = positions[baseIndex] * normalizedRadius;
        positionArray[baseIndex + 1] = positions[baseIndex + 1] * normalizedRadius;
        positionArray[baseIndex + 2] = positions[baseIndex + 2] * normalizedRadius;
      } else {
        positionArray[baseIndex] = positions[baseIndex];
        positionArray[baseIndex + 1] = positions[baseIndex + 1];
        positionArray[baseIndex + 2] = positions[baseIndex + 2];
      }
    }

    pointsRef.current.geometry.attributes.color.needsUpdate = true;
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    if (isPlaying) {
      const rotationSpeed = beatIntensity > 0 ? 0.02 : 0.005;
      groupRef.current.rotation.y += rotationSpeed;
      groupRef.current.rotation.x += rotationSpeed * 0.3;
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
          size={0.04}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

const SphereVisualizer: React.FC<SphereVisualizerProps> = (props) => {
  const controlsRef = useRef<any>(null);

  const handleZoomIn = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(0.9);
      controlsRef.current.update();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.dollyOut(0.9);
      controlsRef.current.update();
    }
  }, []);

  const handleRotateLeft = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.rotateLeft(0.2);
      controlsRef.current.update();
    }
  }, []);

  const handleRotateRight = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.rotateLeft(-0.2);
      controlsRef.current.update();
    }
  }, []);

  const handleReset = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, []);

  return (
    <div className="relative w-full h-96 rounded-2xl bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden border border-white/10 shadow-2xl">
      <Canvas camera={{ position: [0, 0, 6], fov: 75 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#4f46e5" />
        <AnimatedSphere {...props} controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={12}
          dampingFactor={0.05}
          enableDamping={true}
        />
      </Canvas>
      <SphereControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRotateLeft={handleRotateLeft}
        onRotateRight={handleRotateRight}
        onReset={handleReset}
      />
    </div>
  );
};

export default SphereVisualizer;
