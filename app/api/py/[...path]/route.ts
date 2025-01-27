import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const query = searchParams.toString()
  const path = req.nextUrl.pathname.replace("/api/py", "")
  const url = `${process.env.NEXT_PUBLIC_FASTAPI_URL}${path}${query ? `?${query}` : ""}`

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
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

