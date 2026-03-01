"use client"

import { useCallback, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ImagePlus, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  bucket: string
  folder?: string
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  className?: string
  aspectRatio?: "square" | "video" | "wide"
}

export function ImageUpload({
  bucket,
  folder = "",
  value,
  onChange,
  onRemove,
  className,
  aspectRatio = "square",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[2/1]",
  }

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setIsUploading(true)

      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = folder ? `${folder}/${fileName}` : fileName

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) {
        console.error("Upload error:", uploadError)
        setIsUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      onChange(publicUrl)
      setIsUploading(false)
    },
    [bucket, folder, onChange, supabase]
  )

  return (
    <div className={cn("relative", aspectClasses[aspectRatio], className)}>
      {value ? (
        <div className="relative w-full h-full rounded-lg overflow-hidden border">
          <Image
            src={value}
            alt="Uploaded image"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          {onRemove && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
          />
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Upload afbeelding</span>
            </>
          )}
        </label>
      )}
    </div>
  )
}
