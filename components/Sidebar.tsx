"use client"

import { useEffect, useState } from "react"

type Section = { id: string; label: string; icon: JSX.Element }

const SECTIONS: Section[] = [
  {
    id: "executive",
    label: "Executive Overview",
    icon: (
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
    ),
  },
  {
    id: "revenue-mix",
    label: "Revenue Mix",
    icon: (
      <path d="M3 3v18h18v-2H5V3H3zm14 5l-4 4-3-3-4 4 1.4 1.4L10 12l3 3 5.4-5.4L20 11V6h-5l2 2z" />
    ),
  },
  {
    id: "lead-quality",
    label: "Lead Quality",
    icon: (
      <path d="M12 2l2.4 6.5L21 9l-5 4 1.8 7L12 16.5 6.2 20 8 13 3 9l6.6-.5L12 2z" />
    ),
  },
  {
    id: "strategic",
    label: "Strategic",
    icon: (
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a6 6 0 110 12 6 6 0 010-12zm0 4a2 2 0 100 4 2 2 0 000-4z" />
    ),
  },
  {
    id: "margin",
    label: "Margin Protection",
    icon: (
      <path d="M12 1L3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-4zm-1 14l-4-4 1.4-1.4L11 12.2l4.6-4.6L17 9l-6 6z" />
    ),
  },
  {
    id: "operations",
    label: "Operations",
    icon: (
      <path d="M19.4 13a7.8 7.8 0 000-2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 00-1.7-1l-.4-2.5h-4l-.4 2.5a7.6 7.6 0 00-1.7 1l-2.4-1-2 3.4L4.6 11a7.8 7.8 0 000 2l-2 1.6 2 3.4 2.4-1c.5.4 1.1.8 1.7 1l.4 2.5h4l.4-2.5c.6-.2 1.2-.6 1.7-1l2.4 1 2-3.4-2-1.6zM12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" />
    ),
  },
  {
    id: "contacts",
    label: "Customer Contacts",
    icon: (
      <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.4 0-8 2.2-8 5v3h16v-3c0-2.8-3.6-5-8-5z" />
    ),
  },
]

export function Sidebar() {
  const [active, setActive] = useState<string>(SECTIONS[0].id)
  const [open, setOpen] = useState(false)

  // Highlight the section currently in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: "-40% 0px -55% 0px" }
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Mobile open button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-3 z-50 rounded-md border border-[#2a2e3c] bg-[#1a1d27] p-2 text-gray-300 md:hidden"
        aria-label="Open menu"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
        </svg>
      </button>

      {/* Backdrop on mobile */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#2a2e3c] bg-[#13151d] transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-[#2a2e3c] px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M4 4h16v4H4V4zm0 6h10v4H4v-4zm0 6h16v4H4v-4z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-white">Squeegee Squad</p>
            <p className="text-[11px] text-gray-500">LA · Lead dashboard</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
            Dashboard
          </p>
          {SECTIONS.map((s) => {
            const isActive = active === s.id
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setOpen(false)}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600/90 to-indigo-600/80 text-white shadow-md shadow-blue-900/30"
                    : "text-gray-400 hover:bg-[#1f2330] hover:text-gray-100"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`h-[18px] w-[18px] shrink-0 ${
                    isActive ? "fill-white" : "fill-gray-500 group-hover:fill-gray-300"
                  }`}
                >
                  {s.icon}
                </svg>
                {s.label}
              </a>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#2a2e3c] px-4 py-3">
          <div className="rounded-lg bg-[#1a1d27] px-3 py-2.5">
            <p className="text-[11px] text-gray-500">Live data</p>
            <p className="text-xs text-emerald-400">● Synced from Google Sheet</p>
          </div>
        </div>
      </aside>
    </>
  )
}
