import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Plane, Text, Box, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

// Enhanced Scene component with multiple layers and interactive features
function Scene({ 
  points, 
  strike, 
  dip, 
  dipDirection, 
  showStrikeLine = true,
  showDipLine = true,
  showNormal = true,
  planeOpacity = 0.6,
  pointSize = 0.1,
  onPointClick
}) {
  const planeRef = useRef();
  const strikeLineRef = useRef();
  const dipLineRef = useRef();
  const normalRef = useRef();
  const { camera } = useThree();

  // Calculate plane orientation from strike and dip
  useFrame(() => {
    if (planeRef.current && strike !== undefined && dip !== undefined) {
      // Convert strike and dip to normal vector
      const strikeRad = THREE.MathUtils.degToRad(strike);
      const dipRad = THREE.MathUtils.degToRad(dip);

      // Calculate normal vector components
      const nx = Math.sin(strikeRad) * Math.sin(dipRad);
      const ny = -Math.cos(strikeRad) * Math.sin(dipRad);
      const nz = Math.cos(dipRad);

      const normal = new THREE.Vector3(nx, ny, nz).normalize();

      // Create a quaternion from the normal vector
      const quaternion = new THREE.Quaternion();
      const up = new THREE.Vector3(0, 0, 1); // Z-axis is up
      quaternion.setFromUnitVectors(up, normal);
      planeRef.current.setRotationFromQuaternion(quaternion);

      // Update strike line (horizontal line on the plane)
      if (strikeLineRef.current && showStrikeLine) {
        const strikeDirection = new THREE.Vector3(
          Math.cos(strikeRad),
          Math.sin(strikeRad),
          0
        );
        strikeLineRef.current.position.copy(strikeDirection.multiplyScalar(5));
        strikeLineRef.current.lookAt(strikeDirection.multiplyScalar(10));
      }

      // Update dip line (line showing dip direction)
      if (dipLineRef.current && showDipLine) {
        const dipDirRad = THREE.MathUtils.degToRad(dipDirection);
        const dipDirectionVec = new THREE.Vector3(
          Math.cos(dipDirRad),
          Math.sin(dipDirRad),
          -Math.tan(dipRad)
        ).normalize();
        dipLineRef.current.position.copy(dipDirectionVec.multiplyScalar(3));
        dipLineRef.current.lookAt(dipDirectionVec.multiplyScalar(6));
      }

      // Update normal vector
      if (normalRef.current && showNormal) {
        normalRef.current.position.copy(normal.multiplyScalar(2));
        normalRef.current.lookAt(normal.multiplyScalar(4));
      }
    }
  });

  // Calculate center point for better visualization
  const centerPoint = useMemo(() => {
    if (!points || points.length === 0) return [0, 0, 0];
    const sum = points.reduce((acc, p) => ({
      x: acc.x + p.x,
      y: acc.y + p.y,
      z: acc.z + p.z
    }), { x: 0, y: 0, z: 0 });
    return [
      sum.x / points.length,
      sum.y / points.length,
      sum.z / points.length
    ];
  }, [points]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} />

      {/* Input Points with labels */}
      {points && points.map((p, index) => (
        <group key={index}>
          <mesh 
            position={[p.x, p.y, p.z]}
            onClick={(e) => {
              e.stopPropagation();
              onPointClick && onPointClick(index, p);
            }}
          >
            <sphereGeometry args={[pointSize, 16, 16]} />
            <meshStandardMaterial 
              color={index === 0 ? "#ff0000" : index === 1 ? "#00ff00" : "#0000ff"} 
              emissive={index === 0 ? "#330000" : index === 1 ? "#003300" : "#000033"}
            />
          </mesh>
          <Text
            position={[p.x, p.y, p.z + 0.5]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            P{index + 1}
          </Text>
        </group>
      ))}

      {/* Center point */}
      {points && points.length > 0 && (
        <mesh position={centerPoint}>
          <boxGeometry args={[0.05, 0.05, 0.05]} />
          <meshStandardMaterial color="yellow" />
        </mesh>
      )}

      {/* Plane representing strike and dip */}
      {strike !== undefined && dip !== undefined && (
        <Plane 
          ref={planeRef} 
          args={[15, 15]} 
          position={centerPoint}
        >
          <meshStandardMaterial 
            color="lightblue" 
            transparent 
            opacity={planeOpacity} 
            side={THREE.DoubleSide}
            wireframe={false}
          />
        </Plane>
      )}

      {/* Strike line */}
      {showStrikeLine && strike !== undefined && (
        <group ref={strikeLineRef}>
          <Box args={[10, 0.1, 0.1]} position={[0, 0, 0]}>
            <meshStandardMaterial color="red" />
          </Box>
          <Text
            position={[0, 0, 0.5]}
            fontSize={0.4}
            color="red"
            anchorX="center"
            anchorY="middle"
          >
            Strike: {strike.toFixed(1)}°
          </Text>
        </group>
      )}

      {/* Dip line */}
      {showDipLine && dip !== undefined && dipDirection !== undefined && (
        <group ref={dipLineRef}>
          <Box args={[6, 0.1, 0.1]} position={[0, 0, 0]}>
            <meshStandardMaterial color="green" />
          </Box>
          <Text
            position={[0, 0, 0.5]}
            fontSize={0.4}
            color="green"
            anchorX="center"
            anchorY="middle"
          >
            Dip: {dip.toFixed(1)}°
          </Text>
        </group>
      )}

      {/* Normal vector */}
      {showNormal && strike !== undefined && dip !== undefined && (
        <group ref={normalRef}>
          <Box args={[0.1, 0.1, 4]} position={[0, 0, 0]}>
            <meshStandardMaterial color="yellow" />
          </Box>
          <Text
            position={[0, 0, 2.5]}
            fontSize={0.3}
            color="yellow"
            anchorX="center"
            anchorY="middle"
          >
            Normal
          </Text>
        </group>
      )}

      {/* Coordinate axes */}
      <axesHelper args={[8]} />
      
      {/* Grid */}
      <gridHelper args={[20, 20, '#444444', '#444444']} />
    </>
  );
}

