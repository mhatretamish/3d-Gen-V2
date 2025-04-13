"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface ProgressBarProps {
  totalTasks: number
  completedTasks: number
  className?: string
  isIndeterminate?: boolean
}

export default function ProgressBar({
  totalTasks,
  completedTasks,
  className,
  isIndeterminate = false,
}: ProgressBarProps) {
  // Calculate percentage
  const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className={cn("w-full bg-white/5 rounded-full h-1 overflow-hidden border border-white/10 p-0", className)}>
      {isIndeterminate ? (
        <div className="h-full relative w-full">
          <motion.div
            className="h-full bg-gradient-premium absolute rounded-full"
            initial={{ width: "40%", x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 1.5,
              ease: "linear",
            }}
          />
        </div>
      ) : (
        <motion.div
          className="h-full bg-gradient-premium rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      )}
    </div>
  )
}
