"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { ArrowRight } from "lucide-react"

interface CellPosition {
  row: number
  col: number
}

interface FormulaPromptProps {
  onAccept: (formula: string) => void
  onReject: () => void
  position: CellPosition
}

const prewrittenFormulas = [
  "=SUM(A1:A10)",
  "=AVERAGE(B1:B5)",
  "=MAX(C1:C20)",
  "=MIN(D1:D15)",
  "=COUNT(E1:E30)",
  '=IF(F1>100,"High","Low")',
  "=VLOOKUP(G1,A1:B10,2,FALSE)",
  '=CONCATENATE(H1," ",H2)',
  "=LEFT(I1,5)",
  "=RIGHT(J1,3)",
]

export default function FormulaPrompt({ onAccept, onReject, position }: FormulaPromptProps) {
  const [prompt, setPrompt] = useState("")
  const [generatedFormula, setGeneratedFormula] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const getColumnLabel = (index: number) => String.fromCharCode(65 + index)

  const getCurrentCellReference = () => `${getColumnLabel(position.col)}${position.row + 1}`

  const getPrompt = (description: string) => {
    return `I am currently in cell ${getCurrentCellReference()}. Generate an Excel formula for the following description: ${description}. 
    Consider the current cell position when generating relative references. 
    Only return the formula, nothing else. Do not add any markdown around the formula.`
  }

  const generateFormula = async (description: string) => {
    if (process.env.OPENAI_API_KEY) {
      try {
        const { text } = await generateText({
          model: openai("gpt-4o"),
          prompt: getPrompt(description),
        })
        return text
      } catch (error) {
        console.error("Error generating formula:", error)
        return "Error generating formula"
      }
    } else {
      return prewrittenFormulas[Math.floor(Math.random() * prewrittenFormulas.length)]
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const formula = await generateFormula(prompt)
    setGeneratedFormula(formula)
    setIsLoading(false)
  }

  return (
    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg p-2 z-50 w-80">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
        <Input
          ref={inputRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your formula..."
        />
        <Button type="submit" size="icon" variant="default" disabled={isLoading}>
          <ArrowRight className="h-4 w-4 text-white" />
        </Button>
      </form>
      {generatedFormula && (
        <div className="mt-2">
          <p className="mb-2">Generated Formula:</p>
          <code className="block p-2 bg-gray-100 rounded">{generatedFormula}</code>
          <div className="flex justify-between mt-2">
            <Button onClick={() => onAccept(generatedFormula)} variant="default">
              Accept
            </Button>
            <Button onClick={onReject} variant="outline">
              Reject
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

