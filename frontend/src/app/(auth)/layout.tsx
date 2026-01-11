import Header from '@/components/header'


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}