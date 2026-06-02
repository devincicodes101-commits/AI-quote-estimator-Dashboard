const SECTIONS = [
  { id: "executive", label: "Executive" },
  { id: "revenue-mix", label: "Revenue Mix" },
  { id: "lead-quality", label: "Lead Quality" },
  { id: "strategic", label: "Strategic" },
  { id: "margin", label: "Margin" },
  { id: "operations", label: "Operations" },
]

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Squeegee Squad LA</h1>
          <p className="text-xs text-gray-500">Lead & revenue dashboard</p>
        </div>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-md px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
