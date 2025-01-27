import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { FinancialData, TransformedData } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useFinancialData() {
  const [data, setData] = useState<FinancialData | null>(null)
  const [transformedData, setTransformedData] = useState<TransformedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const fullUrl = `${API_URL}/api/get_company`
      console.log('Attempting to fetch from:', fullUrl)
      console.log('Environment:', process.env.NODE_ENV)
      console.log('API_URL:', process.env.NEXT_PUBLIC_API_URL)
      
      const response = await axios.get<{ success: boolean; data: FinancialData }>(
        fullUrl,
        {
          params: { ticker: "RDDT" },
          auth: {
            username: 'daloopa',
            password: 'MGIGYv1MMAE5BheY',
          },
          withCredentials: true,
        },
      )
      setData(response.data.data)
      transformData(response.data.data)
      setError(null)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Full error:", err)
        console.error("Error response:", err.response)
        console.error("Error request config:", err.config)
        setError(`Failed to fetch data: ${err.message}`)
        console.error("Axios error:", err.response?.data || err.message)
      } else {
        setError("An unexpected error occurred")
        console.error("Unexpected error:", err)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const formatValue = useCallback((value: any): string | number => {
    if (value === null || value === undefined) {
      return ''
    }

    // Convert string numbers to actual numbers
    if (typeof value === "string") {
      // Handle currency strings (e.g. "$1,234.56")
      if (value.startsWith("$")) {
        const numStr = value.replace(/[$,]/g, '')
        const num = parseFloat(numStr)
        return isNaN(num) ? value : num
      }
      
      // Handle regular number strings
      const num = parseFloat(value.replace(/,/g, ''))
      if (!isNaN(num)) {
        if (num >= 1000000) {
          return Number((num / 1000000).toFixed(1))
        }
        return num
      }
      return value
    }

    // Handle existing numbers
    if (typeof value === "number") {
      if (value >= 1000000) {
        return Number((value / 1000000).toFixed(1))
      }
      return value
    }

    return value?.toString() || ""
  }, [])

  const formatDate = (dateString: string): string => {
    if (!dateString) return ""
    // Remove the time portion and any 'T' separator
    const date = new Date(dateString.split("T")[0])
    // Format as mm/dd/yyyy
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}/${date.getFullYear()}`
  }

  const transformData = useCallback(
    (data: FinancialData) => {
      if (!data || !data.metrics || data.metrics.length === 0) {
        setTransformedData(null)
        return
      }

      const firstMetric = data.metrics[0]
      const periods = firstMetric.values.map((v) => v.period)
      const fiscalPeriods = firstMetric.values.map((v) => v.fiscal)
      const fiscalDates = firstMetric.values.map((v) => v.fiscal_date)

      const columns = [
        {
          key: 'name',
          name: 'Name',
          width: 250,
        },
        {
          key: 'unit',
          name: 'Unit',
          width: 100,
        },
        {
          key: 'source',
          name: 'Source',
          width: 100,
        },
        {
          key: 'tag_id',
          name: 'Tag ID',
          width: 100,
        },
        ...periods.map((period) => ({
          key: period,
          name: period,
          width: 120,
        })),
      ]

      let rowIndex = 0
      const rows: any[] = [
        {
          id: "header-calendar",
          type: "header",
          name: "Calendar",
          unit: "Unit",
          source: "Source",
          tag_id: "Tag ID",
          ...Object.fromEntries(periods.map((period, index) => [periods[index], period])),
        },
        {
          id: "header-fiscal",
          type: "header",
          name: "Fiscal",
          ...Object.fromEntries(fiscalPeriods.map((fiscalPeriod, index) => [periods[index], fiscalPeriod])),
        },
        {
          id: "header-fiscalDate",
          type: "header",
          name: "Fiscal Date",
          ...Object.fromEntries(fiscalDates.map((fiscalDate, index) => [periods[index], formatDate(fiscalDate)])),
        },
        {
          id: `section-document-${rowIndex++}`,
          type: "section",
          name: "Document",
          styling: {
            text_bold: true,
            background_color: "#000080",
            text_color: "white"
          }
        },
        {
          id: `empty-${rowIndex++}`,
          type: "empty",
          name: "",
        },
      ]

      const addedSections = new Set<string>()
      const addedCategories = new Set<string>()
      const addedSubcategories = new Set<string>()
      const addedSubsubcategories = new Set<string>()
      
      data.metrics.forEach((metric) => {
        // Add section row if not already added
        const sectionId = `${metric.section.name}-${metric.section.order}`
        if (metric.section.name && !addedSections.has(sectionId)) {
          rows.push({
            id: `section-${sectionId}-${rowIndex++}`,
            type: "section",
            name: metric.section.name,
            styling: metric.section.styling,
          })
          if (metric.section.empty_row_after) {
            rows.push({
              id: `empty-${rowIndex++}`,
              type: "empty",
              name: "",
            })
          }
          addedSections.add(sectionId)
        }

        // Add category row if not already added
        const categoryId = `${metric.category.name}-${metric.category.order}`
        if (metric.category.name && !addedCategories.has(categoryId)) {
          rows.push({
            id: `category-${categoryId}-${rowIndex++}`,
            type: "category",
            name: metric.category.name,
            styling: metric.category.styling,
          })
          if (metric.category.empty_row_after) {
            rows.push({
              id: `empty-${rowIndex++}`,
              type: "empty",
              name: "",
            })
          }
          addedCategories.add(categoryId)
        }

        // Add subcategory row if it exists and not already added
        const subcategoryId = `${metric.subcategory.name}-${metric.subcategory.order}`
        if (metric.subcategory.name && !addedSubcategories.has(subcategoryId)) {
          rows.push({
            id: `subcategory-${subcategoryId}-${rowIndex++}`,
            type: "subcategory",
            name: metric.subcategory.name,
            styling: metric.subcategory.styling,
          })
          if (metric.subcategory.empty_row_after) {
            rows.push({
              id: `empty-${rowIndex++}`,
              type: "empty",
              name: "",
            })
          }
          addedSubcategories.add(subcategoryId)
        }

        // Add subsubcategory row if it exists and not already added
        const subsubcategoryId = `${metric.subsubcategory.name}-${metric.subsubcategory.order}`
        if (metric.subsubcategory.name && !addedSubsubcategories.has(subsubcategoryId)) {
          rows.push({
            id: `subsubcategory-${subsubcategoryId}-${rowIndex++}`,
            type: "subsubcategory", 
            name: metric.subsubcategory.name,
            styling: metric.subsubcategory.styling,
          })
          if (metric.subsubcategory.empty_row_after) {
            rows.push({
              id: `empty-${rowIndex++}`,
              type: "empty",
              name: "",
            })
          }
          addedSubsubcategories.add(subsubcategoryId)
        }

        // Add data row
        const dataRow: any = {
          id: `data-${metric.tag_id}-${rowIndex++}`,
          type: "data",
          name: metric.name.name,
          unit: metric.unit,
          source: metric.source.value,
          source_link: metric.source.link,
          tag_id: metric.tag_id,
          styling: metric.name.styling,
        }

        metric.values.forEach((value) => {
          const formattedValue = formatValue(value.value)
          dataRow[value.period] = formattedValue
          dataRow[`${value.period}-styling`] = value.styling
          dataRow[`${value.period}-comment`] = value.comment
          dataRow[`${value.period}-link`] = value.link
        })

        rows.push(dataRow)
        
        if (metric.name.empty_row_after) {
          rows.push({
            id: `empty-${rowIndex++}`,
            type: "empty",
            name: "",
          })
        }
      })

      setTransformedData({ rows, columns })
    },
    [formatValue],
  )

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, transformedData, loading, error, fetchData }
}

