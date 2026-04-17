import { NextResponse } from "next/server";
import { Storage } from "@/lib/storage";

export async function GET() {
  const attendance = await Storage.getAttendance();
  return NextResponse.json(attendance);
}

export async function POST(request: Request) {
  try {
    const { guestId, name, status, tableNumber, tableName } = await request.json();
    const attendance = await Storage.getAttendance();
    
    // Check if guest already checked in
    const index = attendance.findIndex((a: any) => a.guestId.toString() === guestId.toString());
    const newEntry = { 
      guestId, 
      name, 
      status, 
      tableNumber, 
      tableName, 
      timestamp: new Date().toISOString() 
    };

    let updatedAttendance = [...attendance];
    if (index > -1) {
      updatedAttendance[index] = newEntry;
    } else {
      updatedAttendance.push(newEntry);
    }

    await Storage.saveAttendance(updatedAttendance);
    return NextResponse.json({ success: true, data: newEntry });
  } catch (error) {
    console.error("Attendance POST Error:", error);
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}
