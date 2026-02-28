"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"

interface Project {
  id: string
  title: string
  project_type: string
  description?: string
  cover_image_url?: string
  status: string
  updated_at: string
  bookings_count: number
  members_count: number
}

interface ProjectsClientProps {
  projects: Project[]
}

type FilterType = "all" | "photoshoot" | "video" | "podcast" | "film" | "event"

export function ProjectsClient({ projects }: ProjectsClientProps) {
  const t = useTranslations("Projects")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType =
      filterType === "all" || project.project_type.toLowerCase().includes(filterType)
    return matchesSearch && matchesType
  })

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffWeeks = Math.floor(diffDays / 7)

    if (diffHours < 1) return t("justUpdated")
    if (diffHours < 24) return t("hoursAgo", { count: diffHours })
    if (diffDays < 7) return t("daysAgo", { count: diffDays })
    return t("weeksAgo", { count: diffWeeks })
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      editorial: t("typeEditorial"),
      music: t("typeMusic"),
      podcast: t("typePodcast"),
      event: t("typeEvent"),
      architecture: t("typeArchitecture"),
      film: t("typeFilm"),
      photoshoot: t("typePhotoshoot"),
      video: t("typeVideo"),
    }
    return labels[type.toLowerCase()] || type
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight">
            {t("heading")}
          </h1>
          <p className="text-gray-500 text-lg font-medium">
            {t("headingDescription")}
          </p>
        </div>
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="hidden sm:flex min-w-[140px] cursor-pointer items-center justify-center rounded-full h-12 px-6 bg-primary text-white text-sm font-bold tracking-wide transition-transform active:scale-95 shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined mr-2 text-[20px]">add</span>
          {t("newProject")}
        </button>
      </div>

      {/* Mobile New Project Button */}
      <div className="sm:hidden mb-6">
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="w-full flex cursor-pointer items-center justify-center rounded-full h-12 px-6 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined mr-2">add</span>
          {t("newProject")}
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-10 items-center">
        <div className="w-full lg:flex-1">
          <label className="relative flex items-center h-14 w-full">
            <span className="material-symbols-outlined absolute left-4 text-gray-400">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
              placeholder={t("searchPlaceholder")}
            />
          </label>
        </div>
        <div className="flex gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          <button
            onClick={() => setFilterType("all")}
            className={`flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 border transition-colors ${
              filterType === "all"
                ? "bg-primary/10 border-primary/20 text-primary"
                : "bg-white border-gray-200 hover:border-primary/50"
            }`}
          >
            <span className={`text-sm ${filterType === "all" ? "font-bold" : "font-semibold"}`}>
              {t("filterAll")}
            </span>
            {filterType === "all" && (
              <span className="material-symbols-outlined text-primary text-[20px]">
                keyboard_arrow_down
              </span>
            )}
          </button>
          {(["photoshoot", "video", "podcast", "film"] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 border transition-colors ${
                filterType === type
                  ? "bg-primary/10 border-primary/20 text-primary font-bold"
                  : "bg-white border-gray-200 hover:border-primary/50 font-semibold"
              }`}
            >
              <span className="text-sm capitalize">{type === "photoshoot" ? t("filterPhotography") : type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">folder_open</span>
          <h3 className="text-xl font-bold mb-2">{t("noProjectsFound")}</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery
              ? t("noProjectsSearchHint")
              : t("noProjectsCreateHint")}
          </p>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-colors"
          >
            {t("createProject")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group flex flex-col cursor-pointer"
            >
              <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div
                  className="absolute inset-0 bg-center bg-no-repeat bg-cover transition-transform duration-700 group-hover:scale-105 bg-gray-200"
                  style={
                    project.cover_image_url
                      ? { backgroundImage: `url("${project.cover_image_url}")` }
                      : {}
                  }
                >
                  {!project.cover_image_url && (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-gray-400">
                        folder
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                <div className="absolute top-6 left-6">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold rounded-full uppercase tracking-widest">
                    {getTypeLabel(project.project_type)}
                  </span>
                </div>
              </div>
              <div className="mt-5 px-2">
                <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-gray-500 text-sm font-medium">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    {project.bookings_count} {t("bookingsCount")}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">groups</span>
                    {project.members_count} {t("teamMembersCount")}
                  </span>
                </div>
                <p className="text-gray-400 text-xs mt-2 uppercase font-bold tracking-wider">
                  {formatTimeAgo(project.updated_at)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Load More */}
      {filteredProjects.length > 0 && (
        <div className="mt-16 flex justify-center">
          <button className="flex items-center justify-center gap-2 px-10 h-14 bg-white border border-gray-200 rounded-full font-bold hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
            <span>{t("loadMore")}</span>
            <span className="material-symbols-outlined">expand_more</span>
          </button>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <NewProjectModal onClose={() => setShowNewProjectModal(false)} />
      )}
    </div>
  )
}

function NewProjectModal({ onClose }: { onClose: () => void }) {
  const t = useTranslations("Projects")
  const [title, setTitle] = useState("")
  const [projectType, setProjectType] = useState("photoshoot")
  const [description, setDescription] = useState("")

  const projectTypes = [
    { id: "photoshoot", label: t("modalPhotoshoot"), icon: "photo_camera" },
    { id: "video", label: t("modalVideo"), icon: "videocam" },
    { id: "podcast", label: t("modalPodcast"), icon: "mic" },
    { id: "film", label: t("modalFilmProduction"), icon: "movie" },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xl p-4">
      <div
        className="bg-white w-full max-w-[800px] shadow-2xl overflow-hidden flex flex-col"
        style={{ borderRadius: "40px" }}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-10 pt-10 pb-4">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">{t("modalTitle")}</p>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form Content */}
        <div className="px-10 pb-12 space-y-10">
          {/* Project Title */}
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl md:text-5xl font-black tracking-tight border-none focus:ring-0 placeholder:text-gray-300 bg-transparent p-0"
              placeholder={t("modalTitlePlaceholder")}
            />
            <div className="h-[1px] w-full bg-gray-200" />
          </div>

          {/* Project Type */}
          <div className="space-y-4">
            <p className="text-base font-semibold">{t("modalWhatAreWeMaking")}</p>
            <div className="flex gap-3 flex-wrap">
              {projectTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setProjectType(type.id)}
                  className={`flex h-10 items-center justify-center gap-x-2 rounded-full px-6 transition-all ${
                    projectType === type.id
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{type.icon}</span>
                  <p className="text-sm font-medium">{type.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Description and Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            {/* Description */}
            <div className="flex flex-col gap-3">
              <p className="text-base font-semibold">{t("modalDescription")}</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 bg-gray-50 p-4 text-sm min-h-[160px] placeholder:text-gray-400 resize-none"
                placeholder={t("modalDescriptionPlaceholder")}
              />
            </div>

            {/* Upload Zone */}
            <div className="flex flex-col gap-3">
              <p className="text-base font-semibold">{t("modalCoverImage")}</p>
              <div className="w-full aspect-square flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-primary/5 transition-colors group p-8 text-center border-2 border-dashed border-gray-300 rounded-3xl">
                <div className="size-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
                </div>
                <p className="text-sm font-bold">{t("modalClickOrDragUpload")}</p>
                <p className="text-xs text-gray-500 mt-1">{t("modalUploadRecommendation")}</p>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <div className="flex justify-center pt-4">
            <button className="bg-primary hover:bg-primary/90 text-white px-12 py-5 rounded-full font-bold text-lg transition-all shadow-xl shadow-primary/30 flex items-center gap-3">
              <span>{t("modalCreateButton")}</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
