export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
