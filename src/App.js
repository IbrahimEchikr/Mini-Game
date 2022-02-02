import React, { Suspense,useRef, useState } from "react";
import { Canvas, useLoader, useFrame } from "react-three-fiber";
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { TextureLoader } from "three";
import {shipPositionState,enemyPositionState,laserPositionState,scoreState} from "./Components/State";
import "./style.css";


const LASER_RANGE = 100;
const LASER_Z_VELOCITY = 1;
const ENEMY_SPEED = 0.01;
const GROUND_HEIGHT = -80;


//Retourne le terrain en dessous du joueur
function Terrain() {
    const terrain = useRef();
    useFrame(() => {
    terrain.current.position.z += 0.4;
});

return (  
    <mesh
        visible
        position={[0, GROUND_HEIGHT, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        ref={terrain}
        >
        <planeBufferGeometry attach="geometry" args={[10000, 10000, 5000, 128]} />
        <meshStandardMaterial
            attach="material"
            color="black"
            roughness={1}
            metalness={0}
            wireframe
        />
    </mesh>
    );
}

function ArWing() {
  const [shipPosition, setShipPosition] = useRecoilState(shipPositionState);
  useFrame(({ mouse }) => {
    setShipPosition({
      position: { x: mouse.x * 6, y: mouse.y * 2 },
      rotation: { z: -mouse.x * 0.5, x: -mouse.x * 0.5, y: -mouse.y * 0.2 }
    });
  });



  const { nodes } = useLoader(GLTFLoader, "models/arwing.glb");
  return (
    <group> 
      <mesh visible geometry={nodes.Default.geometry}>
        <meshStandardMaterial
          attach="material"
          color="red"
          roughness={1}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

function Target() {
  const frontTarget = useRef();

  const loader = new TextureLoader();
  const texture = loader.load("Sniper-Aim.png");

  useFrame(({ mouse }) => {

    frontTarget.current.position.y = -mouse.y * 20;
    frontTarget.current.position.x = -mouse.x * 60;
  });
  return (
    <group>
      <sprite position={[0, 0, -3]} ref={frontTarget}>
        <spriteMaterial attach="material" map={texture} color="red" />
      </sprite>
    </group>
  );
}

function Enemies() {
  const enemies = useRecoilValue(enemyPositionState);
  return (
    <group>
      {enemies.map((enemy) => (
        <mesh position={[enemy.x, enemy.y, enemy.z]} key={`${enemy.x}`}>
          <sphereBufferGeometry attach="geometry" args={[3, 7, 8]} />
          <meshStandardMaterial attach="material" color="yellow" wireframe />
        </mesh>
      ))}
    </group>
  );
}

function LaserController() {
  const shipPosition = useRecoilValue(shipPositionState);
  const [lasers, setLasers] = useRecoilState(laserPositionState);
  return (
    <mesh
      position={[0, 0, -8]}
      onClick={() =>
        setLasers([
          ...lasers,
          {
            id: Math.random(),
            x: 0,
            y: 0,
            z: 0,
            velocity: [shipPosition.rotation.x * 6, shipPosition.rotation.y * 5]
          }
        ])
      }
    >
      <planeBufferGeometry attach="geometry" args={[40, 40]} />
      <meshStandardMaterial
        attach="material"
        color="red"
        emissive="#ff0860"
        visible={false}
      />
    </mesh>
  );
}
function Lasers() {
  const lasers = useRecoilValue(laserPositionState);
  return (
    <group>
      {lasers.map((laser) => (
        <mesh position={[laser.x, laser.y, laser.z]} key={`${laser.id}`}>
          <boxBufferGeometry attach="geometry" args={[2, 2, 2]} />
          <meshStandardMaterial attach="material" emissive="pink" wireframe />
        </mesh>
      ))}
    </group>
  );
}

function distance(p1, p2) {
  const a = p2.x - p1.x;
  const b = p2.y - p1.y;
  const c = p2.z - p1.z;

  return Math.sqrt(a * a + b * b + c * c);
}

function GameTimer() {
  const [enemies, setEnemies] = useRecoilState(enemyPositionState);
  const [lasers, setLaserPositions] = useRecoilState(laserPositionState);
  const [score, setScore] = useRecoilState(scoreState);

  useFrame(({ mouse }) => {

    const hitEnemies = enemies
      ? enemies.map(
          (enemy) =>
            lasers.filter(
              () =>
                lasers.filter((laser) => distance(laser, enemy) < 3).length > 0
            ).length > 0
        )
      : [];

    if (hitEnemies.includes(true) && enemies.length > 0) {
      setScore(score + 1);
      console.log("Cible toucher");
    }

    setEnemies(
      enemies
        .map((enemy) => ({ x: enemy.x, y: enemy.y, z: enemy.z + ENEMY_SPEED }))
        .filter((enemy, idx) => !hitEnemies[idx] && enemy.z < 0)
    );
    setLaserPositions(
      lasers
        .map((laser) => ({
          id: laser.id,
          x: laser.x + laser.velocity[0],
          y: laser.y + laser.velocity[1],
          z: laser.z - LASER_Z_VELOCITY,
          velocity: laser.velocity
        }))
        .filter((laser) => laser.z > -LASER_RANGE && laser.y > GROUND_HEIGHT)
    );
  });
  return null;
}



export default function App() {
  return (
    <>
    <h1>Mini-Jeux</h1>
    <Canvas style={{ background: "black" }}>
    <RecoilRoot>
          <directionalLight intensity={1} />
          <ambientLight intensity={0.1} />
          <Terrain />
          <Suspense fallback={0}>
            <ArWing />
          </Suspense>
          <Target />
          <Enemies />
          <Lasers />
          <LaserController />
          <GameTimer />
    </RecoilRoot>
    </Canvas>
  

    </>
  );
}
