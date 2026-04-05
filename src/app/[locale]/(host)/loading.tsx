export default function HostLoading() {
  return (
    <div className="space-y-5 md:space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-gray-200" />
        <div className="h-4 w-80 rounded bg-gray-100" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-lg border bg-gray-50" />
        ))}
      </div>
      <div className="h-80 rounded-lg border bg-gray-50" />
    </div>
  )
}
