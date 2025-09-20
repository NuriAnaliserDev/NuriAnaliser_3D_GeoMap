import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function Point({ position, color = 'red', label }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {label && (
        <Text
          position={[0, 0.2, 0]}
          fontSize={0.1}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

function Plane({ points, strike, dip, dipDirection }) {
  const planeRef = useRef();
  
  const planeGeometry = useMemo(() => {
    if (!points || points.length !== 3) return null;
    
    const [p1, p2, p3] = points;
    const geometry = new THREE.PlaneGeometry(2, 2, 32, 32);
    
    // Tekislik normal vektorini hisoblash
    const v1 = new THREE.Vector3(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
    const v2 = new THREE.Vector3(p3.x - p1.x, p3.y - p1.y, p3.z - p1.z);
    const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();
    
    // Tekislikni nuqtalar orasidagi markazga joylashtirish
    const center = new THREE.Vector3(
      (p1.x + p2.x + p3.x) / 3,
      (p1.y + p2.y + p3.y) / 3,
      (p1.z + p2.z + p3.z) / 3
    );
    
    // Tekislikni normal vektor bo'yicha aylantirish
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    
    geometry.translate(center.x, center.y, center.z);
    geometry.applyQuaternion(quaternion);
    
    return geometry;
  }, [points]);

  if (!planeGeometry) return null;

  return (
    <mesh ref={planeRef} geometry={planeGeometry}>
      <meshBasicMaterial 
        color="lightblue" 
        transparent 
        opacity={0.3} 
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Arrow({ start, end, color = 'yellow' }) {
  const direction = useMemo(() => {
    const dir = new THREE.Vector3(end.x - start.x, end.y - start.y, end.z - start.z);
    return dir.normalize();
  }, [start, end]);

  const position = useMemo(() => {
    return new THREE.Vector3(
      (start.x + end.x) / 2,
      (start.y + end.y) / 2,
      (start.z + end.z) / 2
    );
  }, [start, end]);

  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <coneGeometry args={[0.05, 0.2, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

export default function Visualization3D({ points, strike, dip, dipDirection }) {
  if (!points || points.length !== 3) {
    return (
      <div style={{ 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px',
        border: '2px dashed #ccc'
      }}>
        <p>3 ta nuqta kiriting va hisoblash tugmasini bosing</p>
      </div>
    );
  }

  const [p1, p2, p3] = points;

  return (
    <div style={{ height: '400px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Koordinata o'qlari */}
        <Grid args={[10, 10]} />
        
        {/* 3 ta nuqta */}
        <Point position={[p1.x, p1.y, p1.z]} color="red" label="P1" />
        <Point position={[p2.x, p2.y, p2.z]} color="green" label="P2" />
        <Point position={[p3.x, p3.y, p3.z]} color="blue" label="P3" />
        
        {/* Nuqtalar orasidagi chiziqlar */}
        <Arrow start={p1} end={p2} color="orange" />
        <Arrow start={p1} end={p3} color="purple" />
        
        {/* Tekislik */}
        <Plane points={points} strike={strike} dip={dip} dipDirection={dipDirection} />
        
        {/* Strike yo'nalishi */}
        {strike && (
          <Arrow 
            start={{ x: 0, y: 0, z: 0 }} 
            end={{ 
              x: Math.cos(strike * Math.PI / 180) * 2, 
              y: Math.sin(strike * Math.PI / 180) * 2, 
              z: 0 
            }} 
            color="yellow" 
          />
        )}
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
}
