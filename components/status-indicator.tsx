"use client"

import { useEffect, useState } from "react"
import ProgressBar from "./progress-bar"
import { motion } from "framer-motion"

interface StatusIndicatorProps {
  isLoading: boolean
  jobStatuses: Array<{ uuid: string; status: string }>
}

export default function StatusIndicator({ isLoading, jobStatuses }: StatusIndicatorProps) {
  const [statusText, setStatusText] = useState("Initializing...")
  const [dots, setDots] = useState("")
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (isLoading && !startTime) {
      setStartTime(Date.now())
    } else if (!isLoading) {
      setStartTime(null)
      setElapsedTime(0)
      setEstimatedTime(null)
    }
  }, [isLoading, startTime])

  useEffect(() => {
    if (!isLoading) return

    // Update status text based on job progress
    if (jobStatuses.length === 0) {
      setStatusText("Initializing")
      setEstimatedTime(60) // Initial estimate: 1 minute
    } else if (jobStatuses.every((job) => job.status === "Done")) {
      setStatusText("Finalizing")
      setEstimatedTime(5) // Almost done
    } else {
      setStatusText("Generating 3D model")

      // Calculate estimated time based on progress
      const completedJobs = jobStatuses.filter((job) => job.status === "Done").length
      const totalJobs = jobStatuses.length
      const progress = totalJobs > 0 ? completedJobs / totalJobs : 0

      // Adjust estimated time based on progress
      if (progress > 0) {
        const elapsed = (Date.now() - (startTime || Date.now())) / 1000
        const totalEstimated = elapsed / progress
        const remaining = Math.max(5, totalEstimated - elapsed)
        setEstimatedTime(Math.round(remaining))
      }
    }

    // Animated dots
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 500)

    // Update elapsed time
    const timeInterval = setInterval(() => {
      if (startTime) {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      }
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(timeInterval)
    }
  }, [isLoading, jobStatuses, startTime])

  if (!isLoading) {
    return null
  }

  // Add one additional task to the total count
  const actualTasks = jobStatuses.length
  const totalTasks = actualTasks > 0 ? actualTasks + 1 : 0

  // Count the first task (initial request) as completed when we have job statuses
  const completedJobTasks = jobStatuses.filter((job) => job.status === "Done").length
  const initialRequestComplete = actualTasks > 0 ? 1 : 0
  const completedTasks = completedJobTasks + initialRequestComplete

  const showProgress = actualTasks > 0
  const isIndeterminate = actualTasks === 0

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20"
    >
      <div className="w-96 flex flex-col items-center gap-6">
        <div className="text-center">
          <h3 className="text-2xl font-playfair text-gradient mb-2">
            {statusText}
            <span>{dots}</span>
          </h3>
          <p className="text-white/70 mb-1">
            {showProgress ? `Processing ${completedTasks} of ${totalTasks} tasks` : "Preparing your model"}
          </p>
          <div className="flex justify-center items-center mt-1 text-sm text-white/50">
            <span>Elapsed: {formatTime(elapsedTime)}</span>
            {estimatedTime && (
              <>
                <span className="mx-2">•</span>
                <span>Est. remaining: {formatTime(estimatedTime)}</span>
              </>
            )}
          </div>
        </div>
        <ProgressBar
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          isIndeterminate={isIndeterminate}
          className="h-2"
        />

        <div className="text-sm text-white/50 mt-1 glass-effect-light px-4 py-2 rounded-lg">
          <p>Higher polygon counts may increase generation time</p>
        </div>
      </div>
    </motion.div>
  )
}
