import { NextResponse } from "next/server"
import type { Planting } from "@/lib/types"

// This would typically connect to a database
const plantings: Planting[] = []

export async function POST(request: Request) {
  try {
    const planting = await request.json()

    // Validate the planting data
    if (!planting.city || !planting.crop) {
      return NextResponse.json({ error: "Şehir ve ürün bilgisi gereklidir" }, { status: 400 })
    }

    // Add ID if not provided
    if (!planting.id) {
      planting.id = plantings.length + 1
    }

    // Add to our "database"
    plantings.push(planting)

    return NextResponse.json({ success: true, planting })
  } catch (error) {
    console.error("Error processing planting:", error)
    return NextResponse.json({ error: "İşlem sırasında bir hata oluştu" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ plantings })
}
