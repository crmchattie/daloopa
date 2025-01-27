import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  const apiUrl = `${baseUrl}/api/py/download_excel`
  
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
    
    const data = await response.blob()
    return new Response(data, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="RDDT Model.xlsx"'
      },
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
  }
} 