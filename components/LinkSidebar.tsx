"use client"

import { useSidebar } from "@/contexts/SidebarContext"

export function LinkSidebar() {
  const { isOpen, link, closeSidebar } = useSidebar()

  const handleOpenInNewTab = () => {
    window.open(link, '_blank')
  }

  return (
    <aside
      className={`h-full shrink-0 bg-white border-l transition-all duration-300 ease-in-out ${
        isOpen ? "w-96" : "w-0"
      }`}
    >
      {isOpen && (
        <div className="flex h-full flex-col w-96">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-lg font-semibold">Link Preview</h2>
            <div className="flex gap-2">
              <button 
                onClick={handleOpenInNewTab}
                className="rounded-lg p-2 hover:bg-blue-50 text-blue-600"
                aria-label="Open in new tab"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
              <button 
                onClick={closeSidebar}
                className="rounded-lg p-2 hover:bg-gray-100"
                aria-label="Close sidebar"
              >
                <svg
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 p-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600 break-all">{link}</p>
              <button
                onClick={handleOpenInNewTab}
                className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Open in New Tab
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}