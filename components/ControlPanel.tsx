"use client"


interface ControlPanelProps {
  onUpdateData: () => void;
}

export function ControlPanel({ onUpdateData }: ControlPanelProps) {
  const handleDownloadExcel = async () => {
    try {
      const response = await fetch('/api/download_excel', {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa('daloopa:MGIGYv1MMAE5BheY'),
        },
      })

      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'RDDT Model.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download Excel file:', error)
      // You might want to add a toast notification here
    }
  }

  return (
    <div className="w-full bg-white border-b shadow-sm p-4 flex items-center gap-4">
      <button
        onClick={onUpdateData}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Pull Data
      </button>
      <button
        onClick={handleDownloadExcel}
        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        Download Excel
      </button>
    </div>
  )
} 