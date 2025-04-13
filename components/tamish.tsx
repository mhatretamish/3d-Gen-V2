"use client"

import { useState, useEffect, useRef } from "react"
import { ExternalLink, Download, ArrowLeft } from "lucide-react"
import type { FormValues } from "@/lib/form-schema"
import { submitRodinJob, checkJobStatus, downloadModel } from "@/lib/api-service"
import ModelViewer from "./model-viewer"
import Form from "./form"
import StatusIndicator from "./status-indicator"
import OptionsDialog from "./options-dialog"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function Tamish() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [jobStatuses, setJobStatuses] = useState<Array<{ uuid: string; status: string }>>([])
  const [showOptions, setShowOptions] = useState(false)
  const [showPromptContainer, setShowPromptContainer] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [options, setOptions] = useState({
    condition_mode: "concat" as const,
    quality: "medium" as const,
    geometry_file_format: "glb" as const,
    use_hyper: false,
    tier: "Regular" as const,
    TAPose: false,
    material: "PBR" as const,
    polyCount: 18000, // Default to medium quality
  })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const cursorOutlineRef = useRef<HTMLDivElement>(null)
  const [isHoveringLink, setIsHoveringLink] = useState(false)
  const [glitchActive, setGlitchActive] = useState(false)

  // Custom cursor effect
  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })

      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = `${e.clientX}px`
        cursorDotRef.current.style.top = `${e.clientY}px`
      }

      if (cursorOutlineRef.current) {
        // Add a slight delay for a trailing effect
        setTimeout(() => {
          if (cursorOutlineRef.current) {
            cursorOutlineRef.current.style.left = `${e.clientX}px`
            cursorOutlineRef.current.style.top = `${e.clientY}px`
          }
        }, 80)
      }
    }

    window.addEventListener("mousemove", moveCursor)

    return () => {
      window.removeEventListener("mousemove", moveCursor)
    }
  }, [])

  // Glitch effect timer
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitchActive(true)
      setTimeout(() => setGlitchActive(false), 1500)
    }, 10000)

    return () => clearInterval(glitchInterval)
  }, [])

  // Prevent body scroll on mobile
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = "hidden"
      document.documentElement.style.overflow = "hidden"

      return () => {
        document.body.style.overflow = ""
        document.documentElement.style.overflow = ""
      }
    }
  }, [isMobile])

  const handleOptionsChange = (newOptions: any) => {
    setOptions(newOptions)
  }

  async function handleStatusCheck(subscriptionKey: string, taskUuid: string) {
    try {
      setIsPolling(true)

      const data = await checkJobStatus(subscriptionKey)
      console.log("Status response:", data)

      // Check if jobs array exists
      if (!data.jobs || !Array.isArray(data.jobs) || data.jobs.length === 0) {
        throw new Error("No jobs found in status response")
      }

      // Update job statuses
      setJobStatuses(data.jobs)

      // Check status of all jobs
      const allJobsDone = data.jobs.every((job: any) => job.status === "Done")
      const anyJobFailed = data.jobs.some((job: any) => job.status === "Failed")

      if (allJobsDone) {
        setIsPolling(false)

        // Get the download URL using the task UUID
        try {
          const downloadData = await downloadModel(taskUuid)
          console.log("Download response:", downloadData)

          // Check if there's an error in the download response
          if (downloadData.error && downloadData.error !== "OK") {
            throw new Error(`Download error: ${downloadData.error}`)
          }

          // Find the first GLB file to display in the 3D viewer
          if (downloadData.list && downloadData.list.length > 0) {
            const glbFile = downloadData.list.find((file: { name: string }) => file.name.toLowerCase().endsWith(".glb"))

            if (glbFile) {
              const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(glbFile.url)}`
              setModelUrl(proxyUrl)
              setDownloadUrl(glbFile.url)
              setIsLoading(false)
              setShowPromptContainer(false)
            } else {
              setError("No GLB file found in the results")
              setIsLoading(false)
            }
          } else {
            setError("No files available for download")
            setIsLoading(false)
          }
        } catch (downloadErr) {
          setError(`Failed to download model: ${downloadErr instanceof Error ? downloadErr.message : "Unknown error"}`)
          setIsLoading(false)
        }
      } else if (anyJobFailed) {
        setIsPolling(false)
        setError("Generation task failed")
        setIsLoading(false)
      } else {
        // Still processing, poll again after a delay
        setTimeout(() => handleStatusCheck(subscriptionKey, taskUuid), 3000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check status")
      setIsPolling(false)
      setIsLoading(false)
    }
  }

  async function handleSubmit(values: FormValues) {
    setIsLoading(true)
    setError(null)
    setResult(null)
    setModelUrl(null)
    setDownloadUrl(null)
    setJobStatuses([])

    try {
      const formData = new FormData()

      if (values.images && values.images.length > 0) {
        values.images.forEach((image) => {
          formData.append("images", image)
        })
      }

      if (values.prompt) {
        formData.append("prompt", values.prompt)
      }

      // Add all the advanced options
      formData.append("condition_mode", options.condition_mode)
      formData.append("geometry_file_format", options.geometry_file_format)
      formData.append("material", options.material)

      // Use the custom polygon count instead of preset quality
      formData.append("poly_count", options.polyCount.toString())

      // Map polygon count to quality for backward compatibility
      let qualityValue = "medium"
      if (options.polyCount <= 8000) {
        qualityValue = "low"
      } else if (options.polyCount <= 18000) {
        qualityValue = "medium"
      } else if (options.polyCount <= 35000) {
        qualityValue = "high"
      } else {
        qualityValue = "high" // Use high for anything above 35K
      }
      formData.append("quality", qualityValue)

      formData.append("use_hyper", options.use_hyper.toString())
      formData.append("tier", options.tier)
      formData.append("TAPose", options.TAPose.toString())
      formData.append("mesh_mode", "Quad")
      formData.append("mesh_simplify", "true")
      formData.append("mesh_smooth", "true")

      // Make the API call through our server route
      const data = await submitRodinJob(formData)
      console.log("Generation response:", data)

      setResult(data)

      // Start polling for status
      if (data.jobs && data.jobs.subscription_key && data.uuid) {
        handleStatusCheck(data.jobs.subscription_key, data.uuid)
      } else {
        setError("Missing required data for status checking")
        setIsLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank")
    }
  }

  const handleBack = () => {
    setShowPromptContainer(true)
  }

  const handleLinkHover = (isHovering: boolean) => {
    setIsHoveringLink(isHovering)
    if (cursorOutlineRef.current) {
      if (isHovering) {
        cursorOutlineRef.current.style.width = "60px"
        cursorOutlineRef.current.style.height = "60px"
        cursorOutlineRef.current.style.borderColor = "rgba(255, 0, 255, 0.8)"
        cursorOutlineRef.current.style.backgroundColor = "rgba(0, 255, 255, 0.1)"
      } else {
        cursorOutlineRef.current.style.width = "40px"
        cursorOutlineRef.current.style.height = "40px"
        cursorOutlineRef.current.style.borderColor = "rgba(0, 255, 255, 0.5)"
        cursorOutlineRef.current.style.backgroundColor = "transparent"
      }
    }
  }

  const ExternalLinks = () => (
    <div className="flex items-center space-x-6">
      <a
        href="https://thatnomad.fun"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-white/70 hover:text-white transition-colors duration-300 group link-hover-effect"
        onMouseEnter={() => handleLinkHover(true)}
        onMouseLeave={() => handleLinkHover(false)}
      >
        <span className="mr-1 group-hover:translate-x-0.5 transition-transform duration-300">Website</span>
        <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
      </a>
      <a
        href="https://www.linkedin.com/in/tamish-mhatre-885317243/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-white/70 hover:text-white transition-colors duration-300 group link-hover-effect"
        onMouseEnter={() => handleLinkHover(true)}
        onMouseLeave={() => handleLinkHover(false)}
      >
        <span className="mr-1 group-hover:translate-x-0.5 transition-transform duration-300">API Docs</span>
        <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
      </a>
    </div>
  )

  // Particles for the title
  const TitleParticles = () => {
    return (
      <div className="absolute -inset-10 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "2px",
              height: "2px",
              borderRadius: "50%",
              backgroundColor: "rgba(0, 255, 255, 0.8)",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="relative h-[100dvh] w-full cursor-glow">
      {/* Custom cursor */}
      <div ref={cursorDotRef} className="cursor-dot"></div>
      <div ref={cursorOutlineRef} className="cursor-outline"></div>

      {/* Retro grid background */}
      <div className="absolute inset-0 z-0 retro-grid opacity-30"></div>

      {/* Full-screen canvas */}
      <div className="absolute inset-0 z-0">
        <ModelViewer modelUrl={isLoading ? null : modelUrl} />
      </div>

      {/* Noise overlay */}
      <div className="absolute inset-0 z-[1] pointer-events-none noise-bg"></div>

      {/* Overlay UI */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Logo in top left */}
        <div className="absolute top-8 left-8 pointer-events-auto">
          <div className="relative">
            <TitleParticles />
            <h1 className="font-playfair text-5xl text-white font-medium tracking-tight flex items-center group cursor-default">
              <span
                className={`relative inline-block mr-3 group-hover:scale-105 transition-transform duration-500 ${glitchActive ? "animate-glitch" : ""}`}
                data-text="Tamish"
              >
                <span className="absolute -inset-1 blur-xl bg-gradient-to-r from-fuchsia-600 to-cyan-400 opacity-30 group-hover:opacity-70 transition-opacity duration-500"></span>
                <span className="relative text-gradient-cyberpunk neon-glow">Tamish</span>
              </span>
              <span className="text-white/90 font-light relative group-hover:tracking-wider transition-all duration-500 animate-pulse-glow">
                <span className="absolute -inset-1 blur-md bg-white/5 opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-full"></span>
                <span className="relative animate-float">3D</span>
              </span>
            </h1>
            <div className="relative overflow-hidden">
              <p className="text-white/60 text-sm mt-1 tracking-wide font-light group-hover:text-white/80 transition-colors duration-500 animate-text-color-shift">
                Professional 3D Model Generator
              </p>
              <div className="absolute h-px w-full bg-gradient-to-r from-fuchsia-400 to-cyan-300 bottom-0 left-0 animate-line-width" />
            </div>
          </div>
        </div>

        {/* Links in top right - desktop only */}
        {!isMobile && (
          <div className="absolute top-8 right-8 pointer-events-auto">
            <ExternalLinks />
          </div>
        )}

        {/* Loading indicator */}
        <StatusIndicator isLoading={isLoading} jobStatuses={jobStatuses} />

        {/* Error message */}
        {error && (
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 glass-effect text-white px-6 py-3 rounded-lg shadow-lg border border-red-500/20 animate-in fade-in slide-in-from-top-4 duration-300 neon-border">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Model controls when model is loaded */}
        {!isLoading && modelUrl && !showPromptContainer && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 pointer-events-auto">
            <Button
              onClick={handleBack}
              className="glass-effect hover:bg-white/10 text-white rounded-full px-6 py-6 h-auto flex items-center gap-2 transition-all duration-300"
              onMouseEnter={() => handleLinkHover(true)}
              onMouseLeave={() => handleLinkHover(false)}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="tracking-wide">Back</span>
            </Button>

            <Button
              onClick={handleDownload}
              className="bg-gradient-premium hover:opacity-90 text-white rounded-full px-6 py-6 h-auto flex items-center gap-2 transition-all duration-300 shadow-glow button-glow"
              onMouseEnter={() => handleLinkHover(true)}
              onMouseLeave={() => handleLinkHover(false)}
            >
              <Download className="h-4 w-4" />
              <span className="tracking-wide">Download Model</span>
            </Button>
          </div>
        )}

        {/* Input field at bottom */}
        {showPromptContainer && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-4 sm:px-0 pointer-events-auto">
            <Form isLoading={isLoading} onSubmit={handleSubmit} onOpenOptions={() => setShowOptions(true)} />

            {/* Links below prompt on mobile */}
            {isMobile && (
              <div className="mt-6 flex justify-center pointer-events-auto">
                <ExternalLinks />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Options Dialog/Drawer */}
      <OptionsDialog
        open={showOptions}
        onOpenChange={setShowOptions}
        options={options}
        onOptionsChange={handleOptionsChange}
        isLoading={isLoading}
      />
    </div>
  )
}
