export function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#2a2e3c] bg-[#13151d]/85 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-4 pl-16 md:px-6 md:pl-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 fill-gray-500"
          >
            <path d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 10-.7.7l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
          </svg>
          <input
            type="text"
            placeholder="Search leads, services, ZIPs…"
            className="w-full rounded-lg border border-[#2a2e3c] bg-[#1a1d27] py-2 pl-9 pr-3 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Icon buttons */}
          <button
            className="relative rounded-lg p-2 text-gray-400 hover:bg-[#1f2330] hover:text-gray-200"
            aria-label="Notifications"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M12 22a2 2 0 002-2h-4a2 2 0 002 2zm6-6V11a6 6 0 00-5-5.9V4a1 1 0 10-2 0v1.1A6 6 0 006 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
          </button>
          <button
            className="rounded-lg p-2 text-gray-400 hover:bg-[#1f2330] hover:text-gray-200"
            aria-label="Settings"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M19.4 13a7.8 7.8 0 000-2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 00-1.7-1l-.4-2.5h-4l-.4 2.5a7.6 7.6 0 00-1.7 1l-2.4-1-2 3.4L4.6 11a7.8 7.8 0 000 2l-2 1.6 2 3.4 2.4-1c.5.4 1.1.8 1.7 1l.4 2.5h4l.4-2.5c.6-.2 1.2-.6 1.7-1l2.4 1 2-3.4-2-1.6zM12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" />
            </svg>
          </button>

          {/* User */}
          <div className="ml-2 flex items-center gap-3 border-l border-[#2a2e3c] pl-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-100">Squeegee Admin</p>
              <p className="text-[11px] text-gray-500">Operations</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white">
              SA
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
