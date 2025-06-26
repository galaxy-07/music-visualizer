
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Comet: React.FC<{ position: [number, number, number]; speed: number; size: number }> = ({
  position,
  speed,
  size,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);

  const trailPositions = useMemo(() => {
    const positions = new Float32Array(50 * 3);
    for (let i = 0; i < 50; i++) {
      positions[i * 3] = position[0];
      positions[i * 3 + 1] = position[1];
      positions[i * 3 + 2] = position[2];
    }
    return positions;
  }, [position]);

  useFrame((state) => {
    if (!meshRef.current || !trailRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // Move comet in a curved path
    meshRef.current.position.x = position[0] + Math.sin(time * speed) * 2;
    meshRef.current.position.y = position[1] + Math.cos(time * speed * 0.7) * 1.5;
    meshRef.current.position.z = position[2] + Math.sin(time * speed * 0.5) * 1;

    // Update trail
    const trailArray = trailRef.current.geometry.attributes.position.array as Float32Array;
    
    // Shift existing trail positions
    for (let i = trailArray.length - 3; i >= 3; i -= 3) {
      trailArray[i] = trailArray[i - 3];
      trailArray[i + 1] = trailArray[i - 2];
      trailArray[i + 2] = trailArray[i - 1];
    }
    
    // Add new position at the front
    trailArray[0] = meshRef.current.position.x;
    trailArray[1] = meshRef.current.position.y;
    trailArray[2] = meshRef.current.position.z;

    trailRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial color="white" transparent opacity={0.8} />
      </mesh>
      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={trailPositions.length / 3}
            array={trailPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={size * 0.5}
          color="white"
          transparent
          opacity={0.3}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

const CometBackground: React.FC = () => {
  const comets = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
      ] as [number, number, number],
      speed: 0.1 + Math.random() * 0.3,
      size: 0.02 + Math.random() * 0.03,
    }));
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.1} />
        {comets.map((comet, index) => (
          <Comet
            key={index}
            position={comet.position}
            speed={comet.speed}
            size={comet.size}
          />
        ))}
      </Canvas>
    </div>
  );
};

export default CometBackground;
