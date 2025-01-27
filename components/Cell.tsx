"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import FormulaPrompt from "./FormulaPrompt"

interface CellPosition {
  row: number
  col: number
}

interface CellProps {
  value: string
  onChange: (value: string) => void
  type?: "header" | "section" | "category" | "subcategory" | "data" | "empty"
  position: CellPosition
  isActive: boolean
  onActivate: () => void
  styling?: {
    text_bold?: boolean
    text_color?: string
    background_color?: string
  }
}

export default function Cell({ value, onChange, type = "data", position, isActive, onActivate, styling }: CellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showPopover, setShowPopover] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      onActivate()
    }
  }, [isEditing, onActivate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    if (newValue === "=") {
      setShowPopover(true)
    } else if (newValue.startsWith("=") && !showPopover) {
      setShowPopover(true)
    } else if (!newValue.startsWith("=") && showPopover) {
      setShowPopover(false)
    }
  }

  const handleAccept = (formula: string) => {
    onChange(formula)
    setShowPopover(false)
    setIsEditing(false)
  }

  const handleReject = () => {
    setShowPopover(false)
  }

  const getCellStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      alignItems: "center",
      fontFamily: "Arial, sans-serif",
      fontSize: "14px",
      padding: "8px 12px",
      margin: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      boxSizing: "border-box",
    }

    let cellStyle: React.CSSProperties = { ...baseStyle }

    switch (type) {
      case "header":
        cellStyle = {
          ...cellStyle,
          backgroundColor: "#000000",
          color: "white",
          fontWeight: "bold",
          // justifyContent: "center",
          border: "1px solid #000000", // Match border color to background
        }
        break
      case "section":
        cellStyle = {
          ...cellStyle,
          backgroundColor: "#000080",
          color: "white",
          fontWeight: "bold",
          border: "1px solid #000080", // Match border color to background
        }
        break
      case "category":
        cellStyle = {
          ...cellStyle,
          fontWeight: "bold",
          backgroundColor: "transparent",
        }
        break
      case "subcategory":
        cellStyle = {
          ...cellStyle,
          // paddingLeft: "24px",
          backgroundColor: "transparent",
        }
        break
      case "empty":
        cellStyle = {
          ...cellStyle,
          backgroundColor: "transparent",
        }
        break
      default:
        const isNumeric =
          typeof value === "number" || (typeof value === "string" && !isNaN(Number(value.replace(/[^0-9.-]+/g, ""))))
        cellStyle = {
          ...cellStyle,
          fontWeight: styling?.text_bold ? "bold" : "normal",
          color: "black",
          backgroundColor: "transparent",
          // justifyContent: isNumeric ? "flex-end" : "flex-start",
        }
    }

    return cellStyle
  }

  return (
    <div className="absolute inset-0" style={{ margin: 0, padding: 0 }}>
      {isEditing && type === "data" ? (
        <Input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onBlur={() => setIsEditing(false)}
          className="absolute inset-0 border-blue-500 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 z-10"
        />
      ) : (
        <div
          style={getCellStyle()}
          className={`cursor-text ${isActive ? "outline outline-2 outline-blue-500 z-10" : ""}`}
          onClick={() => {
            if (type === "data") {
              setIsEditing(true)
              onActivate()
            }
          }}
        >
          {value}
        </div>
      )}
      {showPopover && <FormulaPrompt onAccept={handleAccept} onReject={handleReject} position={position} />}
    </div>
  )
}

