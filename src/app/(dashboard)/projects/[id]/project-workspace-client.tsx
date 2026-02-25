"use client"

import { useState } from "react"
import Link from "next/link"

interface Project {
  id: string
  title: string
  project_type: string
  description?: string
  cover_image_url?: string
  status: string
  created_at: string
  updated_at: string
}

interface Booking {
  id: string
  studio_title: string
  studio_location: string
  date: string
  start_time: string
  end_time: string
  status: string
}

interface TeamMember {
  id: string
  full_name: string
  role: string
  avatar_url?: string
  is_online: boolean
}

interface Note {
  id: string
  title: string
  content: string
}

interface StoryboardFrame {
  id: string
  scene: string
  title: string
  description: string
  image_url: string
  location: string
}

interface Shot {
  id: string
  code: string
  description: string
  assignee: { name: string; avatar_url: string }
  status: string
  session: string
}

interface ProjectFile {
  id: string
  name: string
  type: string
  size: string
  modified: string
}

type TabType = "bookings" | "storyboard" | "moodboard" | "shotlist" | "team" | "files"

interface ProjectWorkspaceClientProps {
  project: Project
  bookings: Booking[]
  teamMembers: TeamMember[]
  notes: Note[]
  storyboardFrames: StoryboardFrame[]
  shotlist: Shot[]
  files: ProjectFile[]
}

