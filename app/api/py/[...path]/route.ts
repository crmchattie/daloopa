import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const path = req.nextUrl.pathname.replace('/api/py/', '')
  const searchParams = req.nextUrl.searchParams
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/${path}?${searchParams}`

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': req.headers.get('Authorization') || '',
      },
    })
    
    const data = await response.json()
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

export async function POST(req: NextRequest) {
  const path = req.nextUrl.pathname.replace("/api/py", "")
  const url = `${process.env.NEXT_PUBLIC_FASTAPI_URL}${path}`

  try {
    const body = await req.json()
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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

