export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
      <main className="container py-8">{children}</main>
    </div>
  )
}
