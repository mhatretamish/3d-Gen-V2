"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, useProgress, Stars } from "@react-three/drei"
import { Suspense, useState, useEffect } from "react"
import SceneSetup from "./scene-setup"
import ModelComponent from "./model-component"
import LoadingPlaceholder from "./loading-placeholder"
import { motion } from "framer-motion"

function ProgressIndicator() {
  const { progress } = useProgress()
  const [showProgress, setShowProgress] = useState(false)

  useEffect(() => {
    // Only show progress if loading takes more than 500ms
    const timer = setTimeout(() => {
      setShowProgress(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (!showProgress) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute bottom-6 left-1/2 transform -translate-x-1/2 glass-effect px-4 py-2 rounded-full text-sm"
    >
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-gradient-premium mr-2 animate-pulse"></div>
        <span>Loading model: {Math.round(progress)}%</span>
      </div>
    </motion.div>
  )
}

export default function ModelViewer({ modelUrl }: { modelUrl: string | null }) {
  return (
    <div className="w-full h-[100dvh] bg-gradient-dark">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <SceneSetup />
        <ambientLight intensity={0.3} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <Suspense fallback={<LoadingPlaceholder />}>
          {modelUrl ? <ModelComponent url={modelUrl} /> : <LoadingPlaceholder />}
        </Suspense>

        <OrbitControls
          minDistance={3}
          maxDistance={10}
          enableZoom={true}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
        <Environment preset="night" />
      </Canvas>

      {modelUrl && (
        <Suspense fallback={null}>
          <ProgressIndicator />
        </Suspense>
      )}
    </div>
  )
}
