"use client"

import Spreadsheet from "@/components/Spreadsheet"
import { ControlPanel } from "@/components/ControlPanel"
import { useFinancialData } from "@/hooks/useFinancialData"

export default function Home() {
  const { transformedData, loading, error, fetchData } = useFinancialData()

  const handleUpdateData = async () => {
    try {
      await fetchData()
      console.log("Data updated successfully")
    } catch (error) {
      console.error('Failed to update data:', error)
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="flex-1 min-w-0 flex flex-col">
        <ControlPanel onUpdateData={handleUpdateData} />
        <main className="flex-1 bg-gray-100 overflow-hidden">
          <Spreadsheet 
            transformedData={transformedData}
            loading={loading}
            error={error}
          />
        </main>
      </div>
    </div>
  )
}


