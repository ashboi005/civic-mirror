"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Upload, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface ReportIssueFormProps {
  onSubmit: () => void
}

export function ReportIssueForm({ onSubmit }: ReportIssueFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      onSubmit()
    }, 1500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Issue Title</Label>
          <Input id="title" placeholder="Enter a descriptive title" required />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="road">Road (Potholes, Damage)</SelectItem>
              <SelectItem value="lighting">Lighting (Street Lights)</SelectItem>
              <SelectItem value="sanitation">Sanitation (Garbage)</SelectItem>
              <SelectItem value="water">Water (Leakage, Drainage)</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" placeholder="Describe the issue in detail" className="min-h-[100px]" required />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <div className="flex gap-2">
            <Input id="location" placeholder="Enter address or location" className="flex-1" required />
            <Button type="button" variant="outline" size="icon">
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-1">Or use current location</p>
        </div>

        <div>
          <Label htmlFor="image">Upload Image</Label>
          <div className="mt-1 flex items-center gap-4">
            <div className="flex-1">
              <label
                htmlFor="image-upload"
                className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-700 bg-black/20 px-6 py-4 text-center hover:bg-gray-900/30 transition-colors"
              >
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <span className="text-xs text-gray-400">Drag & drop or click to upload</span>
                </div>
                <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-32 w-32 rounded-md overflow-hidden border border-gray-700"
              >
                <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit Report"
          )}
        </Button>
      </div>
    </form>
  )
}
