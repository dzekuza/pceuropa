// Full-screen overlay so Puck's three-panel layout fills the entire viewport,
// not just the dashboard's content column.
export default function PuckEditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-white">
      {children}
    </div>
  )
}
