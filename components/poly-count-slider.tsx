"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { InfoIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"

interface PolyCountSliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

export default function PolyCountSlider({
  value,
  onChange,
  min = 4000,
  max = 50000,
  step = 1000,
  disabled = false,
}: PolyCountSliderProps) {
  const [localValue, setLocalValue] = useState(value)
  const [performanceLevel, setPerformanceLevel] = useState<"excellent" | "good" | "moderate" | "demanding">("good")
  const [detailLevel, setDetailLevel] = useState<"minimal" | "basic" | "good" | "excellent">("good")

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Calculate performance and detail levels based on polygon count
  useEffect(() => {
    // Performance level
    if (localValue <= 8000) {
      setPerformanceLevel("excellent")
    } else if (localValue <= 20000) {
      setPerformanceLevel("good")
    } else if (localValue <= 35000) {
      setPerformanceLevel("moderate")
    } else {
      setPerformanceLevel("demanding")
    }

    // Detail level
    if (localValue <= 8000) {
      setDetailLevel("minimal")
    } else if (localValue <= 20000) {
      setDetailLevel("basic")
    } else if (localValue <= 35000) {
      setDetailLevel("good")
    } else {
      setDetailLevel("excellent")
    }
  }, [localValue])

  // Handle slider change
  const handleChange = (newValue: number[]) => {
    const value = newValue[0]
    setLocalValue(value)
    onChange(value)
  }

  // Get color for performance indicator
  const getPerformanceColor = () => {
    switch (performanceLevel) {
      case "excellent":
        return "text-green-400"
      case "good":
        return "text-purple-400"
      case "moderate":
        return "text-amber-400"
      case "demanding":
        return "text-red-400"
      default:
        return "text-purple-400"
    }
  }

  // Get color for detail indicator
  const getDetailColor = () => {
    switch (detailLevel) {
      case "minimal":
        return "text-white/60"
      case "basic":
        return "text-purple-400"
      case "good":
        return "text-purple-300"
      case "excellent":
        return "gold-gradient"
      default:
        return "text-purple-400"
    }
  }

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Label className="text-white font-medium tracking-wide mr-2">Polygon Count</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-white/40" />
              </TooltipTrigger>
              <TooltipContent className="glass-effect border-white/10 text-white max-w-xs">
                <p>
                  Higher polygon counts provide more detail but may impact performance and increase generation time.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <motion.span
          key={localValue}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gradient font-medium"
        >
          {formatNumber(localValue)}
        </motion.span>
      </div>

      <Slider
        value={[localValue]}
        min={min}
        max={max}
        step={step}
        onValueChange={handleChange}
        disabled={disabled}
        className="py-2"
      />

      <div className="flex justify-between text-sm">
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="text-white/60 mr-2">Performance:</span>
            <span className={getPerformanceColor()}>{performanceLevel}</span>
          </div>
          <div className="flex items-center">
            <span className="text-white/60 mr-2">Detail:</span>
            <span className={getDetailColor()}>{detailLevel}</span>
          </div>
        </div>

        <div className="space-y-2 text-right">
          <div className="text-white/60">
            Generation time:{" "}
            {localValue <= 8000 ? "Fast" : localValue <= 20000 ? "Medium" : localValue <= 35000 ? "Slow" : "Very slow"}
          </div>
          <div className="text-white/60">File size: {Math.round(localValue * 0.05) + " KB approx."}</div>
        </div>
      </div>

      <div className="flex space-x-2 mt-2">
        {[
          { label: "Low", value: 4000 },
          { label: "Medium", value: 18000 },
          { label: "High", value: 35000 },
          { label: "Ultra", value: 50000 },
        ].map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => handleChange([preset.value])}
            className={`px-3 py-2 text-sm rounded-lg transition-all duration-300 ${
              localValue === preset.value
                ? "bg-gradient-premium text-white shadow-glow"
                : "glass-effect-light text-white/70 hover:text-white"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}
