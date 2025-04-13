"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PolyCountSlider from "./poly-count-slider"
import { motion } from "framer-motion"

interface OptionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  options: {
    condition_mode: "concat" | "fuse"
    quality: "high" | "medium" | "low" | "extra-low"
    geometry_file_format: "glb" | "usdz" | "fbx" | "obj" | "stl"
    use_hyper: boolean
    tier: "Regular" | "Sketch"
    TAPose: boolean
    material: "PBR" | "Shaded"
    polyCount: number
  }
  onOptionsChange: (options: any) => void
  isLoading?: boolean
}

export default function OptionsDialog({
  open,
  onOpenChange,
  options,
  onOptionsChange,
  isLoading = false,
}: OptionsDialogProps) {
  const [localOptions, setLocalOptions] = useState(options)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Update local options when props change
  useEffect(() => {
    setLocalOptions(options)
  }, [options])

  const handleChange = (key: string, value: any) => {
    setLocalOptions((prev) => {
      const updated = { ...prev, [key]: value }
      onOptionsChange(updated)
      return updated
    })
  }

  const content = (
    <div className="py-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6 bg-white/5 border border-white/10 rounded-lg">
          <TabsTrigger
            value="basic"
            className="tracking-wide data-[state=active]:bg-gradient-premium data-[state=active]:text-white rounded-md"
          >
            Basic Settings
          </TabsTrigger>
          <TabsTrigger
            value="advanced"
            className="tracking-wide data-[state=active]:bg-gradient-premium data-[state=active]:text-white rounded-md"
          >
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <PolyCountSlider
              value={localOptions.polyCount}
              onChange={(value) => handleChange("polyCount", value)}
              disabled={isLoading}
            />
          </motion.div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-white font-medium tracking-wide">Format</Label>
              <Select
                value={localOptions.geometry_file_format}
                onValueChange={(value) => handleChange("geometry_file_format", value)}
              >
                <SelectTrigger className="glass-effect-light border-white/10 text-white tracking-wide">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="glass-effect border-white/10 text-white">
                  <SelectItem value="glb" className="tracking-wide hover:bg-white/10 focus:bg-white/10">
                    GLB
                  </SelectItem>
                  <SelectItem value="usdz" className="tracking-wide hover:bg-white/10 focus:bg-white/10">
                    USDZ
                  </SelectItem>
                  <SelectItem value="fbx" className="tracking-wide hover:bg-white/10 focus:bg-white/10">
                    FBX
                  </SelectItem>
                  <SelectItem value="obj" className="tracking-wide hover:bg-white/10 focus:bg-white/10">
                    OBJ
                  </SelectItem>
                  <SelectItem value="stl" className="tracking-wide hover:bg-white/10 focus:bg-white/10">
                    STL
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-row items-center justify-between rounded-lg p-4 shadow-sm glass-effect-light">
              <div>
                <Label className="text-white font-medium tracking-wide">Use Hyper</Label>
                <p className="text-white/60 text-sm tracking-wide">Better details</p>
              </div>
              <Switch
                checked={localOptions.use_hyper}
                onCheckedChange={(checked) => handleChange("use_hyper", checked)}
                className="data-[state=checked]:bg-gradient-premium"
              />
            </div>

            <div className="flex flex-row items-center justify-between rounded-lg p-4 shadow-sm glass-effect-light">
              <div>
                <Label className="text-white font-medium tracking-wide">T/A Pose</Label>
                <p className="text-white/60 text-sm tracking-wide">For humans</p>
              </div>
              <Switch
                checked={localOptions.TAPose}
                onCheckedChange={(checked) => handleChange("TAPose", checked)}
                className="data-[state=checked]:bg-gradient-premium"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="space-y-3">
              <Label className="text-white font-medium tracking-wide">Condition Mode</Label>
              <RadioGroup
                value={localOptions.condition_mode}
                onValueChange={(value) => handleChange("condition_mode", value)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2 glass-effect-light p-3 rounded-lg">
                  <RadioGroupItem value="concat" id="concat" className="border-purple-400 text-purple-400" />
                  <Label htmlFor="concat" className="text-white tracking-wide">
                    Concat (Single object, multiple views)
                  </Label>
                </div>
                <div className="flex items-center space-x-2 glass-effect-light p-3 rounded-lg">
                  <RadioGroupItem value="fuse" id="fuse" className="border-purple-400 text-purple-400" />
                  <Label htmlFor="fuse" className="text-white tracking-wide">
                    Fuse (Multiple objects)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3 mt-6">
              <Label className="text-white font-medium tracking-wide">Material</Label>
              <RadioGroup
                value={localOptions.material}
                onValueChange={(value) => handleChange("material", value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2 glass-effect-light p-3 rounded-lg flex-1 justify-center">
                  <RadioGroupItem value="PBR" id="pbr" className="border-purple-400 text-purple-400" />
                  <Label htmlFor="pbr" className="text-white tracking-wide">
                    PBR
                  </Label>
                </div>
                <div className="flex items-center space-x-2 glass-effect-light p-3 rounded-lg flex-1 justify-center">
                  <RadioGroupItem value="Shaded" id="shaded" className="border-purple-400 text-purple-400" />
                  <Label htmlFor="shaded" className="text-white tracking-wide">
                    Shaded
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3 mt-6">
              <Label className="text-white font-medium tracking-wide">Generation Tier</Label>
              <RadioGroup
                value={localOptions.tier}
                onValueChange={(value) => handleChange("tier", value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2 glass-effect-light p-3 rounded-lg flex-1 justify-center">
                  <RadioGroupItem value="Regular" id="regular" className="border-purple-400 text-purple-400" />
                  <Label htmlFor="regular" className="text-white tracking-wide">
                    Regular
                  </Label>
                </div>
                <div className="flex items-center space-x-2 glass-effect-light p-3 rounded-lg flex-1 justify-center">
                  <RadioGroupItem value="Sketch" id="sketch" className="border-purple-400 text-purple-400" />
                  <Label htmlFor="sketch" className="text-white tracking-wide">
                    Sketch
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="glass-effect border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-gradient font-playfair">Model Settings</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="glass-effect border-t border-white/10 text-white">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle className="text-2xl text-gradient font-playfair">Model Settings</DrawerTitle>
          </DrawerHeader>
          <div className="px-4">{content}</div>
          <DrawerFooter>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-gradient-premium hover:opacity-90 text-white tracking-wide shadow-glow"
            >
              Apply Settings
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