export function ProjectWorkspaceClient({
  project,
  bookings,
  teamMembers,
  notes,
  storyboardFrames,
  shotlist,
  files,
}: ProjectWorkspaceClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("bookings")
  const [newNote, setNewNote] = useState("")

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      month: date.toLocaleDateString("en-US", { month: "short" }),
      day: date.getDate(),
    }
  }

  const onlineCount = teamMembers.filter((m) => m.is_online).length

  const tabs = [
    { id: "bookings" as const, label: "Bookings", icon: "event_available" },
    { id: "storyboard" as const, label: "Storyboard", icon: "view_quilt" },
    { id: "moodboard" as const, label: "Moodboard", icon: "palette" },
    { id: "shotlist" as const, label: "Shotlist", icon: "list_alt" },
    { id: "team" as const, label: "Team", icon: "group" },
    { id: "files" as const, label: "Files", icon: "folder" },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative w-full mb-8">
        <div
          className="h-80 w-full rounded-xl bg-cover bg-center overflow-hidden flex flex-col justify-end p-8 relative shadow-lg"
          style={{
            backgroundImage: project.cover_image_url
              ? `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%), url("${project.cover_image_url}")`
              : "linear-gradient(to top, rgba(0,0,0,0.8) 0%, #1a1a2e 100%)",
          }}
        >
          <div className="flex flex-col gap-2 relative z-10">
            <div className="flex items-center gap-3">
              <h1 className="text-white text-4xl font-extrabold tracking-tight">{project.title}</h1>
              <button className="text-white/70 hover:text-white transition-colors">
                <span className="material-symbols-outlined">edit</span>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-primary px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider">
                {project.status === "active" ? "Active Production" : project.status}
              </span>
              <p className="text-white/80 text-sm font-medium">Project ID: PRJ-{project.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="mb-6">
            <div className="flex border-b border-gray-200 gap-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 border-b-[3px] pb-4 px-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-primary"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                  <p className="text-sm font-bold tracking-wide">{tab.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Scheduled Studio Sessions</h2>
                <button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-2.5 text-sm font-bold flex items-center gap-2 shadow-md transition-all">
                  <span className="material-symbols-outlined text-lg">add</span>
                  New Session
                </button>
              </div>
              <div className="grid gap-4">
                {bookings.map((booking) => {
                  const { month, day } = formatDate(booking.date)
                  const isUpcoming = new Date(booking.date) > new Date()
                  return (
                    <div
                      key={booking.id}
                      className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex gap-6 items-center">
                          <div
                            className={`flex flex-col items-center justify-center rounded-xl size-20 p-2 ${
                              isUpcoming ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            <span className="text-xs font-bold uppercase">{month}</span>
                            <span className="text-2xl font-extrabold leading-none">{day}</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                              {booking.studio_title}
                            </h3>
                            <div className="flex gap-4 mt-1">
                              <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                {booking.start_time} - {booking.end_time}
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                {booking.studio_location}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button className="p-2 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                            <span className="material-symbols-outlined">description</span>
                          </button>
                          <button className="px-5 py-2 rounded-full bg-gray-100 font-bold text-sm hover:bg-primary hover:text-white transition-all">
                            Manage
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Storyboard Tab */}
          {activeTab === "storyboard" && (
            <>
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold">Project Storyboard</h2>
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-500">
                    {storyboardFrames.length} Frames
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="bg-white border border-gray-200 hover:bg-gray-50 rounded-full px-5 py-2.5 text-sm font-bold flex items-center gap-2 transition-all">
                    <span className="material-symbols-outlined text-lg">file_download</span>
                    Export PDF
                  </button>
                  <button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-2.5 text-sm font-bold flex items-center gap-2 shadow-md transition-all">
                    <span className="material-symbols-outlined text-lg">add</span>
                    Add Frame
                  </button>
                </div>
              </div>
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {storyboardFrames.map((frame) => (
                  <div
                    key={frame.id}
                    className="break-inside-avoid bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group"
                  >
                    <div className="relative">
                      <img
                        src={frame.image_url}
                        alt={frame.title}
                        className="w-full h-auto object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                          {frame.scene}
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2">
                          <button className="bg-white/90 p-1.5 rounded-lg hover:bg-white">
                            <span className="material-symbols-outlined text-xl">drag_indicator</span>
                          </button>
                          <button className="bg-white/90 p-1.5 rounded-lg text-red-500 hover:bg-white">
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col gap-4">
                      <div>
                        <h3 className="font-bold text-lg mb-1">{frame.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{frame.description}</p>
                      </div>
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                          Location Link
                        </p>
                        <div className="relative">
                          <select className="w-full bg-gray-50 border-none rounded-lg py-2 pl-3 pr-10 text-sm font-semibold appearance-none focus:ring-1 focus:ring-primary">
                            <option>{frame.location}</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 pointer-events-none">
                            expand_more
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Shotlist Tab */}
          {activeTab === "shotlist" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">Master Shotlist</h2>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-500">
                    {shotlist.length} SHOTS TOTAL
                  </span>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-50 transition-all">
                    <span className="material-symbols-outlined text-lg">filter_list</span>
                    Filter
                  </button>
                  <button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-2.5 text-sm font-bold flex items-center gap-2 shadow-md transition-all">
                    <span className="material-symbols-outlined text-lg">add</span>
                    Add Shot
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {shotlist.map((shot) => (
                  <div
                    key={shot.id}
                    className={`bg-white p-4 rounded-xl border shadow-sm hover:border-primary/30 transition-all flex items-center justify-between group ${
                      shot.status === "in_progress" ? "border-primary/20 ring-1 ring-primary/5" : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        className={`size-6 rounded-full border-2 flex items-center justify-center ${
                          shot.status === "completed"
                            ? "border-primary bg-primary text-white"
                            : "border-gray-300 hover:border-primary transition-colors"
                        }`}
                      >
                        {shot.status === "completed" && (
                          <span className="material-symbols-outlined text-sm font-bold">check</span>
                        )}
                      </button>
                      <div className="flex flex-col">
                        <p
                          className={`text-sm font-bold ${
                            shot.status === "completed" ? "line-through opacity-60" : ""
                          }`}
                        >
                          {shot.description}
                        </p>
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                          {shot.code}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2">
                        <div
                          className="size-7 rounded-full bg-cover bg-center bg-gray-200"
                          style={{ backgroundImage: `url("${shot.assignee.avatar_url}")` }}
                        />
                        <span className="text-xs font-semibold text-gray-500">{shot.assignee.name}</span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          shot.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : shot.status === "in_progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {shot.status === "in_progress" ? "In Progress" : shot.status}
                      </span>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-500">
                        <span className="material-symbols-outlined">more_horiz</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Files Tab */}
          {activeTab === "files" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Recent Files</h2>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500">
                    <span className="material-symbols-outlined text-sm">grid_view</span>
                  </button>
                  <button className="p-2 rounded-lg bg-gray-100 border border-gray-200 text-primary">
                    <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-bold">Name</th>
                      <th className="px-6 py-4 font-bold">Kind</th>
                      <th className="px-6 py-4 font-bold">Size</th>
                      <th className="px-6 py-4 font-bold">Modified</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {files.map((file) => (
                      <tr
                        key={file.id}
                        className="hover:bg-gray-50 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                file.type === "pdf"
                                  ? "text-red-500 bg-red-50"
                                  : file.type === "docx"
                                  ? "text-blue-500 bg-blue-50"
                                  : "text-amber-500 bg-amber-50"
                              }`}
                            >
                              <span className="material-symbols-outlined">
                                {file.type === "pdf"
                                  ? "picture_as_pdf"
                                  : file.type === "docx"
                                  ? "description"
                                  : "image"}
                              </span>
                            </div>
                            <span className="font-bold">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {file.type.toUpperCase()} {file.type === "image" ? "Image" : "Document"}
                        </td>
                        <td className="px-6 py-4 text-gray-500">{file.size}</td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(file.modified).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-gray-500 hover:text-primary">
                            <span className="material-symbols-outlined">more_horiz</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-8 border-2 border-dashed border-primary/30 rounded-3xl p-12 flex flex-col items-center justify-center bg-white/30 hover:bg-white/50 transition-all cursor-pointer group">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">upload_file</span>
                </div>
                <h3 className="text-lg font-bold mb-1">Upload New File</h3>
                <p className="text-gray-500 text-sm">
                  Drag and drop documents or images here, or{" "}
                  <span className="text-primary font-bold">browse</span>
                </p>
              </div>
            </>
          )}

          {/* Team Tab */}
          {activeTab === "team" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Team Members</h2>
                <button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-2.5 text-sm font-bold flex items-center gap-2 shadow-md transition-all">
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  Invite Member
                </button>
              </div>
              <div className="grid gap-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div
                          className="size-12 rounded-full bg-cover bg-center bg-gray-200 border-2 border-white"
                          style={member.avatar_url ? { backgroundImage: `url("${member.avatar_url}")` } : {}}
                        >
                          {!member.avatar_url && (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-xl text-gray-400">person</span>
                            </div>
                          )}
                        </div>
                        <div
                          className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-white ${
                            member.is_online ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-bold">{member.full_name}</p>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-xs font-bold">
                        {member.role}
                      </span>
                      <button className="text-gray-500 hover:text-red-500 font-bold text-sm transition-colors">
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Moodboard Tab */}
          {activeTab === "moodboard" && (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">palette</span>
              <h3 className="text-xl font-bold mb-2">Moodboard Coming Soon</h3>
              <p className="text-gray-500">Collect and organize visual inspiration for your project</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-80 flex flex-col gap-8">
          {/* Team Section */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Team Members</h3>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                {onlineCount} Online
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {teamMembers.slice(0, 4).map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className="size-10 rounded-full bg-cover bg-center bg-gray-200"
                      style={member.avatar_url ? { backgroundImage: `url("${member.avatar_url}")` } : {}}
                    >
                      {!member.avatar_url && (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-lg text-gray-400">person</span>
                        </div>
                      )}
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-white ${
                        member.is_online ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{member.full_name}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                </div>
              ))}
              <button className="mt-2 w-full py-2 rounded-full border border-dashed border-gray-300 text-gray-500 text-sm font-semibold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">person_add</span>
                Invite Member
              </button>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-yellow-700">
              <span className="material-symbols-outlined">sticky_note_2</span>
              <h3 className="font-bold text-lg">Production Notes</h3>
            </div>
            <div className="flex flex-col gap-3">
              {notes.map((note) => (
                <div key={note.id} className="text-sm text-yellow-700 leading-relaxed">
                  <p className="font-bold border-b border-yellow-200 pb-1 mb-1">{note.title}</p>
                  {note.content}
                </div>
              ))}
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full mt-2 bg-white/50 border-none rounded-lg p-3 text-sm focus:ring-0 placeholder:text-yellow-600/50 resize-none"
                placeholder="Add a quick note..."
                rows={3}
              />
            </div>
          </div>
        </aside>
      </div>

    </div>
  )
}
