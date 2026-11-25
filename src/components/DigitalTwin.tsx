import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Text, QuadraticBezierLine } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

interface DigitalTwinProps {
  deviceId: string;
  deviceType: string;
  temperature: number;
  status?: string;
}

// Procedural 3D model for Coal Power Plant thermal assets
function ProceduralDevice({ deviceId, deviceType, status = 'healthy' }: { deviceId: string, deviceType: string, status?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const currentColor = useMemo(() => {
    if (status === 'critical') return new THREE.Color('#ef4444'); // Red
    if (status === 'warning') return new THREE.Color('#f59e0b');  // Yellow
    return new THREE.Color('#10b981');                            // Green
  }, [status]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003; // Ambient rotation
    }
    
    if (coreRef.current) {
      if (status === 'critical') {
        const pulse = Math.sin(state.clock.elapsedTime * 8) * 0.5 + 0.5;
        (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 2 + pulse * 4;
      } else if (status === 'warning') {
        const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.5 + 0.5;
        (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1 + pulse * 2;
      } else {
        (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1;
      }
    }
  });

  const typeLower = (deviceType || '').toLowerCase();

  return (
    <group ref={groupRef} scale={[0.9, 0.9, 0.9]}>
      {/* Heavy Steel Base Platform */}
      <mesh position={[0, -1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 0.2, 3.5]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Nameplate on Base Platform */}
      <Text
        position={[0, -1.2, 1.76]}
        rotation={[0, 0, 0]}
        fontSize={0.22}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {deviceId}
      </Text>

      {/* Piping Infrastructure */}
      <group>
        <mesh position={[-1.6, -0.4, 1.1]} castShadow receiveShadow>
          <cylinderGeometry args={[0.16, 0.16, 1.6, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.4} />
        </mesh>
        <mesh position={[1.7, -0.6, -0.9]} castShadow receiveShadow>
          <cylinderGeometry args={[0.18, 0.18, 1.2, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
        </mesh>
        
        {/* Instrumentation Signal Lines */}
        <QuadraticBezierLine
          start={[-2, -1.1, -1]}
          end={[-0.5, 0.6, 0]}
          mid={[-1.5, -0.4, -0.5]}
          color="#f97316"
          lineWidth={2}
        />
        <QuadraticBezierLine
          start={[-1.8, -1.1, -1.2]}
          end={[0.5, 0.4, 0.2]}
          mid={[-0.8, -0.6, -0.6]}
          color="#38bdf8"
          lineWidth={2}
        />
      </group>

      {/* --- BOILER GEOMETRY (Supercritical Steam Generator Tower) --- */}
      {typeLower.includes('boiler') && (
        <group position={[0, -0.1, 0]}>
          {/* Main Vertical Steam Drum Column */}
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.1, 1.1, 2.6, 32]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.3} />
          </mesh>
          {/* Top Steam Header Dome */}
          <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
            <sphereGeometry args={[1.1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Water Tube Risers */}
          {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => (
            <mesh key={i} position={[x, 0.3, 1.15]} castShadow>
              <cylinderGeometry args={[0.07, 0.07, 2.2, 16]} />
              <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
          {/* Glowing Superheated Core */}
          <mesh ref={coreRef} position={[0, 0.4, 0]}>
            <cylinderGeometry args={[1.12, 1.12, 2.4, 32]} />
            <meshStandardMaterial 
              color="#000000" emissive={currentColor} emissiveIntensity={1}
              transparent opacity={0.35} wireframe
            />
          </mesh>
        </group>
      )}

      {/* --- FURNACE GEOMETRY (Pulverized Coal Combustion Chamber) --- */}
      {typeLower.includes('furnace') && (
        <group position={[0, -0.1, 0]}>
          {/* Main Firebox Enclosure */}
          <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.4, 2.4, 2.0]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.6} />
          </mesh>
          {/* Exhaust Chimney Duct */}
          <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.5, 0.7, 1.2, 24]} />
            <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* Burner Injection Ports */}
          {[-0.7, 0.7].map((x, i) => (
            <mesh key={i} position={[x, -0.2, 1.05]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.25, 0.25, 0.4, 16]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
          {/* Internal Fireball Core */}
          <mesh ref={coreRef} position={[0, 0.2, 0]}>
            <boxGeometry args={[2.45, 2.45, 2.05]} />
            <meshStandardMaterial 
              color="#000000" emissive={currentColor} emissiveIntensity={1.2}
              transparent opacity={0.4} wireframe
            />
          </mesh>
        </group>
      )}

      {/* --- HEAT EXCHANGER GEOMETRY (Shell & Tube / Economizer / Condenser) --- */}
      {(!typeLower.includes('boiler') && !typeLower.includes('furnace')) && (
        <group position={[0, -0.1, 0]}>
          {/* Horizontal Shell Cylinder */}
          <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
            <cylinderGeometry args={[0.9, 0.9, 3.2, 32]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
          </mesh>
          {/* End Flange Caps */}
          {[-1.6, 1.6].map((x, i) => (
            <mesh key={i} position={[x, 0.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[1.05, 1.05, 0.2, 32]} />
              <meshStandardMaterial color="#475569" metalness={0.95} roughness={0.2} />
            </mesh>
          ))}
          {/* Inlet & Outlet Nozzles */}
          <mesh position={[-0.8, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.25, 0.8, 16]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[0.8, -0.8, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.25, 0.8, 16]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.3} />
          </mesh>
          {/* Glowing Tube Bundle Core */}
          <mesh ref={coreRef} position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.92, 0.92, 3.0, 32]} />
            <meshStandardMaterial 
              color="#000000" emissive={currentColor} emissiveIntensity={1}
              transparent opacity={0.35} wireframe
            />
          </mesh>
        </group>
      )}

      {/* Floating Thermal Wave Rings */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.8, 0.02, 16, 64]} />
          <meshBasicMaterial color={currentColor} transparent opacity={0.5} />
        </mesh>
      </Float>
    </group>
  );
}

export function DigitalTwin({ deviceId, deviceType, temperature, status = 'healthy' }: DigitalTwinProps) {
  return (
    <div className="w-full h-full min-h-[300px] relative rounded-md overflow-hidden bg-gradient-to-b from-[#09090b] to-[#121212] border border-[#262626] group">
      {/* Overlay UI */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className="text-white font-bold text-sm flex items-center gap-2 uppercase tracking-wide">
          <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] animate-pulse ${status === 'critical' ? 'bg-red-500 text-red-500' : status === 'warning' ? 'bg-amber-500 text-amber-500' : 'bg-green-500 text-green-500'}`}></div>
          {deviceType.replace('_', ' ')} Digital Twin
        </h3>
        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
          Live Thermal Core: {temperature ? `${temperature.toFixed(1)}°C` : 'N/A'}
        </p>
      </div>

      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <div className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800/80 border border-slate-700/60 text-slate-300 backdrop-blur-sm">
          NextOps 3D Mesh
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
          Drag to orbit • Scroll to zoom
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [3.8, 2.8, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full"
      >
        <color attach="background" args={['#09090b']} />
        
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <directionalLight position={[-10, 5, -5]} intensity={0.5} color="#38bdf8" />
        <pointLight position={[0, -2, 0]} intensity={0.5} color="#f97316" />

        {/* Device Model */}
        <ProceduralDevice deviceId={deviceId} deviceType={deviceType} status={status} />

        {/* Orbit Controls */}
        <OrbitControls 
          enablePan={false}
          minDistance={3}
          maxDistance={9}
          maxPolarAngle={Math.PI / 2 + 0.1}
          autoRotate={false}
        />

        {/* Environment & Post Processing */}
        <Environment preset="city" />
        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.2} 
            luminanceSmoothing={0.9} 
            height={300} 
            intensity={1.2} 
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
