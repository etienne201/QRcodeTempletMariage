import { NextResponse } from "next/server";
import { Storage } from "@/lib/storage";

export async function GET() {
  try {
    const tables = await Storage.getTables();
    return NextResponse.json(tables);
  } catch (error) {
    console.error("GET Tables Error:", error);
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tables = await request.json();
    await Storage.saveTables(tables);
    return NextResponse.json({ success: true, data: tables });
  } catch (error) {
    console.error("POST Tables Error:", error);
    return NextResponse.json({ error: "Failed to save tables" }, { status: 500 });
  }
}
