import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const params = new URLSearchParams()
  req.nextUrl.searchParams.forEach((value, key) => {
    params.append(key, value)
  })
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  const apiUrl = `${baseUrl}/api/py/get_company${params.toString() ? `?${params.toString()}` : ''}`
  
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