import React, { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function WebhookTester() {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [payload, setPayload] = useState("")
  const [response, setResponse] = useState("")

  const testWebhook = async () => {
    try {
      const res = await axios.post(webhookUrl, JSON.parse(payload))
      setResponse(JSON.stringify(res.data, null, 2))
    } catch (error) {
      setResponse(`Error: ${error}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhook Tester</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="Enter webhook URL"
            />
          </div>
          <div>
            <Label htmlFor="payload">Payload (JSON)</Label>
            <textarea
              id="payload"
              className="w-full h-32 p-2 border rounded"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              placeholder="Enter JSON payload"
            />
          </div>
          <Button onClick={testWebhook}>Test Webhook</Button>
          {response && (
            <div>
              <Label>Response:</Label>
              <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{response}</pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

