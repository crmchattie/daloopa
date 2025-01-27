"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface FormulaPopoverProps {
  onAccept: (formula: string) => void
  onReject: () => void
}

export default function FormulaPopover({ onAccept, onReject }: FormulaPopoverProps) {
  const [prompt, setPrompt] = useState("")
  const [generatedFormula, setGeneratedFormula] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Generate an Excel formula for the following description: ${prompt}. Only return the formula, nothing else.`,
      })
      setGeneratedFormula(text)
    } catch (error) {
      console.error("Error generating formula:", error)
      setGeneratedFormula("Error generating formula")
    }
    setIsLoading(false)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Formula Helper</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form onSubmit={handleSubmit}>
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your formula..."
            className="mb-2"
          />
          <Button type="submit" disabled={isLoading} className="w-full mb-2">
            {isLoading ? "Generating..." : "Generate Formula"}
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
      </PopoverContent>
    </Popover>
  )
}

