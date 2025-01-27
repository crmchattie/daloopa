"use client"

import { HotTable } from '@handsontable/react-wrapper'
import { registerAllModules } from 'handsontable/registry'
import { textRenderer, registerRenderer } from 'handsontable/renderers'
import 'handsontable/styles/handsontable.css'
import 'handsontable/styles/ht-theme-main.css'
import type { HotTableProps } from '@handsontable/react-wrapper'
import HyperFormula from 'hyperformula'
import { useState } from 'react'

import { RowData, TransformedData } from '@/lib/types'

// register Handsontable's modules
registerAllModules()

const hyperformulaInstance = HyperFormula.buildEmpty({
  // to use an external HyperFormula instance,
  // initialize it with the `'internal-use-in-handsontable'` license key
  licenseKey: 'internal-use-in-handsontable',
});

interface SpreadsheetProps {
  transformedData: TransformedData | null
  loading: boolean
  error: string | null
}

export default function Spreadsheet({ transformedData, loading, error }: SpreadsheetProps) {
  const [popover, setPopover] = useState({ 
    isVisible: false, 
    position: { x: 0, y: 0 },
    link: ''
  });

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  if (!transformedData) return <div className="flex justify-center items-center h-screen">No data available</div>

  const { rows, columns } = transformedData

  // Pre-process columns to check for borders
  const columnBorders = columns.map((col:any) => {
    const hasVerticalBorders = rows.some((row:any) => {
      const styling = row[`${col.key}-styling`]
      return styling?.border?.includes('left') && styling?.border?.includes('right')
    })
    return hasVerticalBorders
  })

  const getColumnLabel = (index: number): string => {
    let label = '';
    let currentIndex = index;

    while (currentIndex >= 0) {
      label = String.fromCharCode((currentIndex % 26) + 65) + label;
      currentIndex = Math.floor(currentIndex / 26) - 1;
    }

    return label;
  };

  // Register custom renderer
  registerRenderer('customRenderer', (hotInstance, TD, row, col, prop, value, cellProperties) => {
    const rowData = rows[row] as RowData
    if (!rowData) return TD

    // Format numbers for value columns (after index 3)
    if (col >= 4 && typeof value === 'number') {
      // Format number with commas and one decimal place
      let formattedValue = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
        signDisplay: 'never', // Don't show the minus sign
      }).format(Math.abs(value)) // Use absolute value

      if (rowData.unit === 'Dollar') {
        // Format number with commas and two decimal places, and add dollar sign
        formattedValue = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          signDisplay: 'never', // Don't show the minus sign
        }).format(Math.abs(value)) // Use absolute value
      }

      // Add parentheses for negative numbers
      if (value < 0) {
        formattedValue = `(${formattedValue})`
      }

      // Right align numeric values
      TD.style.textAlign = 'right'
      TD.style.paddingRight = '12px' // Add some padding on the right
      textRenderer(hotInstance, TD, row, col, prop, formattedValue, cellProperties)
    } else {
      textRenderer(hotInstance, TD, row, col, prop, value, cellProperties)
    }

    // Add tooltip for comments and links
    const link = rowData[`${prop}-link`]

    // Check for link
    if (link) {
      TD.title = `${link}`
    }

    // Reset styles
    TD.style.border = '0px'
    TD.style.paddingLeft = '12px'
    TD.style.borderTop = '0px'
    TD.style.borderBottom = '0px'
    TD.style.borderLeft = '0px'
    TD.style.borderRight = '0px'

    // If this column has any vertical borders, apply them to all cells
    if (columnBorders[col]) {
      TD.style.borderLeft = '1px solid black'
      TD.style.borderRight = '1px solid black'
    }

    // Apply styling based on row type
    switch (rowData.type) {
      case 'header':
        TD.style.background = '#000000'
        TD.style.color = 'white'
        TD.style.fontWeight = 'bold'
        TD.style.border = '1px solid #000000'
        break
      case 'section':
        TD.style.background = '#000080'
        TD.style.color = 'white'
        TD.style.border = '1px solid #000080'
        if (rowData.styling) {
          if (rowData.styling.text_bold) TD.style.fontWeight = 'bold'
          if (rowData.styling.indents) {
            TD.style.paddingLeft = `${(rowData.styling.indents * 24)}px`
          }
        }
        break
      case 'category':
        TD.style.fontWeight = 'bold'
        if (rowData.styling) {
          if (rowData.styling.text_bold) TD.style.fontWeight = 'bold'
          if (rowData.styling.indents) {
            TD.style.paddingLeft = `${(rowData.styling.indents * 24)}px`
          }
        }
        break
      case 'subcategory':
        if (rowData.styling) {
          if (rowData.styling.text_bold) TD.style.fontWeight = 'bold'
          if (rowData.styling.indents) {
            TD.style.paddingLeft = `${(rowData.styling.indents * 24)}px`
          }
        }
        break
      case 'subsubcategory':
        if (rowData.styling) {
          if (rowData.styling.text_bold) TD.style.fontWeight = 'bold'
          if (rowData.styling.indents) {
            TD.style.paddingLeft = `${(rowData.styling.indents * 24)}px`
          }
        }
        break
      case 'empty':
        TD.style.background = 'transparent'
        break
      default:
        // First column (name) uses the name's styling
        if (col === 0 && rowData.styling) {
          if (rowData.styling.text_bold) TD.style.fontWeight = 'bold'
          if (rowData.styling.indents) {
            TD.style.paddingLeft = `${(rowData.styling.indents * 24)}px`
          }
        }
        else if (col === 2) {
          TD.style.color = 'blue'
        }
        // Value columns (from index 4 onwards) use their specific styling
        else if (col >= 4) {
          const valueStyling = rowData[`${prop}-styling`]
          if (valueStyling) {
            if (valueStyling.text_bold) TD.style.fontWeight = 'bold'
            if (valueStyling.text_color) TD.style.color = valueStyling.text_color
            if (valueStyling.indents) {
              TD.style.paddingLeft = `${(valueStyling.indents * 24)}px`
            }
          }
        }

        // Apply row-level borders to all cells in the row
        if (rowData.styling?.border) {
          if (rowData.styling.border.includes('top')) {
            TD.style.borderTop = '1px solid black'
          }
          if (rowData.styling.border.includes('bottom')) {
            TD.style.borderBottom = '1px solid black'
          }
        }
    }

    return TD
  })

  const hotSettings: HotTableProps = {
    data: rows,
    colHeaders: columns.map((_:any, index:number) => getColumnLabel(index)),
    columns: columns.map((col:any, index:number) => ({
      data: col.key,
      type: 'text',
      width: col.width || 120,
      readOnly: false,
      renderer: 'customRenderer'
    })),
    licenseKey: 'non-commercial-and-evaluation',
    stretchH: 'all',
    autoWrapRow: true,
    autoWrapCol: true,
    contextMenu: true,
    manualColumnResize: true,
    manualRowResize: true,
    fixedRowsTop: 3,
    fixedColumnsLeft: 1,
    rowHeaders: true,
    formulas: {
      engine: hyperformulaInstance,
    },
    comments: true,
    cell: rows.map((row:any, rowIndex:number) => {
      const cells: any[] = [];

      // Add comments for value columns if they exist
      columns.forEach((col:any, colIndex:number) => {
        if (colIndex >= 4) { // Value columns start at index 4
          const comment = row[`${col.key}-comment`]
          
          if (comment) {
            const commentParts = []
            if (comment) commentParts.push(`Comment: ${comment}`)
            
            cells.push({
              row: rowIndex,
              col: colIndex,
              comment: {
                value: commentParts.join('\n'),
                readOnly: true
              }
            });
          }
        }
      });

      return cells;
    }).flat(),

    // Add back mouse event handlers for popover
    afterOnCellMouseOver: (event: MouseEvent, coords) => {
      if (!coords) return;
      if (popover.isVisible) return; // Don't update if popover is already visible
      
      const row = coords.row;
      const col = coords.col;
      const prop = columns[col]?.key;
      
      if (!prop) return;

      const rowData = rows[row];
      if (!rowData) return;

      let link: string | undefined;

      // Handle different column types
      if (col === 2) {
        link = rowData.source_link;
      } else if (col >= 4) {
        link = rowData[`${prop}-link`] || undefined;
      }
      
      if (link) {
        setPopover({
          isVisible: true,
          position: { x: event.clientX, y: event.clientY },
          link: link || ''
        });
      }
    },

    // Add cell click handler
    afterOnCellMouseDown: (event: MouseEvent, coords) => {
      if (!coords) return;
      
      const row = coords.row;
      const col = coords.col;
      const prop = columns[col]?.key;
      
      if (!prop) return;

      const rowData = rows[row];
      if (!rowData) return;

      let link: string | undefined;

      // Handle different column types
      if (col === 2) {
        link = rowData.source_link;
      } else if (col >= 4) {
        link = rowData[`${prop}-link`] || undefined;
      }
      
      if (link) {
        window.open(link, '_blank');
        // openSidebar(link);
      }
    }
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <div className="h-full w-full overflow-auto">
        <div className="ht-theme-main">
          <HotTable {...hotSettings} />
        </div>
      </div>
    </div>
  )
}

