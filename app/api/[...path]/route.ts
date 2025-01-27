import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const path = req.nextUrl.pathname.replace('/api/py/', '')
  // In development, use FastAPI server, in production use same server
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? process.env.NEXT_PUBLIC_API_URL 
    : ''
  const apiUrl = `${baseUrl}/api/py/${path}`
  
  console.log('Request URL:', apiUrl)
  console.log('Environment:', process.env.NODE_ENV)
  console.log('Base URL:', baseUrl)

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': req.headers.get('Authorization') || '',
      },
    })
    
    if (!response.ok) {
      console.error('API response error:', await response.text())
      throw new Error(`API responded with status ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const path = req.nextUrl.pathname.replace('/api/py/', '')
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? process.env.NEXT_PUBLIC_API_URL 
    : ''
  const apiUrl = `${baseUrl}/api/py/${path}`

  try {
    const body = await req.json()
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': req.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    })
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

