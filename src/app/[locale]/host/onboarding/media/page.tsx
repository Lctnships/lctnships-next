"use client"

import { useTranslations } from "next-intl"

import { useState, useEffect, useRef } from "react"
import { Link, useRouter } from "@/i18n/routing"
import Image from "next/image"

export default function OnboardingMediaPage() {
  const t = useTranslations("Onboarding")
  const router = useRouter()
  const [images, setImages] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Restore state from localStorage on mount
  useEffect(() => {
    const draft = JSON.parse(localStorage.getItem("studio_draft") || "{}")
    if (draft.images && draft.images.length > 0) {
      setImages(draft.images)
    }
  }, [])

  const uploadFiles = async (files: FileList | File[]) => {
    setIsUploading(true)
    const newUrls: string[] = []

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("bucket", "studio-images")
        formData.append("folder", "onboarding")

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (res.ok) {
          const data = await res.json()
          newUrls.push(data.url)
        } else {
          console.error("Upload failed for file:", file.name)
        }
      }

      if (newUrls.length > 0) {
        setImages((prev) => [...prev, ...newUrls])
      }
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files)
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files)
      // Reset input so same file can be selected again
      e.target.value = ""
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleContinue = () => {
    const draft = JSON.parse(localStorage.getItem("studio_draft") || "{}")
    localStorage.setItem("studio_draft", JSON.stringify({ ...draft, images }))
    router.push("/host/onboarding/equipment")
  }

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Header Section */}
      <header className="max-w-4xl w-full mx-auto px-12 pt-16 pb-8">
        <div className="flex flex-col gap-2">
          <p className="text-primary font-bold text-sm tracking-widest uppercase">{t("step2Label")}</p>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">{t("step2Title")}</h2>
          <p className="text-gray-500 text-lg">{t("step2Subtitle")}</p>
        </div>
      </header>

      {/* Form Content */}
      <section className="max-w-4xl w-full mx-auto px-12 pb-32 flex-1">
        {/* Upload Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={handleFileSelect}
          className={`bg-white p-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center min-h-[340px] group cursor-pointer transition-colors relative overflow-hidden ${
            isDragging ? "border-primary bg-primary/5" : "border-primary/40 hover:bg-primary/5"
          }`}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] -z-0 opacity-50"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            {isUploading ? (
              <>
                <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                  <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                </div>
                <h4 className="text-xl font-bold mb-2">{t("uploading")}</h4>
                <p className="text-gray-500 mb-6 max-w-xs">{t("uploadingDesc")}</p>
              </>
            ) : (
              <>
                <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                </div>
                <h4 className="text-xl font-bold mb-2">{t("dropPhotos")}</h4>
                <p className="text-gray-500 mb-6 max-w-xs">{t("dropPhotosHint")}</p>
                <span className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                  Bestanden Kiezen
                </span>
              </>
            )}
          </div>
        </div>

        {/* Uploaded Images Grid */}
        {images.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Geüploade Foto&apos;s ({images.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                  <Image src={img} alt={`Upload ${i + 1}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(i)
                    }}
                    className="absolute top-2 right-2 size-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                  {i === 0 && (
                    <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full font-bold">
                      Cover
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleFileSelect()
                }}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">add</span>
                <span className="text-xs font-bold">Meer Toevoegen</span>
              </button>
            </div>
          </div>
        )}

        {/* Tips Card */}
        <div className="mt-12 p-6 bg-primary/5 rounded-xl border border-primary/10">
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-primary">lightbulb</span>
            <div>
              <p className="text-sm font-bold text-primary mb-1">Pro Tip</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Listings met professionele foto&apos;s krijgen 2,5x meer aanvragen. Laat je studio zien vanuit
                meerdere hoeken en benadruk unieke kenmerken zoals natuurlijk licht, apparatuur,
                en de algemene sfeer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Footer Action */}
      <footer className="fixed bottom-0 right-0 left-80 bg-white/80 backdrop-blur-md border-t border-gray-200 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6">
          <Link
            href="/host/onboarding"
            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Terug
          </Link>
          <button
            onClick={handleContinue}
            className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-primary/25 transition-all flex items-center gap-3"
          >
            Verder naar Apparatuur
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        </div>
      </footer>
    </>
  )
}
