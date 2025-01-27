interface FinancialMetric {
  name: { name: string }
  values: { period: string; value: number | string }[]
}

interface FinancialData {
  metrics: FinancialMetric[]
}

export function transformDataForGrid(data: FinancialData) {
  if (!data || !data.metrics || data.metrics.length === 0) {
    return { columns: [], rows: [] }
  }

  const periods = data.metrics[0].values.map((v) => v.period)
  const columns = [{ key: "metric", name: "Metric" }, ...periods.map((period) => ({ key: period, name: period }))]

  const rows = data.metrics.map((metric) => {
    const row: { [key: string]: string | number } = { metric: metric.name.name }
    metric.values.forEach((v) => {
      row[v.period] = v.value
    })
    return row
  })

  return { columns, rows }
}

export function transformGridData(columns: { key: string; name: string }[], rows: any[]): FinancialData {
  const metrics: FinancialMetric[] = rows.map((row) => {
    const name = { name: row.metric }
    const values = columns.slice(1).map((col) => ({
      period: col.key,
      value: row[col.key],
    }))
    return { name, values }
  })

  return { metrics }
}

