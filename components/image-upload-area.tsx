"use client"

import { X } from "lucide-react"
import { motion } from "framer-motion"

interface ImageUploadAreaProps {
  previewUrls: string[]
  onRemoveImage: (index: number) => void
  isLoading?: boolean
}

export default function ImageUploadArea({ previewUrls, onRemoveImage, isLoading = false }: ImageUploadAreaProps) {
  if (previewUrls.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-3 px-4 pt-4 pb-2 pointer-events-auto">
      {previewUrls.map((url, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative h-16 w-16 group"
        >
          <div className="h-full w-full overflow-hidden rounded-xl shadow-md">
            <img
              src={url || "/placeholder.svg"}
              alt={`Preview ${index + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          {!isLoading && (
            <button
              type="button"
              onClick={() => onRemoveImage(index)}
              className="absolute -top-2 -right-2 bg-black/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          )}
        </motion.div>
      ))}
    </div>
  )
}
