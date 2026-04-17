import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "lib", "attendance.json");

export async function GET() {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      return NextResponse.json([]);
    }
    const data = fs.readFileSync(DATA_PATH, "utf8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading attendance:", error);
    return NextResponse.json({ error: "Failed to read attendance" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { guestId, name, status, tableNumber, tableName } = await request.json();
    
    let attendance = [];
    if (fs.existsSync(DATA_PATH)) {
      const data = fs.readFileSync(DATA_PATH, "utf8");
      attendance = JSON.parse(data);
    }

    // Check if guest already checked in
    const index = attendance.findIndex((a: any) => a.guestId === guestId);
    const newEntry = { guestId, name, status, tableNumber, tableName, timestamp: new Date().toISOString() };

    if (index > -1) {
      attendance[index] = newEntry;
    } else {
      attendance.push(newEntry);
    }

    fs.writeFileSync(DATA_PATH, JSON.stringify(attendance, null, 2));
    return NextResponse.json({ success: true, data: newEntry });
  } catch (error) {
    console.error("Error saving attendance:", error);
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}
