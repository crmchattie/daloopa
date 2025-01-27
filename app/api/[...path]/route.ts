import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const path = req.nextUrl.pathname.replace('/api/', '')
  const searchParams = req.nextUrl.searchParams
  // In development, use FastAPI server, in production use same server
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? process.env.NEXT_PUBLIC_API_URL 
    : ''
  const apiUrl = `${baseUrl}/api/${path}?${searchParams}`

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': req.headers.get('Authorization') || '',
      },
    })
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const path = req.nextUrl.pathname.replace('/api/', '')
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? process.env.NEXT_PUBLIC_API_URL 
    : ''
  const apiUrl = `${baseUrl}/api/${path}`

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