// Main Enhanced Visualization3D component with controls
export default function EnhancedVisualization3D({ 
  points, 
  strike, 
  dip, 
  dipDirection,
  onPointClick,
  className = ""
}) {
  const [controls, setControls] = useState({
    showStrikeLine: true,
    showDipLine: true,
    showNormal: true,
    planeOpacity: 0.6,
    pointSize: 0.1
  });

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`visualization-3d ${className} ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Controls */}
      <div className="viz-controls">
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.showStrikeLine}
              onChange={(e) => setControls(prev => ({ ...prev, showStrikeLine: e.target.checked }))}
            />
            Strike Line
          </label>
          <label>
            <input
              type="checkbox"
              checked={controls.showDipLine}
              onChange={(e) => setControls(prev => ({ ...prev, showDipLine: e.target.checked }))}
            />
            Dip Line
          </label>
          <label>
            <input
              type="checkbox"
              checked={controls.showNormal}
              onChange={(e) => setControls(prev => ({ ...prev, showNormal: e.target.checked }))}
            />
            Normal Vector
          </label>
        </div>
        
        <div className="control-group">
          <label>
            Plane Opacity: {controls.planeOpacity.toFixed(2)}
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={controls.planeOpacity}
              onChange={(e) => setControls(prev => ({ ...prev, planeOpacity: parseFloat(e.target.value) }))}
            />
          </label>
          <label>
            Point Size: {controls.pointSize.toFixed(2)}
            <input
              type="range"
              min="0.05"
              max="0.5"
              step="0.05"
              value={controls.pointSize}
              onChange={(e) => setControls(prev => ({ ...prev, pointSize: parseFloat(e.target.value) }))}
            />
          </label>
        </div>

        <button 
          className="fullscreen-btn"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? "⤓" : "⤢"}
        </button>
      </div>

      {/* 3D Canvas */}
      <div className="canvas-container">
        <Canvas 
          camera={{ position: [8, 8, 8], fov: 60 }}
          style={{ width: '100%', height: '100%' }}
        >
          <Scene 
            points={points} 
            strike={strike} 
            dip={dip} 
            dipDirection={dipDirection}
            onPointClick={onPointClick}
            {...controls}
          />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={50}
          />
        </Canvas>
      </div>

      {/* Info Panel */}
      {(strike !== undefined && dip !== undefined) && (
        <div className="info-panel">
          <h4>Geological Analysis</h4>
          <div className="info-item">
            <span className="label">Strike:</span>
            <span className="value">{strike.toFixed(2)}°</span>
          </div>
          <div className="info-item">
            <span className="label">Dip:</span>
            <span className="value">{dip.toFixed(2)}°</span>
          </div>
          <div className="info-item">
            <span className="label">Dip Direction:</span>
            <span className="value">{dipDirection?.toFixed(2)}°</span>
          </div>
        </div>
      )}
    </div>
  );
}
