"use client"

import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import type * as THREE from "three"
import { MeshDistortMaterial } from "@react-three/drei"

export default function LoadingPlaceholder() {
  const groupRef = useRef<THREE.Group>(null)
  const sphereRef = useRef<THREE.Mesh>(null)
  const torusRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()

    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.2
    }

    if (sphereRef.current) {
      sphereRef.current.position.y = Math.sin(time) * 0.2
    }

    if (torusRef.current) {
      torusRef.current.rotation.x = time * 0.5
      torusRef.current.rotation.z = time * 0.2
    }
  })

  return (
    <group ref={groupRef}>
      {/* Core sphere */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.7, 64, 64]} />
        <MeshDistortMaterial color="#7c3aed" distort={0.3} speed={2} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Orbiting torus */}
      <mesh ref={torusRef}>
        <torusGeometry args={[1.2, 0.05, 16, 100]} />
        <meshStandardMaterial
          color="#7c3aed"
          emissive="#7c3aed"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Ambient particles */}
      {Array.from({ length: 50 }).map((_, i) => {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.random() * Math.PI
        const r = 1.5 + Math.random() * 1

        const x = r * Math.sin(phi) * Math.cos(theta)
        const y = r * Math.sin(phi) * Math.sin(theta)
        const z = r * Math.cos(phi)

        return (
          <mesh key={i} position={[x, y, z]} scale={0.03 + Math.random() * 0.03}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial
              color="#c4b5fd"
              emissive="#c4b5fd"
              emissiveIntensity={0.5}
              transparent
              opacity={0.7}
            />
          </mesh>
        )
      })}
    </group>
  )
}
