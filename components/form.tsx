"use client"

import type React from "react"

import { useState, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type * as z from "zod"
import { Form as UIForm } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ImageIcon, SlidersHorizontal, Sparkles } from "lucide-react"
import AutoResizeTextarea from "./auto-resize-textarea"
import ImageUploadArea from "./image-upload-area"
import { formSchema } from "@/lib/form-schema"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

interface FormProps {
  isLoading: boolean
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>
  onOpenOptions: () => void
}

export default function Form({ isLoading, onSubmit, onOpenOptions }: FormProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropAreaRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const dragCounter = useRef(0)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      images: [],
      condition_mode: "concat",
      quality: "medium",
      geometry_file_format: "glb",
      use_hyper: false,
      tier: "Regular",
      TAPose: false,
      material: "PBR",
      polyCount: 18000,
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    addImages(files)
  }

  const addImages = (files: File[]) => {
    if (files.length === 0) return

    // Limit to 5 images total
    const currentImages = form.getValues("images") || []
    const totalImages = currentImages.length + files.length

    if (totalImages > 5) {
      setError("You can upload a maximum of 5 images")
      const allowedNewImages = 5 - currentImages.length
      files = files.slice(0, allowedNewImages)

      if (files.length === 0) return
    }

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file))
    const updatedImages = [...currentImages, ...files]

    setPreviewUrls([...previewUrls, ...newPreviewUrls])
    form.setValue("images", updatedImages)
  }

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images") || []
    const newImages = [...currentImages]
    newImages.splice(index, 1)

    const newPreviewUrls = [...previewUrls]
    URL.revokeObjectURL(newPreviewUrls[index])
    newPreviewUrls.splice(index, 1)

    setPreviewUrls(newPreviewUrls)
    form.setValue("images", newImages)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current += 1
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current -= 1
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current = 0
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))
      addImages(files)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // On desktop, Enter submits the form unless Shift is pressed
    // On mobile, Enter creates a new line
    if (e.key === "Enter") {
      if (!isMobile && !e.shiftKey) {
        e.preventDefault()
        formRef.current?.requestSubmit()
      }
    }
  }

  return (
    <UIForm {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="relative">
        <div
          ref={dropAreaRef}
          className={cn(
            "relative glass-effect rounded-2xl overflow-hidden transition-all duration-300 shadow-lg",
            isDragging
              ? "ring-2 ring-purple-400 border-purple-400/50"
              : isFocused
                ? "ring-2 ring-purple-400/50 border-purple-400/30"
                : "border-white/5",
            isLoading && "animate-pulse-loading pointer-events-none opacity-70",
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Image previews */}
          <ImageUploadArea previewUrls={previewUrls} onRemoveImage={removeImage} isLoading={isLoading} />

          <div className="px-4 py-3">
            <div className="flex items-center">
              <div className="flex space-x-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={triggerFileInput}
                  className="text-white/60 hover:text-white hover:bg-white/10 rounded-full h-10 w-10 ml-0 transition-colors duration-300"
                  disabled={isLoading}
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onOpenOptions}
                  className="text-white/60 hover:text-white hover:bg-white/10 rounded-full h-10 w-10 ml-0 transition-colors duration-300"
                  disabled={isLoading}
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
              </div>

              <AutoResizeTextarea
                placeholder="Describe your 3D model..."
                className="flex-1 bg-transparent border-0 focus:ring-0 text-white placeholder:text-white/40 py-2 px-3 resize-none text-base tracking-wide"
                {...form.register("prompt")}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />

              <div>
                <Button
                  type="submit"
                  className="bg-gradient-premium hover:opacity-90 text-white rounded-full h-10 w-10 p-0 flex items-center justify-center transition-all duration-300 shadow-glow"
                  disabled={isLoading}
                >
                  <Sparkles className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {isDragging && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-none z-10">
              <p className="text-gradient font-medium tracking-wide text-lg">Drop images here</p>
            </div>
          )}
        </div>

        {error && <div className="mt-3 text-red-400 text-sm tracking-wide">{error}</div>}
      </form>
    </UIForm>
  )
}
