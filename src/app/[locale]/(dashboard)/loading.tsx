export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-pulse">
      <div className="pt-2 space-y-2">
        <div className="h-10 w-72 rounded-lg bg-gray-200" />
        <div className="h-4 w-96 rounded bg-gray-100" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[72px] rounded-2xl border border-gray-100 bg-gray-50" />
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-64 rounded-2xl border border-gray-100 bg-gray-50" />
        <div className="h-64 rounded-2xl border border-gray-100 bg-gray-50" />
      </div>
    </div>
  )
}
